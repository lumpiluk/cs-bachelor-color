import {AbstractTask, append_color_patch} from "./AbstractTask";
import {
    random_sample,
    rgb_to_css,
    get_euclidean_distance_for_error,
    update_mathjax,
    remove_from_array
} from "../util";
import {
    get_color_system_by_name,
    COLOR_SYSTEM_NAMES
} from "../color-systems/color-systems";
import {make_sliders_for_color_system} from "../controls/VisualizationControlSlider";
import {VisualizationControlSelect} from "../controls/VisualizationControlSelect";
import {get_list_of_default_units_by_color_system_name} from "../color-systems/color-systems";
import {get_color_system_units_by_name} from "../color-systems/ColorSystemUnits";

const HINTS = ["Not there yet", "You are close!", "Almost there!", "Close enough"];

export const DEFAULT_COLOR_MATCHING_OPTIONS = {
    color_systems: ["rgb", "hsl", "hsv", "cmy"], // cmyk not included for now because k depends on cmy...
    show_target_visualization: false, // TODO: implement
    show_conversion_visualization: false, // TODO: implement
    max_euclidean_distance: get_euclidean_distance_for_error(.05, 3), // 5% error allowed in each channel
    show_current_color: true,
    show_target_color: true, // If false, the numerical representation will be shown.
    show_hints: true,
    max_attempts: 1, // 0 => infinite
    allow_skip_after_first_attempt: true,
    easy_hsl_hsv_colors: false,
    show_visualization: true
};

export const DEFAULT_COLOR_CONVERSION_OPTIONS = {
    color_systems: ["rgb", "hsl", "hsv", "cmy"], // cmyk not included for now because k depends on cmy...
    show_target_visualization: false, // TODO: implement
    show_conversion_visualization: false, // TODO: implement
    max_euclidean_distance: get_euclidean_distance_for_error(.05, 3), // 5% error allowed in each channel
    show_current_color: true,
    show_target_color: true, // If false, the numerical representation will be shown.
    show_hints: true,
    max_attempts: 1, // 0 => infinite
    allow_skip_after_first_attempt: true,
    easy_hsl_hsv_colors: false
};

