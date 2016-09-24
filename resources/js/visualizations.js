/**
 * Created by lumpiluk on 9/21/16.
 */

class Visualization {
    constructor($container) {
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
        this.camera = new THREE.PerspectiveCamera(
            this.fov, this.aspect, this.near, this.far
        );
        this.camera.position.set(0, 0, 0, 1);
        this.camera.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, 3));
        this.camera.lookAt(this.scene.position);
        this.pivot.add(this.camera);
        this.scene.add(this.pivot);
        // this.scene.add(this.axis_helper);
        this.renderer.setClearColor(0x505050, 1);
        this.renderer.setSize(this.$container.width(), this.$container.height());

        this.$container.append(this.renderer.domElement);
        let that = this;
        $(window).resize(function() {
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
        this.$container.mousedown(function(event) {
            that.on_mouse_down.call(that, event);
        });
        this.$container.on("wheel", function(event) {
            that.on_wheel.call(that, event);
        });
        this.mouse_move_handler = function(event) { // Will be added to document on mouse down.
            that.on_mouse_move.call(that, event);
        };
        this.mouse_up_handler = function(event) { // Will be added to document on mouse down.
            that.on_mouse_up.call(that, event);
        };
        this.$container.on("touchstart", function(event) {
            that.on_touch_start.call(that, event);
        });
        this.$container.on("touchmove", function(event) {
            that.on_touch_move.call(that, event);
        });
        this.$container.on("touchcancel", function(event) {
            that.on_touch_cancel.call(that, event);
        });
        this.$container.on("touchend", function(event) {
            that.on_touch_end.call(that, event);
        });
    }

    render() {
        this.renderer.render(this.scene, this.camera);
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
        this.render();
    }

    on_mouse_up(event) {
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
        this.drag_start.set(event.touches[0].pageX, event.touches[0].pageY);
        this.starting_rotation.copy(this.pivot.rotation);
        this.dragging = true;
        switch(event.touches.length) {
            case 1: /* One finger -> rotate around y! */
                // event.preventDefault(); // Enabling this prevents scrolling.
                break;
            case 2: /* Two fingers -> pinch to zoom, rotation around x! */
                event.preventDefault();
                this.scale_start_distance = new THREE.Vector2(event.touches[0].pageX, event.touches[0].pageY)
                    .distanceTo(new THREE.Vector2(event.touches[1].pageX, event.touches[1].pageY));
                this.starting_focal_length = this.camera.getFocalLength();
                this.two_fingers_touching = true;
                break;
        }
        /* Temporarily add listeners to document so that dragging also works outside the canvas. */
        document.addEventListener("mousemove", this.mouse_move_handler, false);
        document.addEventListener("mouseup", this.mouse_up_handler, false);
    }

    on_touch_move(event) {
        if (!this.dragging) {
            return;
        }

        /*
         * Rotation.
         * (y in delta_y is y-axis in 3D. Same for x in delta_x.)
         */
        // TODO: use center point if two fingers are touching!
        let delta_y = -(event.touches[0].pageX - this.drag_start.x) / $(window).width() * 2 * Math.PI;
        let delta_x = -(event.touches[0].pageY - this.drag_start.y) / $(window).height() * 2 * Math.PI;
        if (!this.two_fingers_touching) {
            delta_x = 0;
        }
        this.update_rotation(delta_x, delta_y);

        /*
         * Scale.
         */
        if (this.two_fingers_touching) {
            event.preventDefault();
            let distance = new THREE.Vector2(event.touches[0].pageX, event.touches[0].pageY)
                .distanceTo(new THREE.Vector2(event.touches[1].pageX, event.touches[1].pageY));
            let s_delta = (distance - this.scale_start_distance) / $(window).width()
                * (this.max_focal_length - this.min_focal_length);
            this.update_scale(s_delta);
        }

        this.render();
    }

    on_touch_cancel(event) {}

    on_touch_end(event) {
        this.on_mouse_up(event);
        this.two_fingers_touching = false;
    }
}

class RGBCubeVisualization extends Visualization {
    constructor($container) {
        super($container);

        this.wireframe_cube_geometry = new THREE.BoxGeometry(1, 1, 1);
        this.wireframe_cube = new THREE.BoxHelper(
            new THREE.Mesh(this.wireframe_cube_geometry),
            0xffffff
        );
        this.scene.add(this.wireframe_cube);

        this.rgb_cube_geometry = new THREE.BoxGeometry(1, 1, 1);
        this.rgb_cube_shader = require("../shaders/rgb-fragment.glsl");
        console.log(this.rgb_cube_shader());
        //this.rgb_cube_mesh = new THREE.Mesh(this.rgb_cube_geometry, this.rgb_cube_mat);
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
