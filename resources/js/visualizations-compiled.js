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
        this.aspect = $container.width() / $container.height();
        this.near = 0.1;
        this.far = 10000;
        this.renderer = new THREE.WebGLRenderer();
        this.scene = new THREE.Scene();
        this.pivot = new THREE.Object3D(); // Pivot for rotation of camera and lights.
        this.camera = new THREE.PerspectiveCamera(this.fov, this.aspect, this.near, this.far);
        this.camera.position.set(0, 0, 0, 1);
        this.camera.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, 3));
        this.camera.lookAt(this.scene.position);
        this.pivot.add(this.camera);
        this.scene.add(this.pivot);
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
        this.rotating = false;
        this.drag_start = new THREE.Vector2(0, 0);
        this.$container.mousedown(function (event) {
            that.on_mouse_down.call(that, event);
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
            this.rotating = true;
            var that = this;
            document.addEventListener("mousemove", this.mouse_move_handler, false);
            document.addEventListener("mouseup", this.mouse_up_handler, false);
        }
    }, {
        key: "on_mouse_move",
        value: function on_mouse_move(event) {
            if (!this.rotating) {
                return;
            }
            event.preventDefault();
            /* (y in delta_y is y-axis in 3D. Same for x in delta_x.) */
            var delta_y = -(event.pageX - this.drag_start.x) / $(window).width() * 2 * Math.PI;
            var delta_x = -(event.pageY - this.drag_start.y) / $(window).height() * 2 * Math.PI;
            this.current_rotation.y = (this.starting_rotation.y + delta_y) % (2 * Math.PI);
            this.current_rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, (this.starting_rotation.x + delta_x) % (2 * Math.PI)));
            this.pivot.rotation.copy(this.current_rotation);
            this.render();
        }
    }, {
        key: "on_mouse_up",
        value: function on_mouse_up(event) {
            this.rotating = false;
            document.removeEventListener("mousemove", this.mouse_move_handler, false);
            document.removeEventListener("mouseup", this.mouse_up_handler, false);
        }
    }, {
        key: "on_touch_start",
        value: function on_touch_start(event) {
            switch (event.touches.length) {
                case 1:
                    /* One finger -> rotate! */
                    event.preventDefault();
                    this.drag_start.set(event.touches[0].pageX, event.touches[0].pageY);
                    this.starting_rotation.copy(this.pivot.rotation);
                    this.rotating = true;
                    var that = this;
                    document.addEventListener("mousemove", this.mouse_move_handler, false);
                    document.addEventListener("mouseup", this.mouse_up_handler, false);
                    break;
                case 2:
                    /* Two fingers -> zoom! */

                    break;
            }
        }
    }, {
        key: "on_touch_move",
        value: function on_touch_move(event) {
            this.on_mouse_move(event);
        }
    }, {
        key: "on_touch_cancel",
        value: function on_touch_cancel(event) {}
    }, {
        key: "on_touch_end",
        value: function on_touch_end(event) {
            this.on_mouse_up(event);
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

//# sourceMappingURL=visualizations-compiled.js.map