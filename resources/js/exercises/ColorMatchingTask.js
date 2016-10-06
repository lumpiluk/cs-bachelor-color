import {AbstractTask} from "./AbstractTask";
import {
    random_sample,
    rgb_to_css,
    get_euclidean_distance_for_error,
} from "../util";
import {VisualizationControlSlider} from "../controls/VisualizationControlSlider";
import {get_color_system_by_name} from "../color-systems/color-systems";

export class ColorMatchingTask extends AbstractTask {
    constructor(exercise, task_num, options) {
        super(exercise, task_num);
        let defaults = {
            show_visualization: true,
            visualization_options: {},
            color_systems: ["rgb", "hsl", "hsv", "cmy"], // cmyk not included for now because k depends on cmy...
            max_euclidean_distance: get_euclidean_distance_for_error(.05, 3), // 5% error allowed
            show_current_color: true, // TODO: implement
            show_hints: true, // TODO: implement?
            max_attempts: 3, // 0 => infinite
            allow_skip_after_first_attempt: true,
        };
        let actual = $.extend({}, defaults, options || {});

        this.show_visualization = actual.show_visualization;
        this.visualization_options = actual.visualization_options;
        this.max_euclidean_distance = actual.max_euclidean_distance;
        this.visualization = null;
        this.color_system_name = random_sample(actual.color_systems);
        this.target_color = get_color_system_by_name(this.color_system_name);
        this.current_color = get_color_system_by_name(this.color_system_name);
        this.$target_color = null;
        this.$current_color = null;
        this._sliders = [];
        this.$submit_button = null;
        this.$next_button = null;
        this.$feedback = null;
        this.max_attempts = actual.max_attempts;
        this.current_attempt = 0;
        this.allow_skip_after_first_attempt = actual.allow_skip_after_first_attempt;

        /* Make random target color by setting each property to a random value. */
        for (let property of this.target_color.properties) {
            property.set_to_random();
        }
        /* Also randomize current color (for the sliders). */
        for (let property of this.current_color.properties) {
            property.set_to_random();
        }

        /* Attach listener to current color properties. */
        for (let property of this.current_color.properties) {
            property.add_listener((event) => this.on_current_color_change(event));
        }
    }

    run() {
        super.run();

        /* Attach visualization if needed. */
        if (this.show_visualization) {
            this.$container.append(
                // '<div class="figure">' +
                    '<div class="visualization"></div>'
                //'</div>'
            );
            let $vis = this.$container.find(".visualization");
            this.visualization = this.target_color.create_associated_visualization($vis, this.visualization_options);
            if (this.visualization == null) {
                /* CMYK, for example, does not have a visualization (as of yet). -> Don't show. */
                this.$container.remove(".visualization");
                this.show_visualization = false;
            } else {
                this.visualization.render();
            }
        }

        /* Attach task title. */
        this.$container.append(
            '<div class="figure-title">' +
                '<b>Task ' + this.task_num + '/' + this.exercise.num_rounds + ':</b> ' +
                'Adjust the ' + this.current_color.get_name() +
                ' parameters to match the color on the right to the color on the left.' +
            '</div>'
        );

        /* Attach color patches. */
        this.$container.append(
            '<div class="color-matching-target"></div>' +
            '<div class="color-matching-current"></div>'
        );
        this.$target_color = this.$container.find(".color-matching-target");
        this.$current_color = this.$container.find(".color-matching-current");
        let target_rgb = this.target_color.get_rgb();
        this.$target_color.css("background-color", rgb_to_css(
            target_rgb.r, target_rgb.g, target_rgb.b));
        this.on_current_color_change(null);

        /* Attach sliders. */
        this.$container.append(
            '<div class="color-matching-sliders visualization-controls"></div>'
        );
        let $sliders_container = this.$container.find(".color-matching-sliders");
        for (let property of this.current_color.properties) {
            this._sliders.push(new VisualizationControlSlider(
                $sliders_container,
                property,
                0.001
            ))
        }

        /* Attach buttons. */
        this.$container.append(
            '<div class="exercise-button-bar">' +
                '<button class="exercise-next-task" disabled>Next</button>' +
                '<button class="exercise-submit">Submit answer</button>' +
            '</div>'
        );
        this.$submit_button = this.$container.find(".exercise-submit");
        this.$next_button = this.$container.find(".exercise-next-task");
        this.$submit_button.click(() => this.on_submit_click());
        this.$next_button.click(() => this.on_next_click());
    }

    on_current_color_change(event) {
        /* Update current color patch. */
        let current_rgb = this.current_color.get_rgb();
        this.$current_color.css("background-color", rgb_to_css(
             current_rgb.r, current_rgb.g, current_rgb.b));

        // TODO: show hints if necessary
        // (or just show distance upon submit?)
    }

    on_submit_click() {
        let euclidean_distance_rgb = this.target_color.get_euclidean_distance_rgb(this.current_color);
        this.stats.correct = euclidean_distance_rgb <= this.max_euclidean_distance;
        this.current_attempt += 1;
        let feedback_str = "";

        /* Give feedback. */
        if (this.$feedback == null) {
            this.$container.append('<div class="exercise-feedback"></div>');
            this.$feedback = this.$container.find(".exercise-feedback");
        }
        if (this.stats.correct) {
            this.stats.attempts = this.current_attempt;
            this.stats.skipped = false;
            this.$next_button.attr("disabled", false);
            this.$submit_button.attr("disabled", true);
            this.$feedback.removeClass("wrong");
            this.$feedback.addClass("correct");
            feedback_str += "<em>Correct!</em> ";
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
                    this.$submit_button.attr("disabled", true);
                    this.stats.skipped = false;
                }
            }
            feedback_str += "The two colors are not similar enough.<br/>"
        }

        feedback_str += "Maximum difference in RGB: " + this.max_euclidean_distance.toFixed(3) +
                ".<br/>Current difference in RGB: " + euclidean_distance_rgb.toFixed(3);
        this.$feedback.html(feedback_str);
    }

    on_next_click() {
        this.exercise.on_task_finished(this);
    }
}
