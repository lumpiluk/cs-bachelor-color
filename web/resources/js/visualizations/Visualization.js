import {Vector2, Euler, Matrix4, PerspectiveCamera, Object3D, WebGLRenderer, Scene}
    from "../../../bower_components/three.js/build/three";
import {rgb_to_css} from "../util";


/* Load .glsl shader file via browserify plugin browserify-shader. */
export let DEFAULT_VERTEX_SHADER = require("../../shaders/default-vertex.glsl");


export class Visualization {

    constructor($container) {
        let that = this; // for event listeners (which will typically not be called by this class)

        /**
         * If set to true, this.render() will keep updating until this.animating is false again.
         * @type {boolean}
         */
        this.animating = false;

        this.$container = $container;
        //this.$figure = $container.parent().hasClass("figure") ? $container.parent() : null;
        this.$figure = $container.closest(".figure");
        this.$figure = this.$figure.length > 0 ? this.$figure : null;

        this.$controls = this.$figure != null ? this.$figure.find(".visualization-controls") : null;
        if (this.$controls != null) {
            this.$controls = $('<div class="visualization-controls-group"></div>')
                .appendTo(this.$controls);
        }
        this.$controls_advanced = this.$figure != null ?
            this.$figure.find(".visualization-controls-advanced") : null;

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
        this.renderer = new WebGLRenderer({antialias: true});
        this.scene = new Scene();
        // this.axis_helper = new THREE.AxisHelper(5);
        this.pivot = new Object3D(); // Pivot for rotation of camera and maybe lights.
        this.camera = new PerspectiveCamera(
            this.fov, this.aspect, this.near, this.far
        );
        this.camera.position.set(0, 0, 0, 1);
        this.camera.applyMatrix(new Matrix4().makeTranslation(0, 0, 3));
        this.camera.lookAt(this.scene.position);
        this.pivot.add(this.camera);
        this.scene.add(this.pivot);
        // this.scene.add(this.axis_helper);
        this.renderer.setClearColor(0x505050, 1);
        this.renderer.setSize(this.$container.width(), this.$container.height());
        this.$container.append(this.renderer.domElement);

        $(window).resize(() => that.on_resize.call(that));
        // "that": Wordy way of calling a function to preserve "this". Necessary w/ arrow functions?

        /* Initialize navigation controls. */
        this.current_rotation = new Euler(0, 0, 0, "YXZ"); // YXZ for no "sideways" rotation.
        this.starting_rotation = new Euler(0, 0, 0, "YXZ");
        this.starting_focal_length = 0;
        this.dragging = false;
        this.two_fingers_touching = false;
        this.drag_start = new Vector2(0, 0);
        this.scale_start_distance = 0;
        this.$container.on("mousedown", (event) => that.on_mouse_down.call(that, event));
        this.$container.on("wheel", (event) => that.on_wheel.call(that, event));
        this.mouse_move_handler = (event) => that.on_mouse_move.call(that, event); // added to document on mouse down.
        this.mouse_up_handler = (event) => that.on_mouse_up.call(that, event); // added to document on mouse down.
        this.$container.on("touchstart", (event) => that.on_touch_start.call(that, event));
        this.$container.on("touchmove", (event) => that.on_touch_move.call(that, event));
        this.$container.on("touchcancel", (event) => that.on_touch_cancel.call(that, event));
        this.$container.on("touchend", (event) => that.on_touch_end.call(that, event));
    }

