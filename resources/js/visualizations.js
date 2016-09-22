/**
 * Created by lumpiluk on 9/21/16.
 */

const RENDERER = new THREE.WebGLRenderer();

class Visualization {
    constructor($container) {
        this.$container = $container;
        this.fov = 45;
        this.aspect = $container.width / $container.height;
        this.near = 0.1;
        this.far = 10000;
        this.camera = new THREE.PerspectiveCamera(
            this.fov, this.aspect, this.near, this.far
        );
        this.scene = new THREE.Scene();
        this.scene.add(this.camera);
        this.$container.append(RENDERER.domElement);
    }

    render() {
        RENDERER.setSize(this.$container.width, this.$container.height);
    }
}

class RGBCubeVisualization extends Visualization {
    constructor($container) {
        super($container);
    }
}

/**
 * List of visualizations in this document.
 * @type {Array}
 */
let visualizations = [];

/**
 * Matches each figure ID to the figure's visible number in the document.
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
