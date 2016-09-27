(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by lumpiluk on 9/27/16.
 */

/**
 * Adapted from https://stemkoski.github.io/Three.js/Sprite-Text-Labels.html.
 */
var CircleSprite = exports.CircleSprite = function CircleSprite(scale, texture_size, border_size) {
    _classCallCheck(this, CircleSprite);

    var canvas = document.createElement('canvas');
    canvas.width = texture_size;
    canvas.height = texture_size;
    var context = canvas.getContext('2d');

    context.fillStyle = "rgba(100%, 100%, 100%, 1.0)";
    context.lineWidth = border_size;
    context.strokeStyle = "rgba(0, 0, 0, 1)";
    context.beginPath();
    context.arc((texture_size - 1) / 2, (texture_size - 1) / 2, (texture_size - 1 - border_size) / 2, // border_size * 2 / 2
    0, 2 * Math.PI);
    context.fill();
    context.stroke();

    // canvas contents will be used for a texture
    this.texture = new THREE.Texture(canvas);
    this.texture.needsUpdate = true;

    this.sprite_material = new THREE.SpriteMaterial({
        color: 0xffffff, // Texture is multiplied by this color.
        map: this.texture,
        rotation: 0,
        fog: false
    });
    this.sprite = new THREE.Sprite(this.sprite_material);
    this.sprite.scale.set(scale, scale, 1);
};

},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by lumpiluk on 9/21/16.
 */

var ColorSystemPropertyChangeEvent = function ColorSystemPropertyChangeEvent(property) {
    _classCallCheck(this, ColorSystemPropertyChangeEvent);

    this.property = property;
};

