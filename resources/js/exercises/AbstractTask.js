export class AbstractTask {
    constructor(exercise, task_num, options) {
        let defaults = {
            show_visualization: true,
            visualization_options: {},
        };
        let actual = $.extend({}, defaults, options || {});
        this.exercise = exercise;
        this.$container = exercise.$container;
        this.task_num = task_num;
        this.show_visualization = actual.show_visualization;
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
