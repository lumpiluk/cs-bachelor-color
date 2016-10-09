/*
 * This is the main script.
 */

import {attach_rgb_cube_visualizations} from "./visualizations/RGBCubeVisualization";
import {attach_hsv_visualizations} from "./visualizations/HSVVisualization";
import {attach_hsl_visualizations} from "./visualizations/HSLVisualization";
import {attach_cmy_cube_visualizations} from "./visualizations/CMYCubeVisualization";
import {attach_visualization_comparisons} from "./visualizations/VisualizationComparison";
import {Exercise} from "./exercises/Exercise";

/**
 * Find and initialize all visualizations.
 */
function initialize_visualizations() {
    let visualizations = [];

    /* Assigns each figure (HTML-)ID its visible index. */
    let figures = {};


    console.log("Initializing visualizations.");
    visualizations.concat(attach_rgb_cube_visualizations());
    visualizations.concat(attach_hsv_visualizations());
    visualizations.concat(attach_hsl_visualizations());
    visualizations.concat(attach_cmy_cube_visualizations());

    attach_visualization_comparisons();

    /* Enumerate figures. */ // TODO: do in other function!
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

    return {visualizations: visualizations, figures: figures};
}

/**
 * Find and initialize all exercises.
 */
function initialize_exercises() {
    let exercises = [];

    console.log("Initializing exercises.");
    $(".exercise").each(function() {
        let exercise = new Exercise($(this));
        exercises.push(exercise);
    });

    return exercises;
}

$(document).ready(function() {
    initialize_visualizations();
    initialize_exercises();
});