var ColorSystemProperty = exports.ColorSystemProperty = function () {
    /**
     *
     * @param initial_value An initial value.
     * @param name Name of this property as it will appear on labels.
     * @param short_name An name that can be used as part of an html id.
     * @param min Minimum value.
     * @param max Maximum value.
     */
    function ColorSystemProperty(initial_value, min, max, name, short_name) {
        _classCallCheck(this, ColorSystemProperty);

        this.value = initial_value;
        this.name = name;
        this.short_name = short_name;
        this.min = min;
        this.max = max;
        this.change_listeners = [];
    }

    _createClass(ColorSystemProperty, [{
        key: "add_listener",
        value: function add_listener(callback) {
            this.change_listeners.push(callback);
        }
    }, {
        key: "set_value",
        value: function set_value(value) {
            this.value = value;
            var event = new ColorSystemPropertyChangeEvent(this);
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.change_listeners[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var callback = _step.value;

                    callback(event);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }
    }]);

    return ColorSystemProperty;
}();

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.RGBCubeVisualization = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _Visualization2 = require("./Visualization");

var _TextSprite = require("./TextSprite");

var _CircleSprite = require("./CircleSprite");

var _ColorSystemProperty = require("./ColorSystemProperty");

var _VisualizationControlSlider = require("./VisualizationControlSlider");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Created by lumpiluk on 9/25/16.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

//import "../../bower_components/rangetouch/dist/rangetouch";

var RGB_CUBE_SHADER = require("../shaders/rgb-fragment.glsl");

var RGBCubeVisualization = exports.RGBCubeVisualization = function (_Visualization) {
    _inherits(RGBCubeVisualization, _Visualization);

    function RGBCubeVisualization($container) {
        _classCallCheck(this, RGBCubeVisualization);

        var _this = _possibleConstructorReturn(this, (RGBCubeVisualization.__proto__ || Object.getPrototypeOf(RGBCubeVisualization)).call(this, $container));

        _this.rgb_cube_geometry = new THREE.BoxGeometry(1, 1, 1);
        _this.rgb_cube_mat = new THREE.ShaderMaterial({
            vertexShader: (0, _Visualization2.DEFAULT_VERTEX_SHADER)(),
            fragmentShader: RGB_CUBE_SHADER()
        });
        _this.rgb_cube_mesh = new THREE.Mesh(_this.rgb_cube_geometry, _this.rgb_cube_mat);
        _this.rgb_cube_mesh.matrixAutoUpdate = false; // Makes adjusting world transforms easier.
        _this.rgb_cube_mesh.applyMatrix(new THREE.Matrix4().makeTranslation(0.5, 0.5, 0.5));
        _this.scene.add(_this.rgb_cube_mesh);

        /* Coordinate system, arrows. */
        /* Cube bounding box. */
        _this.wireframe_cube_geometry = new THREE.BoxGeometry(1, 1, 1);
        _this.wireframe_cube = new THREE.BoxHelper(new THREE.Mesh(_this.wireframe_cube_geometry), 0x000000);
        _this.wireframe_cube.matrixAutoUpdate = false; // Object won't move dynamically anyway.
        _this.wireframe_cube.applyMatrix(new THREE.Matrix4().makeTranslation(0.5, 0.5, 0.5));
        _this.scene.add(_this.wireframe_cube);
        /*
         * Arrows.
         * Helpful example: view-source:https://stemkoski.github.io/Three.js/Helpers.html
         */
        var arrow_origin = new THREE.Vector3(-.01, -.01, -.01);
        var arrow_length = 1.15;
        var arrow_color_hex = 0xffffff;
        var arrow_head_length = 0.1;
        var arrow_head_width = 0.05;
        _this.arrow_red = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), arrow_origin, arrow_length, arrow_color_hex, arrow_head_length, arrow_head_width);
        _this.arrow_green = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), arrow_origin, arrow_length, arrow_color_hex, arrow_head_length, arrow_head_width);
        _this.arrow_blue = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), arrow_origin, arrow_length, arrow_color_hex, arrow_head_length, arrow_head_width);
        _this.scene.add(_this.arrow_red);
        _this.scene.add(_this.arrow_green);
        _this.scene.add(_this.arrow_blue);
        /* Labels */
        _this.label_red = new _TextSprite.TextSprite("R", 0.15);
        _this.label_red.sprite.position.set(1.2, -.1, -.1);
        _this.scene.add(_this.label_red.sprite);
        _this.label_green = new _TextSprite.TextSprite("G", 0.15);
        _this.label_green.sprite.position.set(-.1, 1.2, -.1);
        _this.scene.add(_this.label_green.sprite);
        _this.label_blue = new _TextSprite.TextSprite("B", 0.15);
        _this.label_blue.sprite.position.set(-.1, -.1, 1.2);
        _this.scene.add(_this.label_blue.sprite);
        _this.label_origin = new _TextSprite.TextSprite("0", 0.15);
        _this.label_origin.sprite.position.set(-.1, -.1, -.1);
        _this.scene.add(_this.label_origin.sprite);
        /* Current color indicator. */
        //this.current_color_sphere_geometry = new THREE.SphereGeometry(.05, 7, 7);
        //this.current_color_material = new THREE.MeshBasicMaterial({color: 0xffffff});
        //this.current_color_sphere_mesh = new THREE.Mesh(this.current_color_sphere_geometry,
        //    this.current_color_material);
        //this.current_color_sphere_mesh.position.set(1, 1, 1);
        //this.scene.add(this.current_color_sphere_mesh);
        _this.current_color_sprite = new _CircleSprite.CircleSprite(.1, 256, 10);
        _this.current_color_sprite.sprite_material.color.setRGB(1, 1, 1);
        _this.current_color_sprite.sprite.position.set(1, 1, 1);
        _this.scene.add(_this.current_color_sprite.sprite);

        /* Rotate around center of the cube rather than the origin. */
        _this.pivot.applyMatrix(new THREE.Matrix4().makeTranslation(0.5, 0.5, 0.5));

        /* Color system. */
        _this.red_property = new _ColorSystemProperty.ColorSystemProperty(1.0, 0.0, 1.0, "R", "r");
        _this.green_property = new _ColorSystemProperty.ColorSystemProperty(1.0, 0.0, 1.0, "G", "g");
        _this.blue_property = new _ColorSystemProperty.ColorSystemProperty(1.0, 0.0, 1.0, "B", "b");

        /* Initialize color system controls. */
        _this.red_control = null;
        _this.green_control = null;
        _this.blue_control = null;
        if (_this.$figure != null) {
            _this.init_controls();
            _this.init_advanced_controls();
        }

        /* Attach event handlers. */
        var that = _this;
        _this.red_property.add_listener(function (event) {
            return that.on_color_system_property_change.call(_this, event);
        });
        _this.blue_property.add_listener(function (event) {
            return that.on_color_system_property_change.call(_this, event);
        });
        _this.green_property.add_listener(function (event) {
            return that.on_color_system_property_change.call(_this, event);
        });
        return _this;
    }

    _createClass(RGBCubeVisualization, [{
        key: "init_controls",
        value: function init_controls() {
            _get(RGBCubeVisualization.prototype.__proto__ || Object.getPrototypeOf(RGBCubeVisualization.prototype), "init_controls", this).call(this);
            var $controls = this.$figure.find(".visualization-controls");
            if ($controls.length == 0) {
                return;
            }
            this.red_control = new _VisualizationControlSlider.VisualizationControlSlider(this.$figure.find(".visualization-controls"), this.red_property, 0.001);
            this.green_control = new _VisualizationControlSlider.VisualizationControlSlider(this.$figure.find(".visualization-controls"), this.green_property, 0.001);
            this.blue_control = new _VisualizationControlSlider.VisualizationControlSlider(this.$figure.find(".visualization-controls"), this.blue_property, 0.001);
        }
    }, {
        key: "init_advanced_controls",
        value: function init_advanced_controls() {
            _get(RGBCubeVisualization.prototype.__proto__ || Object.getPrototypeOf(RGBCubeVisualization.prototype), "init_advanced_controls", this).call(this);
            var $controls = this.$figure.find(".visualization-controls-advanced");
            if ($controls.length == 0) {
                return;
            }
            // TODO?
        }
    }, {
        key: "on_color_system_property_change",
        value: function on_color_system_property_change(event) {
            this.set_selected_color("rgb(" + (this.red_property.value * 100).toString() + "%, " + (this.green_property.value * 100).toString() + "%, " + (this.blue_property.value * 100).toString() + "%)");

            this.rgb_cube_mesh.matrix.identity();
            this.rgb_cube_mesh.matrix.multiply(new THREE.Matrix4().makeTranslation(this.red_property.value / 2, this.green_property.value / 2, this.blue_property.value / 2));
            this.rgb_cube_mesh.matrix.multiply(new THREE.Matrix4().makeScale(this.red_property.value, this.green_property.value, this.blue_property.value));

            this.current_color_sprite.sprite.position.set(this.red_property.value, this.green_property.value, this.blue_property.value);
            this.current_color_sprite.sprite_material.color.setRGB(this.red_property.value, this.green_property.value, this.blue_property.value);

            this.render();
        }
    }]);

    return RGBCubeVisualization;
}(_Visualization2.Visualization);

},{"../shaders/rgb-fragment.glsl":9,"./CircleSprite":1,"./ColorSystemProperty":2,"./TextSprite":4,"./Visualization":5,"./VisualizationControlSlider":6}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by lumpiluk on 9/27/16.
 */

