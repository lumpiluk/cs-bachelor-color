/**
 * Created by lumpiluk on 9/25/16.
 */

import {Visualization, DEFAULT_VERTEX_SHADER} from "./Visualization";
import {ColorSystemProperty} from "./ColorSystemProperty";
import {VisualizationControlSlider} from "./VisualizationControlSlider";
//import "../../bower_components/rangetouch/dist/rangetouch";

export class RGBCubeVisualization extends Visualization {
    constructor($container) {
        super($container);

        this.wireframe_cube_geometry = new THREE.BoxGeometry(1, 1, 1);
        this.wireframe_cube = new THREE.BoxHelper(
            new THREE.Mesh(this.wireframe_cube_geometry),
            0x000000
        );
        this.wireframe_cube.applyMatrix(new THREE.Matrix4().makeTranslation(0.5, 0.5, 0.5));
        this.scene.add(this.wireframe_cube);

        this.rgb_cube_geometry = new THREE.BoxGeometry(1, 1, 1);
        this.rgb_cube_shader = require("../shaders/rgb-fragment.glsl");
        this.rgb_cube_mat = new THREE.ShaderMaterial({
            vertexShader: DEFAULT_VERTEX_SHADER(),
            fragmentShader: this.rgb_cube_shader()
        });
        this.rgb_cube_mesh = new THREE.Mesh(this.rgb_cube_geometry, this.rgb_cube_mat);
        this.rgb_cube_mesh.matrixAutoUpdate = false; // Makes adjusting world transforms easier.
        this.rgb_cube_mesh.applyMatrix(new THREE.Matrix4().makeTranslation(0.5, 0.5, 0.5));
        this.scene.add(this.rgb_cube_mesh);

        this.pivot.applyMatrix(new THREE.Matrix4().makeTranslation(0.5, 0.5, 0.5));

        /* Color system. */
        this.red_property = new ColorSystemProperty(1.0, 0.0, 1.0, "R", "r");
        this.green_property = new ColorSystemProperty(1.0, 0.0, 1.0, "G", "g");
        this.blue_property = new ColorSystemProperty(1.0, 0.0, 1.0, "B", "b");

        /* Initialize color system controls. */
        this.red_control = null;
        this.green_control = null;
        this.blue_control = null;
        if (this.$figure != null) {
            this.init_controls();
            this.init_advanced_controls();
        }

        /* Attach event handlers. */
        let that = this;
        this.red_property.add_listener((event) => that.on_color_system_property_change.call(this, event));
        this.blue_property.add_listener((event) => that.on_color_system_property_change.call(this, event));
        this.green_property.add_listener((event) => that.on_color_system_property_change.call(this, event));
    }

    init_controls() {
        super.init_controls();
        let $controls = this.$figure.find(".visualization-controls");
        if ($controls.length == 0) {
            return;
        }
        this.red_control = new VisualizationControlSlider(
            this.$figure.find(".visualization-controls"),
            this.red_property,
            0.001
        );
        this.green_control = new VisualizationControlSlider(
            this.$figure.find(".visualization-controls"),
            this.green_property,
            0.001
        );
        this.blue_control = new VisualizationControlSlider(
            this.$figure.find(".visualization-controls"),
            this.blue_property,
            0.001
        );
    }

    init_advanced_controls() {
        super.init_advanced_controls();
        let $controls = this.$figure.find(".visualization-controls-advanced");
        if ($controls.length == 0) {
            return;
        }

    }

    on_color_system_property_change(event) {
        switch (event.property) {
            case this.red_property:
                this.rgb_cube_mesh.scale.x = this.red_property.value;
                break;
            case this.green_property:
                this.rgb_cube_mesh.scale.y = this.green_property.value;
                break;
            case this.blue_property:
                this.rgb_cube_mesh.scale.z = this.blue_property.value;
                break;
        }
        this.rgb_cube_mesh.matrix.identity();
        this.rgb_cube_mesh.matrix.multiply(new THREE.Matrix4().makeTranslation(
            this.red_property.value / 2,
            this.green_property.value / 2,
            this.blue_property.value / 2
        ));
        this.rgb_cube_mesh.matrix.multiply(new THREE.Matrix4().makeScale(
            this.red_property.value,
            this.green_property.value,
            this.blue_property.value
        ));
        this.render();
    }
}
