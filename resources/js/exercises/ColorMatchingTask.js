import {AbstractTask} from "./AbstractTask";
import {random_sample, get_color_system_by_name} from "../util";

export class ColorMatchingTask extends AbstractTask {
    constructor(exercise, options) {
        super(exercise);
        let defaults = {
            show_visualization: true,
            visualization_options: {},
            color_systems: ["rgb", "hsl", "hsv", "cmy", "cmyk"]
        };
        let actual = $.extend({}, defaults, options || {});

        this.show_visualization = actual.show_visualization;
        this.visualization_options = actual.visualization_options;
        this.visualization = null;
        this.color_system_name = random_sample(actual.color_systems);
        this.color_system = get_color_system_by_name(this.color_system_name);
    }

    run() {
        super.run();

        /* Attach visualization if needed. */
        if (this.show_visualization) {
            this.$container.append(
                '<div class="figure">' +
                    '<div class="visualization"></div>' +
                '</div>'
            );
            let $vis = this.$container.find(".visualization");
            this.visualization = this.color_system.create_associated_visualization($vis, this.visualization_options);
            if (this.visualization == null) {
                /* CMYK, for example, does not have a visualization (as of yet). -> Don't show. */
                this.$container.remove(".visualization");
                this.show_visualization = false;
            }
        }

        /* Attach */ // todo
    }
}