var TEXTURE_SIZE = 256;

/**
 * Adapted from https://stemkoski.github.io/Three.js/Sprite-Text-Labels.html.
 */

var TextSprite = exports.TextSprite = function () {
    function TextSprite(text, scale) {
        _classCallCheck(this, TextSprite);

        var fontface = "sans-serif";
        var fontsize = 240;
        var border_thickness = 4;

        var canvas = document.createElement('canvas');
        canvas.width = TEXTURE_SIZE;
        canvas.height = TEXTURE_SIZE;
        var context = canvas.getContext('2d');
        //context.font = "Bold " + fontsize + "px " + fontface;
        context.font = fontsize + "px " + fontface;

        // get size data (height depends only on font size)
        var text_width = context.measureText(text).width;

        //DEBUG
        /*
        context.fillStyle = "rgba(0, 0, 0, 1)";
        context.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
        */

        // text color
        context.fillStyle = "rgba(100%, 100%, 100%, 1.0)";
        context.fillText(text, 0, fontsize);

        // canvas contents will be used for a texture
        this.texture = new THREE.Texture(canvas);
        this.texture.needsUpdate = true;

        this.sprite_material = new THREE.SpriteMaterial({
            color: 0xffffff, // Texture is multiplied by this color.
            map: this.texture,
            rotation: 0,
            fog: false
        });
        this.sprite = new THREE.Sprite(this.sprite_material);
        this.sprite.scale.set(scale, scale, 1);
    }

    _createClass(TextSprite, [{
        key: 'get_sprite',
        value: function get_sprite() {
            return this.sprite;
        }
    }]);

    return TextSprite;
}();

},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by lumpiluk on 9/25/16.
 */

