/**
 * Created by lumpiluk on 9/21/16.
 */

// import {Visualization, DEFAULT_VERTEX_SHADER} from "./Visualization";
import {RGBCubeVisualization} from "./RGBCubeVisualization";

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
    $(".visualization.rgb-cube").each(function() {
        let rgb_cube = new RGBCubeVisualization($(this));
        rgb_cube.render();
        visualizations.push(rgb_cube);
    });

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
