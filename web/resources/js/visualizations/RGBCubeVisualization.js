import {Visualization, DEFAULT_VERTEX_SHADER} from "./Visualization";
import {DynamicAnnotatedCube} from "../objects/DynamicAnnotatedCube";
import {RGBColorSystem} from "../color-systems/RGBColorSystem";
import {
    ShaderMaterial,
    Vector3
} from "../../../node_modules/three/build/three";
import {VisualizationControlSelect} from "../controls/VisualizationControlSelect";
import {UNITS_OPTIONS_DEFAULT} from "../color-systems/ColorSystemUnits";

const RGB_CUBE_SHADER = require("../../shaders/rgb-fragment.glsl");

export class RGBCubeVisualization extends Visualization {
    constructor($container) {
        super($container, new RGBColorSystem());

        /* Color system (set in super constructor). */
        this.color_system.set_from_rgb(1, 1, 1);

        this.rgb_cube_mat = new ShaderMaterial({
            vertexShader: DEFAULT_VERTEX_SHADER(),
            fragmentShader: RGB_CUBE_SHADER()
        });
        this.rgb_cube = new DynamicAnnotatedCube(this.rgb_cube_mat, "R", "G", "B", new Vector3(1, 1, 1));
        this.scene.add(this.rgb_cube);

        /* Initialize color system controls. */
        this.units_select_control = null;

        /* Rotate around center of the cube rather than the origin. */
        this.pivot.position.set(.5, .5, .5);
        /* Set initial rotation and zoom: */
        this.pivot.rotation.set(-Math.PI / 6, Math.PI / 5, 0, "YXZ"); // YXZ
        // this.camera.setFocalLength(1);

        /* Attach event handlers. */
        this.color_system.add_listener((event) => this.on_color_system_property_change(event));
    }

    init_advanced_controls() {
        super.init_advanced_controls(this.color_system.get_name());
        let $controls = this.$figure.find(".visualization-controls-advanced");
        if ($controls.length == 0) {
            return;
        }
        this.units_select_control = new VisualizationControlSelect(
            $controls, UNITS_OPTIONS_DEFAULT, "Units"
        );
        this.units_select_control.add_listener((event) =>
            this.color_system.change_units_to(event.option));
    }

    on_color_system_property_change(event) {
        let r = this.color_system.properties[0].value;
        let g = this.color_system.properties[1].value;
        let b = this.color_system.properties[2].value;

        this.set_selected_color(r, g, b);

        this.rgb_cube.value.set(r, g, b);
        this.rgb_cube.update_cube();

        this.rgb_cube.current_color_sprite.sprite_material.color.setRGB(r, g, b);

        this.render();
    }

    show_only_color_solid_changed(event) {
        super.show_only_color_solid_changed(event);
        this.rgb_cube.show_only_color_solid(event.checked);
        this.render();
    }
}

/**
 * Finds all RGB cube visualizations in the document and initializes them.
 * @returns {Array} An array containing all newly added visualizations.
 */
export function attach_rgb_cube_visualizations() {
    let visualizations = [];
    $(".figure > .visualization.rgb-cube").each(function() {
        let rgb_cube = new RGBCubeVisualization($(this));
        rgb_cube.render();
        visualizations.push(rgb_cube);
    });
    return visualizations;
}
