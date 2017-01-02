import {AbstractTask, append_color_patch} from "./AbstractTask";
import {
    random_sample,
    rgb_to_css,
    get_euclidean_distance_for_error,
    update_mathjax,
    remove_from_array
} from "../util";
import {VisualizationControlSlider} from "../controls/VisualizationControlSlider";
import {get_color_system_by_name} from "../color-systems/color-systems";


export class ColorMatchingTask extends AbstractTask {
    constructor(exercise, task_num, options) {
        super(exercise, task_num, options);
        let defaults = {
            color_systems: ["rgb", "hsl", "hsv", "cmy"], // cmyk not included for now because k depends on cmy...
            show_target_visualization: false, // TODO: implement
            show_conversion_visualization: false, // TODO: implement
            max_euclidean_distance: get_euclidean_distance_for_error(.05, 3), // 5% error allowed
            show_current_color: true,
            show_target_color: true, // If false, the numerical representation will be shown.
            show_hints: true,
            max_attempts: 3, // 0 => infinite
            allow_skip_after_first_attempt: true,
            easy_hsl_hsv_colors: false
        };
        let actual = $.extend({}, defaults, options || {});

        this.show_conversion_visualization = actual.show_conversion_visualization;
        this.show_target_visualization = actual.show_target_visualization;
        this.is_conversion_task = !actual.show_target_color;
        this.show_target_color = actual.show_target_color;
        this.show_current_color = actual.show_current_color;
        this.show_hints = actual.show_hints;

        this.max_euclidean_distance = actual.max_euclidean_distance;
        this.target_system_name = random_sample(actual.color_systems);

        /* For if this is a conversion task: */
        let remaining_color_systems = actual.color_systems.slice(); // (copy array)
        remove_from_array(remaining_color_systems, this.target_system_name);
        let conversion_system_name = random_sample(remaining_color_systems);

        this.target_color = get_color_system_by_name(this.target_system_name,
            this.is_conversion_task && this.random_units);
        this.$target_color = null;
        this.$current_color = null;
        this._sliders = [];
        this.$exercise_button_bar = null;
        this.$hint_label = null;
        this.$submit_button = null;
        this.$next_button = null;
        this.$feedback = null;
        this.max_attempts = actual.max_attempts;
        this.current_attempt = 0;
        this.allow_skip_after_first_attempt = actual.allow_skip_after_first_attempt;
        this.easy_hsl_hsv_colors = actual.easy_hsl_hsv_colors;

        /* Randomize and, if necessary, convert target color. */
        this.target_color.randomize(
            this.easy_hsl_hsv_colors && (
                this.target_system_name == "hsl" || this.target_system_name == "hsv" ||
                conversion_system_name == "hsl" || conversion_system_name == "hsv"
            )
        ); // easy iff easy_hsl_hsv_colors and target or current is hsl or hsv
        this.converted_target_color = null;
        if (this.is_conversion_task) {
            this.converted_target_color = get_color_system_by_name(conversion_system_name, this.random_units);
            let target_rgb = this.target_color.get_rgb();
            this.converted_target_color.set_from_rgb(target_rgb.r, target_rgb.g, target_rgb.b);
            this.current_color = get_color_system_by_name(conversion_system_name, false);
            this.current_color.change_units_to(this.converted_target_color.properties[0].color_system_units);
        } else {
            this.current_color = get_color_system_by_name(this.target_system_name, false);
        }
        /* Also randomize current color (for the sliders). */
        this.current_color.randomize();

        /* Attach listener to current color properties. */
        for (let property of this.current_color.properties) {
            property.add_listener((event) => this.on_current_color_change(event));
        }
    }

