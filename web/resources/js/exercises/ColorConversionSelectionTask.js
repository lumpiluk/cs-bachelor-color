import {AbstractTask} from "./AbstractTask";
import {random_sample, update_mathjax, shuffle, rgb_to_css, remove_from_array} from "../util";
import {get_color_system_by_name} from "../color-systems/color-systems";

export const DEFAULT_COLOR_CONVERSION_SELECTION_OPTIONS = {
    color_systems: ["rgb", "hsl", "hsv", "cmy", "cmyk"], // TODO: pairs of arrays of allowed from-to
    mixed_conversion_systems: true, // If true, not all options will be in the same color system.
    show_target_visualization: false,
    show_conversion_visualization: false,
    max_attempts: 3, // 0 => infinite
    allow_skip_after_first_attempt: true,
    num_options: 8, // including the correct option
};

export class ColorConversionSelectionTask extends AbstractTask {
    constructor(exercise, task_num, options) {
        super(exercise, task_num, options);
        let actual = $.extend({}, DEFAULT_COLOR_CONVERSION_SELECTION_OPTIONS, options || {});

        this.mixed_conversion_systems = actual.mixed_conversion_systems;
        this.max_attempts = actual.max_attempts;
        this.current_attempt = 0;
        this.allow_skip_after_first_attempt = actual.allow_skip_after_first_attempt;
        this.num_options = actual.num_options;
        this.target_system_name = random_sample(actual.color_systems);
        this.target_color = get_color_system_by_name(this.target_system_name, this.random_units);
        this.distractor_colors = [];
        this.$options_container = null;

        this.$next_button = null;
        this.$feedback = null;

        /* Randomize and convert target color. */
        this.target_color.randomize();
        let remaining_color_systems = actual.color_systems.slice(); // (copy array)
        remove_from_array(remaining_color_systems, this.target_system_name);
        let conversion_system_name = random_sample(remaining_color_systems);
        this.converted_target_color = get_color_system_by_name(conversion_system_name, this.random_units);
        let target_rgb = this.target_color.get_rgb();
        this.converted_target_color.set_from_rgb(target_rgb.r, target_rgb.g, target_rgb.b);

        /* Make random distractor colors. */
        for (let i = 0; i < this.num_options - 1; i++) {
            if (this.mixed_conversion_systems) {
                conversion_system_name = random_sample(remaining_color_systems);
            }
            let c = get_color_system_by_name(conversion_system_name, this.random_units);
            c.randomize();
            this.distractor_colors.push(c);
        }
        this.distractor_colors.push(this.converted_target_color);
        shuffle(this.distractor_colors);
    }

    run() {
        super.run();

        this.attach_task_title(
            "Select the color below that matches " +
                "\\(" + this.target_color.get_tex() + "\\)."
        );
        update_mathjax(this.$task_title);

        /* Attach distractor colors (including converted target). */
        this.$options_container = $(
            '<div class="color-conversion-selection-options"></div>'
        ).appendTo(this.$container);
        for (let c of this.distractor_colors) {
            let $option = $(
                '<span class="color-conversion-selection-option">' +
                '\\(' + c.get_tex() + '\\)' +
                '</span>'
            ).appendTo(this.$options_container);
            $option.click(() => this.on_option_clicked(c));
        }
        update_mathjax(this.$options_container);

        /* Attach buttons. */
        this.$container.append(
            '<div class="exercise-button-bar">' +
                '<button class="exercise-next-task" disabled>Next</button>' +
            '</div>'
        );
        this.$next_button = this.$container.find(".exercise-next-task");
        this.$next_button.click(() => this.on_next_click());
    }

    on_option_clicked(option_color) {
        this.current_attempt += 1;
        if (this.stats.correct || (this.max_attempts != 0 && this.current_attempt > this.max_attempts)) {
            return;
        }
        this.stats.correct = option_color == this.converted_target_color;
        let feedback_str = "";

        /* Make feedback container if it doesn't exist yet. */
        if (this.$feedback == null) {
            this.$feedback = $('<div class="exercise-feedback"></div>')
                .insertBefore(this.$container.find(".exercise-button-bar"));
        }

        if (this.stats.correct) {
            this.stats.attempts = this.current_attempt;
            this.stats.skipped = false;
            this.$next_button.attr("disabled", false);
            this.$feedback.removeClass("wrong");
            this.$feedback.addClass("correct");
            feedback_str += "<em>Correct!</em>";
            this.$feedback.html(feedback_str);
            this.resolve();
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
                if (this.current_attempt == this.max_attempts) {
                    let target_rgb = this.target_color.get_rgb();
                    this.stats.skipped = false;
                    feedback_str += 'The correct solution is \\(' + this.converted_target_color.get_tex() + '\\).';
                    this.$feedback.html(feedback_str);
                    update_mathjax(this.$feedback);
                    this.$feedback.find(".color-selection-patch").css("background",
                        rgb_to_css(target_rgb.r, target_rgb.g, target_rgb.b));
                    this.resolve();
                } else {
                    this.$feedback.html(feedback_str);
                }
            } else {
                this.$feedback.html(feedback_str);
            }
        }
    }

    on_next_click() {
        this.exercise.on_task_finished(this);
    }

    resolve() {
        /* Show color patches next to numerical color representations. */
        let $options = this.$options_container.find(".color-conversion-selection-option");
        if ($options.length < this.distractor_colors.length) {
            return;
        }
        for (let i = 0; i < this.distractor_colors.length; i++) {
            let dom_option = $options[i];
            let rgb = this.distractor_colors[i].get_rgb();
            let $option = $(
                '<span class="color-patch"></span>'
            ).prependTo($(dom_option));
            $option.css("background", rgb_to_css(rgb.r, rgb.g, rgb.b));
        }
    }
}

export function show_conversion_selection_options(task_type, default_task_type, $options_table) {
    $options_table.append('<th colspan="2">Color Conversion Selection Options</th>');

    let options = task_type.options;
    let default_options = default_task_type.options;

    // Number of conversion options
    let $num_options_input = $(
        '<tr>' +
            '<td class="shrink">Number of conversion options:</td>' +
                '<td class="expand">' +
                    '<input type="number" min="2" max="25" step="1" value="' +
                        (default_options.num_options != null ? default_options.num_options : 8).toString() +
                    '" />' +
            '</td>' +
        '</tr>'
    ).appendTo($options_table).find('input');
    $num_options_input.on("change", (event) => options.num_options = parseInt(event.target.value));
    options.num_options = default_options.num_options; // necessary for reset
}
