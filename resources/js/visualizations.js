/**
 * Created by lumpiluk on 9/21/16.
 */

class Visualization {
    constructor($container) {
        this.$container = $container;
        this.fov = 45;
        this.aspect = $container.width() / $container.height();
        this.near = 0.1;
        this.far = 10000;
        this.renderer = new THREE.WebGLRenderer();
        this.scene = new THREE.Scene();
        this.pivot = new THREE.Object3D(); // Pivot for rotation of camera and lights.
        this.camera = new THREE.PerspectiveCamera(
            this.fov, this.aspect, this.near, this.far
        );
        this.camera.position.set(0, 0, 0, 1);
        this.camera.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, 3));
        this.camera.lookAt(this.scene.position);
        this.pivot.add(this.camera);
        this.scene.add(this.pivot);
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
        this.rotating = false;
        this.drag_start = new THREE.Vector2(0, 0);
        this.$container.mousedown(function(event) {
            that.on_mouse_down.call(that, event);
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

    on_resize() {
        this.renderer.setSize(this.$container.width(), this.$container.height());
        this.camera.aspect = this.$container.width() / this.$container.height();
        this.camera.updateProjectionMatrix();
        this.render();
    }

    on_mouse_down(event) {
        this.drag_start.set(event.pageX, event.pageY);
        this.starting_rotation.copy(this.pivot.rotation);
        this.rotating = true;
        let that = this;
        document.addEventListener("mousemove", this.mouse_move_handler, false);
        document.addEventListener("mouseup", this.mouse_up_handler, false);
    }

    update_rotation(delta_x, delta_y) {
        this.current_rotation.y = (this.starting_rotation.y + delta_y) % (2 * Math.PI);
        this.current_rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2,
            (this.starting_rotation.x + delta_x) % (2 * Math.PI)));
        this.pivot.rotation.copy(this.current_rotation);
        this.render();
    }

    on_mouse_move(event) {
        if (!this.rotating) {
            return;
        }
        event.preventDefault();
        /* (y in delta_y is y-axis in 3D. Same for x in delta_x.) */
        let delta_y = -(event.pageX - this.drag_start.x) / $(window).width() * 2 * Math.PI;
        let delta_x = -(event.pageY - this.drag_start.y) / $(window).height() * 2 * Math.PI;
        this.update_rotation(delta_x, delta_y);
    }

    on_mouse_up(event) {
        this.rotating = false;
        document.removeEventListener("mousemove", this.mouse_move_handler, false);
        document.removeEventListener("mouseup", this.mouse_up_handler, false);
    }

    on_touch_start(event) {
        switch(event.touches.length) {
            case 1: /* One finger -> rotate! */
                event.preventDefault();
                this.drag_start.set(event.touches[0].pageX, event.touches[0].pageY);
                this.starting_rotation.copy(this.pivot.rotation);
                this.rotating = true;
                let that = this;
                document.addEventListener("mousemove", this.mouse_move_handler, false);
                document.addEventListener("mouseup", this.mouse_up_handler, false);
                break;
            case 2: /* Two fingers -> zoom! */

                break;
        }
    }

    on_touch_move(event) {
        if (!this.rotating) {
            return;
        }
        event.preventDefault();
        /* (y in delta_y is y-axis in 3D. Same for x in delta_x.) */
        let delta_y = -(event.touches[0].pageX - this.drag_start.x) / $(window).width() * 2 * Math.PI;
        let delta_x = -(event.touches[0].pageY - this.drag_start.y) / $(window).height() * 2 * Math.PI;
        this.update_rotation(delta_x, delta_y);
    }

    on_touch_cancel(event) {}

    on_touch_end(event) {
        this.on_mouse_up(event);
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
