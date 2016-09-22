"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by lumpiluk on 9/21/16.
 */

var RENDERER = new THREE.WebGLRenderer();

var Visualization = function () {
    function Visualization($container) {
        _classCallCheck(this, Visualization);

        this.$container = $container;
        this.fov = 45;
        this.aspect = $container.width / $container.height;
        this.near = 0.1;
        this.far = 10000;
        this.camera = new THREE.PerspectiveCamera(this.fov, this.aspect, this.near, this.far);
        this.scene = new THREE.Scene();
        this.scene.add(this.camera);
        this.$container.append(RENDERER.domElement);
    }

    _createClass(Visualization, [{
        key: "render",
        value: function render() {
            RENDERER.setSize(this.$container.width, this.$container.height);
        }
    }]);

    return Visualization;
}();

var RGBCubeVisualization = function (_Visualization) {
    _inherits(RGBCubeVisualization, _Visualization);

    function RGBCubeVisualization($container) {
        _classCallCheck(this, RGBCubeVisualization);

        return _possibleConstructorReturn(this, (RGBCubeVisualization.__proto__ || Object.getPrototypeOf(RGBCubeVisualization)).call(this, $container));
    }

    return RGBCubeVisualization;
}(Visualization);

/**
 * List of visualizations in this document.
 * @type {Array}
 */


var visualizations = [];

/**
 * Matches each figure ID to the figure's visible number in the document.
 * @type {{}}
 */
var figures = {};

$(document).ready(function () {
    /*
     * Find and initialize all visualizations as soon as the page is loaded.
     */
    console.log("Initializing visualizations.");
    $(".visualization.rgb-cube").each(function () {
        var rgb_cube = new RGBCubeVisualization($(this));
        visualizations.push(rgb_cube);
    });

    /* Enumerate figures. */
    $(".figure-title").each(function (index) {
        var fig_id = $(this).parent().attr("id");
        figures[fig_id] = index + 1;
        $(this).prepend('<b>Figure ' + (index + 1).toString() + ':</b> ');
    });
    /* Update references. */
    $("figref").each(function () {
        var fig_id = $(this).data("fig-id");
        $(this).html('<a href="#' + fig_id + '">Figure ' + figures[fig_id] + '</a>');
    });
});

//# sourceMappingURL=visualizations-compiled.js.map