    render() {
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
    init_controls() {
        /* To be implemented in subclasses. */
    }

    /**
     * Add advanced controls to the figure for the current color system.
     * This requires that the visualization is inside a .figure and that this .figure contains a
     * .visualization-controls-advanced.
     * Not called in default constructor!
     */
    init_advanced_controls(color_system_name) {
        if (this.$figure.find(".visualization-controls-advanced-toggle").length == 0) {
            /* Add toggle for showing/hiding controls. */
            this.$controls_advanced.before(
                '<h3 class="visualization-controls-advanced-toggle">' +
                '<span class="arrow">&#x25B6;&nbsp;</span><span class="text">Advanced controls</span></h3>'
            );
            this.$controls_advanced.hide();
            let $toggle = this.$figure.find(".visualization-controls-advanced-toggle");
            let that = this;
            $toggle.click(function () {
                if (that.$controls_advanced.is(":visible")) {
                    $toggle.find(".arrow").removeClass("arrow-rotated");
                } else {
                    $toggle.find(".arrow").addClass("arrow-rotated");
                }
                that.$controls_advanced.toggle(300);
            });
        }

        this.$controls_advanced.append(
            '<h3 class="visualization-controls-system-header">' +
                color_system_name +
            '</h3>'
        );
    }

    update_rotation(delta_x, delta_y) {
        this.current_rotation.y = (this.starting_rotation.y + delta_y) % (2 * Math.PI);
        this.current_rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2,
            (this.starting_rotation.x + delta_x) % (2 * Math.PI)));
        this.pivot.rotation.copy(this.current_rotation);
    }

    update_scale(focal_length_delta) {
        this.camera.setFocalLength(Math.max(this.min_focal_length, Math.min(this.max_focal_length,
            this.starting_focal_length + focal_length_delta)));
    }

    on_resize() {
        /* Preserver aspect ratio. */
        this.$container.height(this.$container.width() / this.aspect);

        this.renderer.setSize(this.$container.width(), this.$container.height());
        this.camera.aspect = this.$container.width() / this.$container.height();
        this.camera.updateProjectionMatrix();
        this.render();
    }

    on_mouse_down(event) {
        this.drag_start.set(event.pageX, event.pageY);
        this.starting_rotation.copy(this.pivot.rotation);
        this.dragging = true;
        let that = this;
        document.addEventListener("mousemove", this.mouse_move_handler, false);
        document.addEventListener("mouseup", this.mouse_up_handler, false);

        this.animating = true;
        this.render();
    }

    on_mouse_move(event) {
        if (!this.dragging) {
            return;
        }
        event.preventDefault();
        /* (y in delta_y is y-axis in 3D. Same for x in delta_x.) */
        let delta_y = -(event.pageX - this.drag_start.x) / $(window).width() * 2 * Math.PI;
        let delta_x = -(event.pageY - this.drag_start.y) / $(window).height() * 2 * Math.PI;
        this.update_rotation(delta_x, delta_y);
    }

    on_mouse_up(event) {
        this.animating = false;
        this.dragging = false;
        document.removeEventListener("mousemove", this.mouse_move_handler, false);
        document.removeEventListener("mouseup", this.mouse_up_handler, false);
    }

    on_wheel(event) {
        let delta = -event.originalEvent.deltaY;
        event.preventDefault();
        switch (event.originalEvent.deltaMode) {
            /* see https://developer.mozilla.org/en-US/docs/Web/Events/wheel */
            case 0x00: // => Delta values in pixels.
                delta *= (this.max_focal_length - this.min_focal_length) / $(window).height();
                break;
            case 0x01: // => Delta values in lines.
            case 0x02: // => Delta values in pages.
                delta *= (this.max_focal_length - this.min_focal_length) / this.zoom_steps;
                break;
        }
        this.starting_focal_length = this.camera.getFocalLength();
        this.update_scale(delta * this.zoom_sensitivity);
        this.render();
    }

    on_touch_start(event) {
        let pageX = event.touches[0].pageX;
        let pageY = event.touches[0].pageY;
        if (event.touches.length == 2) {
            /* Use center point if two fingers are touching. */
            pageX = (event.touches[0].pageX + event.touches[1].pageX) / 2;
            pageY = (event.touches[0].pageY + event.touches[1].pageY) / 2;
        }
        this.drag_start.set(pageX, pageY);

        this.starting_rotation.copy(this.pivot.rotation);
        this.dragging = true;
        switch(event.touches.length) {
            case 1: /* One finger -> rotate around y! */
                // event.preventDefault(); // Enabling this prevents scrolling.
                break;
            case 2: /* Two fingers -> pinch to zoom, rotation around x! */
                event.preventDefault();
                this.scale_start_distance = new Vector2(event.touches[0].pageX, event.touches[0].pageY)
                    .distanceTo(new Vector2(event.touches[1].pageX, event.touches[1].pageY));
                this.starting_focal_length = this.camera.getFocalLength();
                this.two_fingers_touching = true;
                break;
        }

        this.animating = true;
        this.render();
    }

    on_touch_move(event) {
        if (!this.dragging) {
            return;
        }

        /*
         * Rotation.
         * (y in delta_y is y-axis in 3D. Same for x in delta_x.)
         */
        let pageX = event.touches[0].pageX;
        let pageY = event.touches[0].pageY;
        if (this.two_fingers_touching && event.touches.length == 2) {
            /* Use center point if two fingers are touching. */
            pageX = (event.touches[0].pageX + event.touches[1].pageX) / 2;
            pageY = (event.touches[0].pageY + event.touches[1].pageY) / 2;
        }
        let delta_y = -(pageX - this.drag_start.x) / $(window).width() * 2 * Math.PI;
        let delta_x = -(pageY - this.drag_start.y) / $(window).height() * 2 * Math.PI;
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
            let distance = new Vector2(event.touches[0].pageX, event.touches[0].pageY)
                .distanceTo(new Vector2(event.touches[1].pageX, event.touches[1].pageY));
            let s_delta = (distance - this.scale_start_distance) / $(window).width()
                * (this.max_focal_length - this.min_focal_length);
            this.update_scale(s_delta);
        }
    }

    on_touch_cancel(event) {
        this.on_touch_end(event);
    }

    on_touch_end(event) {
        this.on_mouse_up(event);
        this.two_fingers_touching = false;
    }

    set_selected_color(r, g, b) {
        if (this.$figure == null) {
            return;
        }
        let css_color = rgb_to_css(r, g, b);
        this.$figure.find(".selected-color").css("background-color", css_color)
    }
}
