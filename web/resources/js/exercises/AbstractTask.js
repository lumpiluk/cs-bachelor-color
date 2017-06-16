import {rgb_to_css} from "../util";
import {make_visualization_by_css_class} from "../visualizations/visualizations";


export function append_color_patch($container, color_system) {
    let $patch = $('<div class="color-selection-patch"></div>').appendTo($container);
    let rgb = color_system.get_rgb();
    $patch.css("background", rgb_to_css(rgb.r, rgb.g, rgb.b));
}


export class AbstractTask {
    constructor(exercise, task_num, options) {
        let defaults = {
            show_visualization: true,
            random_units: false, // If true, color system units will be chosen at random instead of using the default.
            visualization_options: {},
        };
        let actual = $.extend({}, defaults, options || {});
        this.exercise = exercise;
        this.$container = exercise.$container;
        this.task_num = task_num;
        this.show_visualization = actual.show_visualization;
        this.random_units = actual.random_units;
        this.visualization_options = actual.visualization_options;
        this.visualization = null;
        this.$task_title = null;

        this.stats = {
            correct: false,
            attempts: 0, // 0 => unanswered
            skipped: true
        };
    }

    /**
     * Replaces the contents of this.$container with the task,
     * including all required controls.
     * @returns {boolean}
     */
    run() {
        this.$container.empty();

        /* Attach visualization if needed. */
        if (this.show_visualization) {
            let $vis = $(
                '<div class="visualization aspect-ratio-preserver">' +
                    '<img class="aspect-ratio" src="../resources/img/3by2aspect.png" />' + // used to be /resources/img/3by2aspect.png. See comment below!
                '</div>'
            ).appendTo(this.$container);
	    /*
	     * Must use relative path to 3by2aspect.png, or else the image won't be found if the project is not at the root of the domain...
	     * Path is relative to the PHP-generated path visible in-browser! (Not relative to the compiled JS file!) 
	     */
            this.visualization = make_visualization_by_css_class(this.target_color.get_visualization_css_class(), $vis,
                this.visualization_options);
            if (this.visualization == null) {
                /* CMYK, for example, does not have a visualization (as of yet). -> Don't show. */
                this.$container.remove(".visualization");
                this.show_visualization = false;
            } else {
                this.visualization.render();
            }
        }
    }

    attach_task_title(task_description) {
        this.$container.append(
            '<div class="figure-title">' +
                '<b>Task ' + this.task_num + '/' + this.exercise.num_rounds + ':</b> ' +
                task_description +
            '</div>'
        );
        this.$task_title = this.$container.find(".figure-title");
    }
}
