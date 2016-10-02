import {Visualization, DEFAULT_VERTEX_SHADER} from "./Visualization";
import {DynamicAnnotatedCube} from "../objects/DynamicAnnotatedCube";
import {ColorSystemProperty} from "../ColorSystemProperty";
import {VisualizationControlSlider} from "../controls/VisualizationControlSlider";
import {
    ShaderMaterial,
    Vector3
} from "../../../bower_components/three.js/build/three";
import {cmy_to_rgb} from "../color_conversion";


const CMY_CUBE_SHADER = require("../../shaders/cmy-fragment.glsl");

export class CMYCubeVisualization extends Visualization {
    constructor($container) {
        super($container);

        this.cmy_cube_mat = new ShaderMaterial({
            vertexShader: DEFAULT_VERTEX_SHADER(),
            fragmentShader: CMY_CUBE_SHADER()
        });
        this.cmy_cube = new DynamicAnnotatedCube(this.cmy_cube_mat, "C", "M", "Y", new Vector3(1, 1, 1));
        this.cmy_cube.current_color_sprite.sprite_material.color.setRGB(0, 0, 0);
        this.scene.add(this.cmy_cube);

        /* Rotate around center of the cube rather than the origin. */
        this.pivot.position.set(.5, .5, .5);

        /* Color system. */
        this.cyan_property = new ColorSystemProperty(1.0, 0.0, 1.0, "C", "c");
        this.magenta_property = new ColorSystemProperty(1.0, 0.0, 1.0, "M", "m");
        this.yellow_property = new ColorSystemProperty(1.0, 0.0, 1.0, "Y", "y");

        /* Initialize color system controls. */
        this.cyan_control = null;
        this.magenta_control = null;
        this.yellow_control = null;
        if (this.$figure != null) {
            this.init_controls();
            this.init_advanced_controls();
        }

        /* Attach event handlers. */
        let that = this;
        this.cyan_property.add_listener((event) => that.on_color_system_property_change.call(that, event));
        this.magenta_property.add_listener((event) => that.on_color_system_property_change.call(that, event));
        this.yellow_property.add_listener((event) => that.on_color_system_property_change.call(that, event));
    }

    init_controls() {
        super.init_controls();
        let $controls = this.$figure.find(".visualization-controls");
        if ($controls.length == 0) {
            return;
        }
        this.cyan_control = new VisualizationControlSlider(
            $controls,
            this.cyan_property,
            0.001
        );
        this.magenta_control = new VisualizationControlSlider(
            $controls,
            this.magenta_property,
            0.001
        );
        this.yellow_control = new VisualizationControlSlider(
            $controls,
            this.yellow_property,
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
        let selected_rgb = cmy_to_rgb(
            this.cyan_property.value, this.magenta_property.value, this.yellow_property.value);
        this.set_selected_color(selected_rgb.r, selected_rgb.g, selected_rgb.b);

        this.cmy_cube.value.set(
            this.cyan_property.value,
            this.magenta_property.value,
            this.yellow_property.value
        );
        this.cmy_cube.update_cube();

        this.cmy_cube.current_color_sprite.sprite_material.color.setRGB(
            selected_rgb.r, selected_rgb.g, selected_rgb.b);

        this.render();
    }
}

/**
 * Finds all RGB cube visualizations in the document and initializes them.
 * @returns {Array} An array containing all newly added visualizations.
 */
export function attach_cmy_cube_visualizations() {
    let visualizations = [];
    $(".visualization.cmy-cube").each(function() {
        let cmy_cube = new CMYCubeVisualization($(this));
        cmy_cube.render();
        visualizations.push(cmy_cube);
    });
    return visualizations;
}
