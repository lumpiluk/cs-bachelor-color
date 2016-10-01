/**
 * Created by lumpiluk on 9/21/16.
 */

import {attach_rgb_cube_visualizations} from "./visualizations/RGBCubeVisualization";
import {attach_hsv_visualizations} from "./visualizations/HSVVisualization";
import {attach_hsl_visualizations} from "./visualizations/HSLVisualization";


/**
 * List of visualizations in this document.
 * @type {Array}
 */
let visualizations = [];

/**
 * Matches each figure (HTML-)ID to the figure's visible number in the document.
 * @type {{}}
 */
let figures = {};

$(document).ready(function() {
    /*
     * Find and initialize all visualizations as soon as the page is loaded.
     */
    console.log("Initializing visualizations.");
    visualizations.concat(attach_rgb_cube_visualizations());
    visualizations.concat(attach_hsv_visualizations());
    visualizations.concat(attach_hsl_visualizations());

    /* Enumerate figures. */
    $(".figure-title").each(function(index) {
        let fig_id = $(this).parent().attr("id");
        figures[fig_id] = index + 1;
        $(this).prepend('<b>Figure ' + (index + 1).toString() + ':</b> ');
    });
    /* Update references. */
    $("figref").each(function() {
        let fig_id = $(this).data("fig-id");
        $(this).html('<a href="#' + fig_id + '">Figure ' + figures[fig_id] + '</a>');
    });
});
