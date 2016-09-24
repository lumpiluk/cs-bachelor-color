(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by lumpiluk on 9/21/16.
 */

var Visualization = function () {
    function Visualization($container) {
        _classCallCheck(this, Visualization);

        this.$container = $container;
        this.fov = 45;
        this.min_focal_length = 10; // for zooming, assuming full frame (35mm) camera sensor
        this.max_focal_length = 400; // for zooming
        this.zoom_steps = 20; // (if available)
        this.zoom_sensitivity = 0.25; // For mouse wheels. Lower => more sensitive.
        this.aspect = $container.width() / $container.height();
        this.near = 0.1;
        this.far = 10000;
        this.renderer = new THREE.WebGLRenderer();
        this.scene = new THREE.Scene();
        // this.axis_helper = new THREE.AxisHelper(5);
        this.pivot = new THREE.Object3D(); // Pivot for rotation of camera and lights.
        this.camera = new THREE.PerspectiveCamera(this.fov, this.aspect, this.near, this.far);
        this.camera.position.set(0, 0, 0, 1);
        this.camera.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, 3));
        this.camera.lookAt(this.scene.position);
        this.pivot.add(this.camera);
        this.scene.add(this.pivot);
        // this.scene.add(this.axis_helper);
        this.renderer.setClearColor(0x505050, 1);
        this.renderer.setSize(this.$container.width(), this.$container.height());

        this.$container.append(this.renderer.domElement);
        var that = this;
        $(window).resize(function () {
            that.on_resize.call(that); // Wordy way of calling a function to preserve "this".
        });

        /* Initialize navigation controls. */
        this.current_rotation = new THREE.Euler(0, 0, 0, "YXZ"); // YXZ for no "sideways" rotation.
        this.starting_rotation = new THREE.Euler(0, 0, 0, "YXZ");
        this.starting_focal_length = 0;
        this.dragging = false;
        this.two_fingers_touching = false;
        this.drag_start = new THREE.Vector2(0, 0);
        this.scale_start_distance = 0;
        this.$container.mousedown(function (event) {
            that.on_mouse_down.call(that, event);
        });
        this.$container.on("wheel", function (event) {
            that.on_wheel.call(that, event);
        });
        this.mouse_move_handler = function (event) {
            // Will be added to document on mouse down.
            that.on_mouse_move.call(that, event);
        };
        this.mouse_up_handler = function (event) {
            // Will be added to document on mouse down.
            that.on_mouse_up.call(that, event);
        };
        this.$container.on("touchstart", function (event) {
            that.on_touch_start.call(that, event);
        });
        this.$container.on("touchmove", function (event) {
            that.on_touch_move.call(that, event);
        });
        this.$container.on("touchcancel", function (event) {
            that.on_touch_cancel.call(that, event);
        });
        this.$container.on("touchend", function (event) {
            that.on_touch_end.call(that, event);
        });
    }

    _createClass(Visualization, [{
        key: "render",
        value: function render() {
            this.renderer.render(this.scene, this.camera);
        }
    }, {
        key: "update_rotation",
        value: function update_rotation(delta_x, delta_y) {
            this.current_rotation.y = (this.starting_rotation.y + delta_y) % (2 * Math.PI);
            this.current_rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, (this.starting_rotation.x + delta_x) % (2 * Math.PI)));
            this.pivot.rotation.copy(this.current_rotation);
        }
    }, {
        key: "update_scale",
        value: function update_scale(focal_length_delta) {
            this.camera.setFocalLength(Math.max(this.min_focal_length, Math.min(this.max_focal_length, this.starting_focal_length + focal_length_delta)));
        }
    }, {
        key: "on_resize",
        value: function on_resize() {
            this.renderer.setSize(this.$container.width(), this.$container.height());
            this.camera.aspect = this.$container.width() / this.$container.height();
            this.camera.updateProjectionMatrix();
            this.render();
        }
    }, {
        key: "on_mouse_down",
        value: function on_mouse_down(event) {
            this.drag_start.set(event.pageX, event.pageY);
            this.starting_rotation.copy(this.pivot.rotation);
            this.dragging = true;
            var that = this;
            document.addEventListener("mousemove", this.mouse_move_handler, false);
            document.addEventListener("mouseup", this.mouse_up_handler, false);
        }
    }, {
        key: "on_mouse_move",
        value: function on_mouse_move(event) {
            if (!this.dragging) {
                return;
            }
            event.preventDefault();
            /* (y in delta_y is y-axis in 3D. Same for x in delta_x.) */
            var delta_y = -(event.pageX - this.drag_start.x) / $(window).width() * 2 * Math.PI;
            var delta_x = -(event.pageY - this.drag_start.y) / $(window).height() * 2 * Math.PI;
            this.update_rotation(delta_x, delta_y);
            this.render();
        }
    }, {
        key: "on_mouse_up",
        value: function on_mouse_up(event) {
            this.dragging = false;
            document.removeEventListener("mousemove", this.mouse_move_handler, false);
            document.removeEventListener("mouseup", this.mouse_up_handler, false);
        }
    }, {
        key: "on_wheel",
        value: function on_wheel(event) {
            var delta = -event.originalEvent.deltaY;
            event.preventDefault();
            switch (event.originalEvent.deltaMode) {
                /* see https://developer.mozilla.org/en-US/docs/Web/Events/wheel */
                case 0x00:
                    // => Delta values in pixels.
                    delta *= (this.max_focal_length - this.min_focal_length) / $(window).height();
                    break;
                case 0x01: // => Delta values in lines.
                case 0x02:
                    // => Delta values in pages.
                    delta *= (this.max_focal_length - this.min_focal_length) / this.zoom_steps;
                    break;
            }
            this.starting_focal_length = this.camera.getFocalLength();
            this.update_scale(delta * this.zoom_sensitivity);
            this.render();
        }
    }, {
        key: "on_touch_start",
        value: function on_touch_start(event) {
            this.drag_start.set(event.touches[0].pageX, event.touches[0].pageY);
            this.starting_rotation.copy(this.pivot.rotation);
            this.dragging = true;
            switch (event.touches.length) {
                case 1:
                    /* One finger -> rotate around y! */
                    // event.preventDefault(); // Enabling this prevents scrolling.
                    break;
                case 2:
                    /* Two fingers -> pinch to zoom, rotation around x! */
                    event.preventDefault();
                    this.scale_start_distance = new THREE.Vector2(event.touches[0].pageX, event.touches[0].pageY).distanceTo(new THREE.Vector2(event.touches[1].pageX, event.touches[1].pageY));
                    this.starting_focal_length = this.camera.getFocalLength();
                    this.two_fingers_touching = true;
                    break;
            }
            /* Temporarily add listeners to document so that dragging also works outside the canvas. */
            document.addEventListener("mousemove", this.mouse_move_handler, false);
            document.addEventListener("mouseup", this.mouse_up_handler, false);
        }
    }, {
        key: "on_touch_move",
        value: function on_touch_move(event) {
            if (!this.dragging) {
                return;
            }

            /*
             * Rotation.
             * (y in delta_y is y-axis in 3D. Same for x in delta_x.)
             */
            // TODO: use center point if two fingers are touching!
            var delta_y = -(event.touches[0].pageX - this.drag_start.x) / $(window).width() * 2 * Math.PI;
            var delta_x = -(event.touches[0].pageY - this.drag_start.y) / $(window).height() * 2 * Math.PI;
            if (!this.two_fingers_touching) {
                delta_x = 0;
            }
            this.update_rotation(delta_x, delta_y);

            /*
             * Scale.
             */
            if (this.two_fingers_touching) {
                event.preventDefault();
                var distance = new THREE.Vector2(event.touches[0].pageX, event.touches[0].pageY).distanceTo(new THREE.Vector2(event.touches[1].pageX, event.touches[1].pageY));
                var s_delta = (distance - this.scale_start_distance) / $(window).width() * (this.max_focal_length - this.min_focal_length);
                this.update_scale(s_delta);
            }

            this.render();
        }
    }, {
        key: "on_touch_cancel",
        value: function on_touch_cancel(event) {}
    }, {
        key: "on_touch_end",
        value: function on_touch_end(event) {
            this.on_mouse_up(event);
            this.two_fingers_touching = false;
        }
    }]);

    return Visualization;
}();