    run() {
        super.run();

        if (this.is_conversion_task) {
            this.attach_task_title(
                "Convert the color " +
                "\\(" + this.target_color.get_tex() + "\\) to " + this.converted_target_color.get_name() + "."
            );
            update_mathjax(this.$task_title);
        } else {
            this.attach_task_title(
                "Adjust the " + this.current_color.get_name() +
                " parameters to match the color on the right to the color on the left."
            );
        }

        /* Attach color patches. */
        if (this.show_target_color) {
            this.$target_color = $('<div class="color-matching-target"></div>').appendTo(this.$container);
            let target_rgb = this.target_color.get_rgb();
            this.$target_color.css("background-color", rgb_to_css(
                target_rgb.r, target_rgb.g, target_rgb.b));
        }
        if (this.show_current_color) {
            this.$current_color = $('<div class="color-matching-current"></div>').appendTo(this.$container);
            this.on_current_color_change(null);
        }

        /* Attach sliders. */
        this.$container.append(
            '<div class="color-matching-sliders visualization-controls"></div>'
        );
        let $sliders_container = $('<table class="controls-table"></table>').appendTo(
            this.$container.find(".color-matching-sliders")
        );
        for (let i = 0; i < this.current_color.properties.length; i++) {
            this._sliders.push(new VisualizationControlSlider(
                $sliders_container,
                this.current_color.properties[i],
                0.001,
                (value) => this.current_color.is_valid(value, i)
            ))
        }

        /* Attach buttons (right to left). */
        this.$exercise_button_bar = $(
            '<div class="exercise-button-bar"></div>'
        ).appendTo(this.$container);
        this.$next_button = $(
            '<button class="exercise-next-task" disabled>Next</button>'
        ).appendTo(this.$exercise_button_bar);
        this.$submit_button = $(
            '<button class="exercise-submit">Submit answer</button>'
        ).appendTo(this.$exercise_button_bar);
        if (this.show_hints) {
            this.$hint_label = $(
                '<span class="exercise-hint-label">Not there yet</span>' // TODO: initialize correctly!
            ).insertBefore($sliders_container);
        }

        this.$submit_button.click(() => this.on_submit_click());
        this.$next_button.click(() => this.on_next_click());
    }

    on_current_color_change(event) {
        if (this.show_current_color) {
            /* Update current color patch. */
            let current_rgb = this.current_color.get_rgb();
            this.$current_color.css("background-color", rgb_to_css(
                current_rgb.r, current_rgb.g, current_rgb.b));
        }

        if (this.show_hints && this.$hint_label != null) {
            let euclidean_distance_rgb = this.target_color.get_euclidean_distance_rgb(this.current_color);
            if (euclidean_distance_rgb <= this.max_euclidean_distance) {
                this.$hint_label.text("Close enough");
            } else if (euclidean_distance_rgb <= this.max_euclidean_distance * 2) {
                this.$hint_label.text("Almost there!");
            } else if (euclidean_distance_rgb <= this.max_euclidean_distance * 4) {
                this.$hint_label.text("You're close!");
            } else {
                this.$hint_label.text("Not there yet");
            }
        }
    }

    on_submit_click() {
        let euclidean_distance_rgb = this.target_color.get_euclidean_distance_rgb(this.current_color);
        this.stats.correct = euclidean_distance_rgb <= this.max_euclidean_distance;
        this.current_attempt += 1;
        let feedback_str = "";

        /* Make feedback container if it doesn't already exist. */
        if (this.$feedback == null) {
            this.$feedback = $('<div class="exercise-feedback"></div>')
                .insertBefore(this.$container.find(".exercise-button-bar"));
        }

        let exact_result_tex = this.is_conversion_task ?
            this.converted_target_color.get_tex() : this.target_color.get_tex();
        if (this.stats.correct) {
            this.stats.attempts = this.current_attempt;
            this.stats.skipped = false;
            this.$next_button.attr("disabled", false);
            this.$submit_button.attr("disabled", true);
            this.$feedback.removeClass("wrong");
            this.$feedback.addClass("correct");
            feedback_str += "<em>Correct!</em> ";
            feedback_str += "The exact result is \\(" + exact_result_tex + "\\).<br/>";
            this.$feedback.html(feedback_str);
            if (this.is_conversion_task) {
                append_color_patch(this.$feedback, this.target_color);
            }
            if (!this.show_current_color) {
                this.$feedback.append("Your selection:");
                append_color_patch(this.$feedback, this.current_color);
            }
            update_mathjax(this.$feedback);
        } else {
            if (this.allow_skip_after_first_attempt || this.current_attempt == this.max_attempts) {
                /* (Because this.current_attempt starts at 0, max_attempts=0 means infinite attempts.) */
                this.$next_button.attr("disabled", false);
            }
            this.$feedback.removeClass("correct"); // just in case
            this.$feedback.addClass("wrong");
            feedback_str += "<em>Wrong.</em> ";
            if (this.max_attempts != 0) {
                feedback_str += "Attempt " + this.current_attempt + "/" + this.max_attempts + ". ";
                feedback_str += "The two colors are not similar enough.<br/>";
                if (this.current_attempt == this.max_attempts) {
                    this.$submit_button.attr("disabled", true);
                    this.stats.skipped = false;
                    this.$feedback.html(feedback_str);
                    if (this.is_conversion_task) {
                        this.$feedback.append("The exact result is \\(" + exact_result_tex + "\\).<br/>");
                        append_color_patch(this.$feedback, this.target_color);
                        update_mathjax(this.$feedback);
                    }
                    if (!this.show_current_color) {
                        this.$feedback.append("Your selection:");
                        append_color_patch(this.$feedback, this.current_color);
                    }
                } else {
                    this.$feedback.html(feedback_str);
                }
            } else {
                feedback_str += "The two colors are not similar enough.<br/>";
                this.$feedback.html(feedback_str);
            }
        }

        feedback_str = "Maximum difference in RGB: " + this.max_euclidean_distance.toFixed(3) +
                ".<br/>Current difference in RGB: " + euclidean_distance_rgb.toFixed(3);
        this.$feedback.append(feedback_str);
    }

