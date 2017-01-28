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
    /* Assigns each table (HTML-)ID its visible index. */
    let tables = {};

    console.log("Initializing visualizations.");
    visualizations.concat(attach_rgb_cube_visualizations());
    visualizations.concat(attach_hsv_visualizations());
    visualizations.concat(attach_hsl_visualizations());
    visualizations.concat(attach_cmy_cube_visualizations());

    attach_visualization_comparisons();

    /* Enumerate figures. */ // TODO: do in other function!
    $(".figure-title").each(function(index) {
        //let fig_id = $(this).parent().attr("id");
        let fig_id = $(this).closest(".figure").attr("id");
        figures[fig_id] = index + 1;
        $(this).prepend('<b>Figure ' + (index + 1).toString() + ':</b> ');
    });
    /* Enumerate tables. */
    $(".table-title").each(function(index) {
        let tab_id = $(this).parent().attr("id");
        tables[tab_id] = index + 1;
        $(this).prepend('<b>Table ' + (index + 1).toString() + ':</b>');
    });

    /* Update figure references. */
    $(".figref").each(function() {
        let fig_id = $(this).data("fig-id");
        $(this).html('<a href="#' + fig_id + '">Figure ' + figures[fig_id] + '</a>');
    });
    /* Update table references. */
    $(".tabref").each(function() {
        let tab_id = $(this).data("tab-id");
        $(this).html('<a href="#' + tab_id + '">Table ' + tables[tab_id] + '</a>');
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

/**
 * Will convert HTML like the following into proper email links.
 * <a class="email" data-email='["info", "lukas-stratmann", "com"]'></a>
 */
function make_email_links() {
    $("a.email").each(function() {
        let a = $(this).data("email"); // for name@site.com this should return ["name", "site", "com"]
        let address = a[0] + "@" + a[1] + "." + a[2];
        $(this).attr("href", "mailto:" + address);
        $(this).text(address);
    });
}

$(document).ready(function() {
    make_email_links();
    initialize_visualizations();
    initialize_exercises();
});