var RGBCubeVisualization = function (_Visualization) {
    _inherits(RGBCubeVisualization, _Visualization);

    function RGBCubeVisualization($container) {
        _classCallCheck(this, RGBCubeVisualization);

        var _this = _possibleConstructorReturn(this, (RGBCubeVisualization.__proto__ || Object.getPrototypeOf(RGBCubeVisualization)).call(this, $container));

        _this.wireframe_cube_geometry = new THREE.BoxGeometry(1, 1, 1);
        _this.wireframe_cube = new THREE.BoxHelper(new THREE.Mesh(_this.wireframe_cube_geometry), 0xffffff);
        _this.scene.add(_this.wireframe_cube);

        _this.rgb_cube_geometry = new THREE.BoxGeometry(1, 1, 1);
        _this.rgb_cube_shader = require("../shaders/rgb-fragment.glsl");
        console.log(_this.rgb_cube_shader());
        //this.rgb_cube_mesh = new THREE.Mesh(this.rgb_cube_geometry, this.rgb_cube_mat);
        return _this;
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
        rgb_cube.render();
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

},{"../shaders/rgb-fragment.glsl":2}],2:[function(require,module,exports){
module.exports = function parse(params){
      var template = "testtest \n" +
" \n" 
      params = params || {}
      for(var key in params) {
        var matcher = new RegExp("{{"+key+"}}","g")
        template = template.replace(matcher, params[key])
      }
      return template
    };

},{}]},{},[1]);