    on_next_click() {
        this.exercise.on_task_finished(this);
    }
}

export function get_color_matching_results_rows(conversion_tasks_only, matching_tasks_only) {
    let header = conversion_tasks_only ? "Color Conversion" : "Color Matching";
    let html = '<th><td>' + header + ' </td></th>';
    html += "";
    // TODO
}

export function show_color_matching_options(task_type, default_task_type, $options_table,
        conversion_task=false) {
    if (!conversion_task) {
        $options_table.append('<th colspan="2">Color Matching Options</th>');
    } else {
        $options_table.append('<th colspan="2">Color Conversion Options</th>');
    }

    let options = task_type.options;
    let default_options = default_task_type.options;

    if (!conversion_task) {
        // Show visualization
        let $show_visualization_input = $(
            '<tr>' +
                '<td class="shrink">Show visualizations:</td>' +
                '<td class="expand">' +
                    '<input type="checkbox" name="Show visualizations" value="Show" ' +
                        (default_options.show_visualization != null && default_options.show_visualization ?
                            'checked' : '') +
                    ' />' +
                '</td>' +
            '</tr>'
        ).appendTo($options_table).find('input');
        $show_visualization_input.change(() =>
            options.show_visualization = $show_visualization_input[0].checked);
        options.show_visualization = default_options.show_visualization; // necessary for reset
    }

    // Show hints
    let $show_hints_input = $(
        '<tr>' +
            '<td class="shrink">Show hints:</td>' +
            '<td class="expand">' +
                '<input type="checkbox" name="Show visualizations" value="Show" ' +
                    (default_options.show_hints != null && default_options.show_hints ?
                        'checked' : '') +
                ' />' +
            '</td>' +
        '</tr>'
    ).appendTo($options_table).find('input');
    $show_hints_input.change(() => {
        let show_hints = $show_hints_input[0].checked;
        options.show_hints = show_hints;
        options.max_attempts = show_hints ? 1 : 3;
    });
    options.show_hints = default_options.show_hints; // necessary for reset
    options.max_attempts = default_options.show_hints ? 1 : 3;
}

export function show_color_conversion_options(task_type, default_task_type, $options_table) {
    show_color_matching_options(task_type, default_task_type, $options_table, true);

    let options = task_type.options;
    let default_options = default_task_type.options;

    // easy colors
    let $easy_colors_input = $(
        '<tr>' +
            '<td class="shrink">Easy colors:</td>' +
            '<td class="expand">' +
                '<input type="checkbox" name="Show visualizations" value="Show" ' +
                    (default_options.easy_hsl_hsv_colors != null && default_options.easy_hsl_hsv_colors ?
                        'checked' : '') +
                ' />' +
            '</td>' +
        '</tr>' +
        '<tr>' +
            '<td colspan="2" class="option-explanation">' +
                'If checked, the colors to convert will be simpler if HSL or HSV are involved.' +
            '</td>' +
        '</tr>'
    ).appendTo($options_table).find('input');
    $easy_colors_input.change(() =>
        options.easy_hsl_hsv_colors = $easy_colors_input[0].checked);
    options.easy_hsl_hsv_colors = default_options.easy_hsl_hsv_colors; // necessary for reset
}
