import {Visualization, DEFAULT_VERTEX_SHADER} from "./Visualization";
import {DynamicAnnotatedCube} from "../objects/DynamicAnnotatedCube";
import {ColorSystemProperty} from "../color-systems/ColorSystemProperty";
import {VisualizationControlSlider} from "../controls/VisualizationControlSlider";
import {
    ShaderMaterial,
    Vector3
} from "../../../bower_components/three.js/build/three";


const RGB_CUBE_SHADER = require("../../shaders/rgb-fragment.glsl");

export class RGBCubeVisualization extends Visualization {
    constructor($container) {
        super($container);

        this.rgb_cube_mat = new ShaderMaterial({
            vertexShader: DEFAULT_VERTEX_SHADER(),
            fragmentShader: RGB_CUBE_SHADER()
        });
        this.rgb_cube = new DynamicAnnotatedCube(this.rgb_cube_mat, "R", "G", "B", new Vector3(1, 1, 1));
        this.scene.add(this.rgb_cube);

        /* Rotate around center of the cube rather than the origin. */
        this.pivot.position.set(.5, .5, .5);

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
        this.red_property.add_listener((event) => that.on_color_system_property_change.call(that, event));
        this.blue_property.add_listener((event) => that.on_color_system_property_change.call(that, event));
        this.green_property.add_listener((event) => that.on_color_system_property_change.call(that, event));
    }

    init_controls() {
        super.init_controls();
        let $controls = this.$figure.find(".visualization-controls");
        if ($controls.length == 0) {
            return;
        }
        this.red_control = new VisualizationControlSlider(
            $controls,
            this.red_property,
            0.001
        );
        this.green_control = new VisualizationControlSlider(
            $controls,
            this.green_property,
            0.001
        );
        this.blue_control = new VisualizationControlSlider(
            $controls,
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
        // TODO?
    }

    on_color_system_property_change(event) {
        this.set_selected_color(this.red_property.value, this.green_property.value, this.blue_property.value);

        this.rgb_cube.value.set(
            this.red_property.value,
            this.green_property.value,
            this.blue_property.value
        );
        this.rgb_cube.update_cube();

        this.rgb_cube.current_color_sprite.sprite_material.color.setRGB(
            this.red_property.value,
            this.green_property.value,
            this.blue_property.value
        );

        this.render();
    }
}

/**
 * Finds all RGB cube visualizations in the document and initializes them.
 * @returns {Array} An array containing all newly added visualizations.
 */
export function attach_rgb_cube_visualizations() {
    let visualizations = [];
    $(".visualization.rgb-cube").each(function() {
        let rgb_cube = new RGBCubeVisualization($(this));
        rgb_cube.render();
        visualizations.push(rgb_cube);
    });
    return visualizations;
}