/* Load .glsl shader file via browserify plugin browserify-shader. */
var DEFAULT_VERTEX_SHADER = exports.DEFAULT_VERTEX_SHADER = require("../shaders/default-vertex.glsl");

var Visualization = exports.Visualization = function () {
    function Visualization($container) {
        _classCallCheck(this, Visualization);

        var that = this; // for event listeners (which will typically not be called by this class)

        /**
         * If set to true, this.render() will keep updating until this.animating is false again.
         * @type {boolean}
         */
        this.animating = false;

        this.$container = $container;
        this.$figure = $container.parent().hasClass("figure") ? $container.parent() : null;
        this.fov = 45;
        this.min_focal_length = 10; // for zooming, assuming full frame (35mm) camera sensor
        this.max_focal_length = 400; // for zooming
        this.zoom_steps = 20; // (if available)
        this.zoom_sensitivity = 0.25; // For mouse wheels. Lower => more sensitive.
        // this.aspect = $container.width() / $container.height(); // should be ~3/2
        this.aspect = 3 / 2; // 3 / 2;
        this.$container.height(this.$container.width() / this.aspect); // Apply aspect ratio (for camera and renderer).
        this.near = 0.1;
        this.far = 10000;

        /* Initialize three.js. */
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.scene = new THREE.Scene();
        // this.axis_helper = new THREE.AxisHelper(5);
        this.pivot = new THREE.Object3D(); // Pivot for rotation of camera and maybe lights.
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

        $(window).resize(function () {
            return that.on_resize.call(that);
        });
        // "that": Wordy way of calling a function to preserve "this". Necessary w/ arrow functions?

        /* Initialize navigation controls. */
        this.current_rotation = new THREE.Euler(0, 0, 0, "YXZ"); // YXZ for no "sideways" rotation.
        this.starting_rotation = new THREE.Euler(0, 0, 0, "YXZ");
        this.starting_focal_length = 0;
        this.dragging = false;
        this.two_fingers_touching = false;
        this.drag_start = new THREE.Vector2(0, 0);
        this.scale_start_distance = 0;
        this.$container.on("mousedown", function (event) {
            return that.on_mouse_down.call(that, event);
        });
        this.$container.on("wheel", function (event) {
            return that.on_wheel.call(that, event);
        });
        this.mouse_move_handler = function (event) {
            return that.on_mouse_move.call(that, event);
        }; // added to document on mouse down.
        this.mouse_up_handler = function (event) {
            return that.on_mouse_up.call(that, event);
        }; // added to document on mouse down.
        this.$container.on("touchstart", function (event) {
            return that.on_touch_start.call(that, event);
        });
        this.$container.on("touchmove", function (event) {
            return that.on_touch_move.call(that, event);
        });
        this.$container.on("touchcancel", function (event) {
            return that.on_touch_cancel.call(that, event);
        });
        this.$container.on("touchend", function (event) {
            return that.on_touch_end.call(that, event);
        });
    }

    _createClass(Visualization, [{
        key: "render",
        value: function render() {
            if (this.animating) {
                requestAnimationFrame(this.render.bind(this)); // bind(this) to preserve "this" context
            }
            this.renderer.render(this.scene, this.camera);
        }

        /**
         * Add controls to the figure for the current color system.
         * This requires that the visualization is inside a .figure and that this .figure contains a
         * .visualization-controls.
         * Not called in default constructor!
         */

    }, {
        key: "init_controls",
        value: function init_controls() {}
        /* To be implemented in subclasses. */


        /**
         * Add advanced controls to the figure for the current color system.
         * This requires that the visualization is inside a .figure and that this .figure contains a
         * .visualization-controls-advanced.
         * Not called in default constructor!
         */

    }, {
        key: "init_advanced_controls",
        value: function init_advanced_controls() {
            /* To be implemented in subclasses. */
            // TODO: Setting to show only the color space w/o axes, wireframe etc.?
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
            /* Preserver aspect ratio. */
            this.$container.height(this.$container.width() / this.aspect);

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

            this.animating = true;
            this.render();
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
        }
    }, {
        key: "on_mouse_up",
        value: function on_mouse_up(event) {
            this.animating = false;
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
            var pageX = event.touches[0].pageX;
            var pageY = event.touches[0].pageY;
            if (event.touches.length == 2) {
                /* Use center point if two fingers are touching. */
                pageX = (event.touches[0].pageX + event.touches[1].pageX) / 2;
                pageY = (event.touches[0].pageY + event.touches[1].pageY) / 2;
            }
            this.drag_start.set(pageX, pageY);

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

            this.animating = true;
            this.render();
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
            var pageX = event.touches[0].pageX;
            var pageY = event.touches[0].pageY;
            if (this.two_fingers_touching && event.touches.length == 2) {
                /* Use center point if two fingers are touching. */
                pageX = (event.touches[0].pageX + event.touches[1].pageX) / 2;
                pageY = (event.touches[0].pageY + event.touches[1].pageY) / 2;
            }
            var delta_y = -(pageX - this.drag_start.x) / $(window).width() * 2 * Math.PI;
            var delta_x = -(pageY - this.drag_start.y) / $(window).height() * 2 * Math.PI;
            if (!this.two_fingers_touching || event.touches.length != 2) {
                /* If swiping up or down with only one finger, don't rotate. */
                delta_x = 0;
            }
            this.update_rotation(delta_x, delta_y);

            /*
             * Scale.
             */
            if (this.two_fingers_touching && event.touches.length == 2) {
                event.preventDefault();
                var distance = new THREE.Vector2(event.touches[0].pageX, event.touches[0].pageY).distanceTo(new THREE.Vector2(event.touches[1].pageX, event.touches[1].pageY));
                var s_delta = (distance - this.scale_start_distance) / $(window).width() * (this.max_focal_length - this.min_focal_length);
                this.update_scale(s_delta);
            }
        }
    }, {
        key: "on_touch_cancel",
        value: function on_touch_cancel(event) {
            this.on_touch_end(event);
        }
    }, {
        key: "on_touch_end",
        value: function on_touch_end(event) {
            this.on_mouse_up(event);
            this.two_fingers_touching = false;
        }
    }, {
        key: "set_selected_color",
        value: function set_selected_color(css_color) {
            if (this.$figure == null) {
                return;
            }
            this.$figure.find(".selected-color").css("background-color", css_color);
        }
    }]);

    return Visualization;
}();

},{"../shaders/default-vertex.glsl":8}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by lumpiluk on 9/26/16.
 */

