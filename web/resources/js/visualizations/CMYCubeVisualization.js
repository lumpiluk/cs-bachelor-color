import {Visualization, DEFAULT_VERTEX_SHADER} from "./Visualization";
import {DynamicAnnotatedCube} from "../objects/DynamicAnnotatedCube";
import {
    ShaderMaterial,
    Vector3
} from "../../../bower_components/three.js/build/three";
import {CMYColorSystem} from "../color-systems/CMYColorSystem";
import {VisualizationControlSelect} from "../controls/VisualizationControlSelect";
import {UNITS_OPTIONS_DEFAULT} from "../color-systems/ColorSystemUnits";

const CMY_CUBE_SHADER = require("../../shaders/cmy-fragment.glsl");

export class CMYCubeVisualization extends Visualization {
    constructor($container) {
        super($container, new CMYColorSystem());

        /* Color system. */
        this.color_system.set_from_rgb(0, 0, 0);
        this.set_selected_color(0, 0, 0);

        this.cmy_cube_mat = new ShaderMaterial({
            vertexShader: DEFAULT_VERTEX_SHADER(),
            fragmentShader: CMY_CUBE_SHADER()
        });
        this.cmy_cube = new DynamicAnnotatedCube(this.cmy_cube_mat, "C", "M", "Y", new Vector3(1, 1, 1));
        this.cmy_cube.current_color_sprite.sprite_material.color.setRGB(0, 0, 0);
        this.scene.add(this.cmy_cube);

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
        let selected_rgb = this.color_system.get_rgb();
        this.set_selected_color(selected_rgb.r, selected_rgb.g, selected_rgb.b);

        this.cmy_cube.value.set(
            this.color_system.properties[0].value,
            this.color_system.properties[1].value,
            this.color_system.properties[2].value
        );
        this.cmy_cube.update_cube();

        this.cmy_cube.current_color_sprite.sprite_material.color.setRGB(
            selected_rgb.r, selected_rgb.g, selected_rgb.b);

        this.render();
    }

    show_only_color_solid_changed(event) {
        super.show_only_color_solid_changed(event);
        this.cmy_cube.show_only_color_solid(event.checked);
        this.render();
    }
}

/**
 * Finds all RGB cube visualizations in the document and initializes them.
 * @returns {Array} An array containing all newly added visualizations.
 */
export function attach_cmy_cube_visualizations() {
    let visualizations = [];
    $(".figure > .visualization.cmy-cube").each(function() {
        let cmy_cube = new CMYCubeVisualization($(this));
        cmy_cube.render();
        visualizations.push(cmy_cube);
    });
    return visualizations;
}
