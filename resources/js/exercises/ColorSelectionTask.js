import {AbstractTask} from "./AbstractTask";
import {random_sample, update_mathjax, shuffle, rgb_to_css} from "../util";
import {get_color_system_by_name} from "../color-systems/color-systems";
import {RGBColorSystem} from "../color-systems/RGBColorSystem";

export class ColorSelectionTask extends AbstractTask {
    constructor(exercise, task_num, options) {
        super(exercise, task_num, options);
        let defaults = {
            color_systems: ["rgb", "hsl", "hsv", "cmy", "cmyk"],
            max_attempts: 3, // 0 => infinite
            allow_skip_after_first_attempt: true,
            num_options: 8, // i.e. number of color patches, including the correct one
        };
        let actual = $.extend({}, defaults, options || {});

        this.max_attempts = actual.max_attempts;
        this.current_attempt = 0;
        this.allow_skip_after_first_attempt = actual.allow_skip_after_first_attempt;
        this.num_options = actual.num_options;
        this.color_system_name = random_sample(actual.color_systems);
        this.target_color = get_color_system_by_name(this.color_system_name);
        this.distractor_colors = [];

        this.$patches_container = null;
        this.$next_button = null;
        this.$feedback = null;

        /* Randomize target color. */
        this.target_color.randomize();
        /* Make random distractor colors. */
        for (let i = 0; i < this.num_options - 1; i++) {
            let c = new RGBColorSystem();
            c.randomize();
            this.distractor_colors.push(c);
        }
        this.distractor_colors.push(this.target_color);
        shuffle(this.distractor_colors);
    }

    run() {
        super.run();

        this.attach_task_title(
            "Select the color below that matches " +
                "\\(" + this.target_color.get_tex() + "\\)."
        );
        update_mathjax(this.$task_title);

        /* Make color patches. */
        this.$patches_container = $(
            '<div class="color-selection-patches"></div>'
        ).appendTo(this.$container);
        for (let c of this.distractor_colors) {
            let rgb = c.get_rgb();
            let $patch = $(
                '<div class="color-selection-patch"></div>'
            ).appendTo(this.$patches_container);
            $patch.css("background-color", rgb_to_css(rgb.r, rgb.g, rgb.b));
            $patch.click(() => this.on_patch_clicked(c));
        }

        /* Attach buttons. */
        this.$container.append(
            '<div class="exercise-button-bar">' +
                '<button class="exercise-next-task" disabled>Next</button>' +
            '</div>'
        );
        this.$next_button = this.$container.find(".exercise-next-task");
        this.$next_button.click(() => this.on_next_click());
    }

    on_patch_clicked(distractor_color) {
        this.current_attempt += 1;
        if (this.stats.correct || (this.max_attempts != 0 && this.current_attempt > this.max_attempts)) {
            return;
        }
        this.stats.correct = distractor_color == this.target_color;
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
                    feedback_str += 'The correct solution is:<br/>' +
                        '<div class="color-selection-patch"></div>';
                    this.$feedback.html(feedback_str);
                    this.$feedback.find(".color-selection-patch").css("background-color",
                        rgb_to_css(target_rgb.r, target_rgb.g, target_rgb.b));
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
}