var VisualizationControlSlider = exports.VisualizationControlSlider = function () {
    function VisualizationControlSlider($parent, color_system_property, step) {
        _classCallCheck(this, VisualizationControlSlider);

        this.$parent = parent;
        this.color_system_property = color_system_property;
        this.control_id = Math.floor(Math.random() * 1e+15).toString();
        this.slider_id = "vis-ctrl-" + this.control_id + "-slider";
        this.number_id = "vis-ctrl-" + this.control_id + "-number";

        var ranges = 'min="' + this.color_system_property.min + '" ' + 'max="' + this.color_system_property.max + '" ' + 'step="' + step.toString() + '" ' + 'value="' + this.color_system_property.value.toString() + '"';

        $parent.append('<div class="visualization-control slider">' + '<label for="' + this.slider_id + '">' + this.color_system_property.name + ':</label>' + '<input type="number" value="' + this.color_system_property.value.toString() + '" id="' + this.number_id + '" ' + ranges + ' />' + '<span class="slider-container">' + '<input type="range" name="' + this.slider_id + '" id="' + this.slider_id + '" ' + ranges + ' />' + '</span>' + '</div>');

        /* Attach event handlers. */
        var that = this;
        $("#" + this.slider_id).on("input", function (event) {
            return that.on_slider_change.call(that, event);
        });
        $("#" + this.number_id).on("change", function (event) {
            return that.on_number_change.call(that, event);
        });
    }

    _createClass(VisualizationControlSlider, [{
        key: "on_slider_change",
        value: function on_slider_change(event) {
            $("#" + this.number_id).val(event.target.value);
            this.color_system_property.set_value(event.target.value);
        }
    }, {
        key: "on_number_change",
        value: function on_number_change(event) {
            $("#" + this.slider_id).val(event.target.value);
            this.color_system_property.set_value(event.target.value);
        }
    }]);

    return VisualizationControlSlider;
}();

},{}],7:[function(require,module,exports){
"use strict";

var _RGBCubeVisualization = require("./RGBCubeVisualization");

/**
 * List of visualizations in this document.
 * @type {Array}
 */
var visualizations = [];

/**
 * Matches each figure (HTML-)ID to the figure's visible number in the document.
 * @type {{}}
 */
/**
 * Created by lumpiluk on 9/21/16.
 */

// import {Visualization, DEFAULT_VERTEX_SHADER} from "./Visualization";
var figures = {};

$(document).ready(function () {
  /*
   * Find and initialize all visualizations as soon as the page is loaded.
   */
  console.log("Initializing visualizations.");
  $(".visualization.rgb-cube").each(function () {
    var rgb_cube = new _RGBCubeVisualization.RGBCubeVisualization($(this));
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

},{"./RGBCubeVisualization":3}],8:[function(require,module,exports){
module.exports = function parse(params){
      var template = "/* \n" +
" * Predefined built-in uniforms and attributes for vertex shader: \n" +
" * http://threejs.org/docs/api/renderers/webgl/WebGLProgram.html \n" +
" \n" +
" * // = object.matrixWorld \n" +
" * uniform mat4 modelMatrix; \n" +
" \n" +
" * // = camera.matrixWorldInverse * object.matrixWorld \n" +
" * uniform mat4 modelViewMatrix; \n" +
" \n" +
" * // = camera.projectionMatrix \n" +
" * uniform mat4 projectionMatrix; \n" +
" \n" +
" * // = camera.matrixWorldInverse \n" +
" * uniform mat4 viewMatrix; \n" +
" \n" +
" * // = inverse transpose of modelViewMatrix \n" +
" * uniform mat3 normalMatrix; \n" +
" \n" +
" * // = camera position in world space \n" +
" * uniform vec3 cameraPosition; \n" +
" * \n" +
" * Additionally from GLSL: \n" +
" * https://www.opengl.org/wiki/Built-in_Variable_(GLSL) \n" +
" * gl_FragCoord \n" +
" */ \n" +
" \n" +
"/* \n" +
"  Fragment position in world space. \n" +
"  Thanks to \n" +
"  https://www.opengl.org/discussion_boards/showthread.php/163272-How-do-I-get-a-fragments-x-y-z-in-world-coordinates-in-the-fragment-shader \n" +
"  and \n" +
"  https://en.wikibooks.org/wiki/GLSL_Programming/Unity/Shading_in_World_Space \n" +
"*/ \n" +
"varying vec4 worldCoord; \n" +
" \n" +
"/** \n" +
" * Multiply each vertex by the \n" +
" * model-view matrix and the \n" +
" * projection matrix (both provided \n" +
" * by Three.js) to get a final \n" +
" * vertex position. \n" +
" * (Copied from https://aerotwist.com/tutorials/an-introduction-to-shaders-part-1/) \n" +
" */ \n" +
"void main() { \n" +
"    worldCoord = modelMatrix * vec4(position,1.0); \n" +
" \n" +
"    gl_Position = projectionMatrix * \n" +
"                  modelViewMatrix * \n" +
"                  vec4(position,1.0); \n" +
"} \n" 
      params = params || {}
      for(var key in params) {
        var matcher = new RegExp("{{"+key+"}}","g")
        template = template.replace(matcher, params[key])
      }
      return template
    };

},{}],9:[function(require,module,exports){
module.exports = function parse(params){
      var template = "varying vec4 worldCoord; \n" +
" \n" +
"void main() { \n" +
"    /* worldPos = ModelView^(-1) * Projection^(-1) * p */ \n" +
"    /*mat4 normalMatrix4 = mat4(varNormalMatrix); \n" +
"    normalMatrix4[3][3] = 1.0; \n" +
"    vec4 worldPositionTmp = normalMatrix4 * gl_FragCoord; \n" +
"    vec4 worldPosition = vec4( \n" +
"        worldPositionTmp.x, \n" +
"        worldPositionTmp.y, \n" +
"        worldPositionTmp.z, \n" +
"        worldPositionTmp.z / gl_FragCoord.w // undo perspective projection matrix \n" +
"    );*/ \n" +
"    gl_FragColor = vec4(worldCoord.x, \n" +
"                        worldCoord.y, \n" +
"                        worldCoord.z, \n" +
"                        1.0); \n" +
"} \n" +
" \n" 
      params = params || {}
      for(var key in params) {
        var matcher = new RegExp("{{"+key+"}}","g")
        template = template.replace(matcher, params[key])
      }
      return template
    };

},{}]},{},[7]);