export class ColorMatchingTask extends AbstractTask {
    constructor(exercise, task_num, options) {
        super(exercise, task_num, options);
        let actual = $.extend({}, DEFAULT_COLOR_MATCHING_OPTIONS, options || {});

        this.show_conversion_visualization = actual.show_conversion_visualization;
        this.show_target_visualization = actual.show_target_visualization;
        this.is_conversion_task = !actual.show_target_color;
        this.show_target_color = actual.show_target_color;
        this.show_current_color = actual.show_current_color;
        this.show_hints = actual.show_hints;

        this.max_euclidean_distance = actual.max_euclidean_distance;
        this.target_system_name = random_sample(actual.color_systems);

        this.is_pre_configured_task = actual.target_color_rgb != null;
        this.target_color = get_color_system_by_name(this.target_system_name,
            this.is_conversion_task && this.random_units);
        if (this.is_pre_configured_task) {
            let rgb = actual.target_color_rgb;
            this.target_color.set_from_rgb(rgb.r, rgb.g, rgb.b);
            this.target_color.change_units_to(get_color_system_units_by_name(actual.target_units));
        }

        /* For if this is a conversion task: */
        let remaining_color_systems = actual.color_systems.slice(); // (copy array)
        remove_from_array(remaining_color_systems, this.target_system_name);
        let conversion_system_name = random_sample(remaining_color_systems);

        this.$target_color = null;
        this.$current_color = null;
        this._sliders = [];
        this.$exercise_button_bar = null;
        this.$hints = null; // will contain all span elements within .exercise-hints-label with class hint
        this.$submit_button = null;
        this.$next_button = null;
        this.$feedback = null;
        this.max_attempts = actual.max_attempts;
        this.current_attempt = 0;
        this.allow_skip_after_first_attempt = actual.allow_skip_after_first_attempt;
        this.easy_hsl_hsv_colors = actual.easy_hsl_hsv_colors;

        if (!this.is_pre_configured_task) {
            /* Randomize and, if necessary, convert target color. */
            this.target_color.randomize(
                this.easy_hsl_hsv_colors && (
                    this.target_system_name == "hsl" || this.target_system_name == "hsv" ||
                    conversion_system_name == "hsl" || conversion_system_name == "hsv"
                )
            ); // easy iff easy_hsl_hsv_colors and target or current is hsl or hsv
        }
        this.converted_target_color = null;
        if (this.is_conversion_task) {
            this.converted_target_color = get_color_system_by_name(conversion_system_name, this.random_units);
            let target_rgb = this.target_color.get_rgb();
            this.converted_target_color.set_from_rgb(target_rgb.r, target_rgb.g, target_rgb.b);
            this.current_color = get_color_system_by_name(conversion_system_name, false);
            this.current_color.change_units_to(this.converted_target_color.properties[0].color_system_units);
        } else {
            this.current_color = get_color_system_by_name(this.target_system_name, false);
            if (this.is_pre_configured_task) {
                this.current_color.change_units_to(this.target_color.properties[0].color_system_units);
            }
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

        if (this.show_hints) {
            /* Attach hints. */
            let $hints_label = $(
                '<span class="exercise-hints-label"></span>'
            ).appendTo(this.$container);
            for (let hint of HINTS) {
                $hints_label.append('<span class="hint">' + hint.replace(/ /g, "&nbsp;") + '</span> ');
                // (Need to replace spaces with non-breaking spaces for small displays.)
            }
            // TODO: initialize correctly!
            this.$hints = $hints_label.find('.hint');
            this.$hints.first().addClass("active");
        }

        /* Attach sliders. */
        this._sliders = make_sliders_for_color_system(
            this.current_color,
            $('<div class="color-matching-sliders visualization-controls"></div>').appendTo(this.$container)
        );

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

        // TODO: hints_label (with an s)
        if (this.show_hints && this.$hints != null) {
            let euclidean_distance_rgb = this.target_color.get_euclidean_distance_rgb(this.current_color);
            this.$hints.removeClass("active");
            if (euclidean_distance_rgb <= this.max_euclidean_distance) {
                this.$hints.eq(3).addClass("active");
                // "... How close can you get?"
            } else if (euclidean_distance_rgb <= this.max_euclidean_distance * 1.5) {
                this.$hints.eq(2).addClass("active");
            } else if (euclidean_distance_rgb <= this.max_euclidean_distance * 2) {
                this.$hints.eq(1).addClass("active");
            } else {
                this.$hints.eq(0).addClass("active");
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

        feedback_str = "Maximum difference in RGB allowed: " + this.max_euclidean_distance.toFixed(3) +
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

/**
 *
 * @param task_type
 * @param default_task_type
 * @param $options_table
 * @param is_configurator Should be true if the options are supposed to also let the user
 * configure the target color.
 * @param conversion_task
 */
export function show_color_matching_options(task_type, default_task_type, $options_table,
        is_configurator=false, conversion_task=false) {
    if (!is_configurator && !conversion_task) {
        $options_table.append('<th colspan="2">Color Matching Options</th>');
    } else if (!is_configurator) {
        $options_table.append('<th colspan="2">Color Conversion Options</th>');
    }

    let options = task_type.options;
    let default_options = default_task_type.options;

    if (is_configurator) {
        // Select color system
        let target_system_select = new VisualizationControlSelect(
            $(
                '<tr>' +
                    '<td class="shrink">Target color system:</td>' +
                    '<td class="expand"></td>' +
                '</tr>'
            ).appendTo($options_table).find('.expand'),
            COLOR_SYSTEM_NAMES,
            null // no additional label necessary
        );
        if (default_options.color_systems != null && default_options.color_systems.length > 0) {
            target_system_select.set_selected_text(default_options.color_systems[0]);
        }

        // Selector for target color to match
        let target_color = null;
        let target_units_select = null;
        let $target_color_config_sliders_container = $(
            '<tr><td colspan="2" class="expand"></td></tr>'
        ).appendTo($options_table).find("td");
        let $target_units_select_container = $('<tr></tr>').appendTo($options_table);
        let reset_target_color_config_sliders = (is_initial_call=false) => {
            // will be called on initialization and in event listener

            $target_color_config_sliders_container.empty();
            options.color_systems = [target_system_select.get_selected_text()];
            target_color = get_color_system_by_name(target_system_select.get_selected_text(), false);
            if (is_initial_call && default_options.target_color_rgb != null) {
                let rgb = default_options.target_color_rgb;
                target_color.set_from_rgb(rgb.r, rgb.g, rgb.b);
            } else {
                options.target_color_rgb = target_color.get_rgb();
            }
            target_color.add_listener(() => { options.target_color_rgb = target_color.get_rgb(); });
            make_sliders_for_color_system(
                target_color,
                $target_color_config_sliders_container
            );

            // Select target units (needs to be updated on target system change for list of valid units)
            $target_units_select_container.empty();
            target_units_select = new VisualizationControlSelect(
                $(
                    '<td class="shrink">Target color units:</td>' +
                    '<td class="expand"></td>'
                ).appendTo($target_units_select_container).closest('.expand'),
                get_list_of_default_units_by_color_system_name(target_system_select.get_selected_text()),
                null // no additional label necessary
            );
            if (is_initial_call && default_options.target_units != null) {
                target_units_select.set_selected_text(default_options.target_units);
            }
            options.target_units = target_units_select.get_selected_text();
            target_units_select.add_listener((select_change_event) => {
                target_color.change_units_to(select_change_event.option);
                options.target_units = target_units_select.get_selected_text();
            });
        };
        reset_target_color_config_sliders(true);

        target_system_select.add_listener(reset_target_color_config_sliders);
    }

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

    // Distance measure (Abandoned because the choice of distance in RGB vs. CIELAB would prob. confuse the user...)
    /*let distance_measure_options = [
        "Euclidean distance in RGB",
        "CIE 1976 (L*a*b*) color difference"
    ];
    let distance_measure_select = new VisualizationControlSelect(
        $(
            '<tr>' +
                '<td class="shrink">Distance measure:</td>' +
                '<td class="expand"></td>' +
            '</tr>' +
            '<tr>' +
                '<td colspan="2" class="option-explanation">' +
                    'Different distance measures aren\'t implemented yet. This option does not do anything.' +
                '</td>' +
            '</tr>'
        ).appendTo($options_table).find('.expand'),
        distance_measure_options,
        null // no additional label necessary
    );
    distance_measure_select.add_listener((select_change_event) => {
        let i = parseInt(select_change_event.option_index);
        switch(i) {
            case 0: // RGB
                console.log("RGB");
                break;
            case 1: // Lab
                console.log("CIELAB");
                break;
        }
    });*/
}

export function show_color_conversion_options(task_type, default_task_type, $options_table, is_configurator=false) {
    show_color_matching_options(task_type, default_task_type, $options_table, is_configurator, true);

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
