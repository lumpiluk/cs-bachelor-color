import {CSS_VISUALIZATION_CLASSES, make_visualization_by_css_class} from "./visualizations";


export class VisualizationComparison {
    constructor($container) {
        this.$container = $container; // Usually, this will be a figure.

        this.$visualizations_container = this.$container.find(".visualizations");
        this.$visualizations = this.$visualizations_container.find(".visualization");
        this.visualizations = [];

        /* Initialize existing visualizations. */
        for (let i = 0; i < this.$visualizations.length; i++) {
            let $visualization = $(this.$visualizations[i]);
            this.visualizations.push(null);
            for (let css_class of CSS_VISUALIZATION_CLASSES) {
                if ($visualization.hasClass(css_class)) {
                    this.visualizations[i] = make_visualization_by_css_class(
                        css_class, $visualization);
                    this.visualizations[i].aspect = 1;
                    this.visualizations[i].on_resize();
                }
            }
        }

        this.connect_color_systems();
    }

    /**
     * Connect the color systems of all non-null visualizations in a chain.
     */
    connect_color_systems() {
        if (this.visualizations.length < 2) {
            return;
        }
        let count = 0;
        let latest_non_null_vis = null;
        for (let i = 0; i < this.visualizations.length; i++) {
            if (count > 0 && this.visualizations[i] != null) {
                latest_non_null_vis.color_system.connect_to(this.visualizations[i].color_system);
            }
            if (this.visualizations[i] != null) {
                latest_non_null_vis = this.visualizations[i];
                count++;
            }
        }
    }
}

export function attach_visualization_comparisons() {
    let comparisons = [];
    $(".figure > .visualizations").parent().each(function() {
        let comparison = new VisualizationComparison($(this));
        comparisons.push(comparison);
    });
    return comparisons;
}
