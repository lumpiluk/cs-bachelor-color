import {Visualization, DEFAULT_VERTEX_SHADER} from "./Visualization";
import {TextSprite} from "../objects/TextSprite";
import {CircleSprite} from "../objects/CircleSprite";
import {ColorSystemProperty} from "../color-systems/ColorSystemProperty";
import {hsv_to_rgb} from "../color-systems/color_conversion";
import {VisualizationControlSlider} from "../controls/VisualizationControlSlider";
import {DynamicCylinderBufferGeometry} from "../objects/DynamicCylinderBufferGeometry";
import {DynamicBoundingCylinder} from "../objects/DynamicBoundingCylinder";
import {CircularArrow} from "../objects/CircularArrow";
import {lerp} from "../util";

import {
    ShaderMaterial,
    Vector3,
    ArrowHelper,
    Mesh,
    Object3D
} from "../../../bower_components/three.js/build/three";
import {VisualizationControlSelect} from "../controls/VisualizationControlSelect";
import {DynamicAnnotatedCube} from "../objects/DynamicAnnotatedCube";


const HSV_CYLINDER_SHADER = require("../../shaders/hsv-cylinder-fragment.glsl");
const HSV_CUBE_SHADER = require("../../shaders/hsv-cube-fragment.glsl");

export class HSVVisualization extends Visualization {
    constructor($container) {
        super($container);

        this.radius = .5;
        this.circle_segments = 30;
        this.pivot_position_cylinder = new Vector3(0, .1, 0);
        this.pivot_position_cube = new Vector3(.5, .5, .5);

        /* Small pivot offset to keep value label in frame. */
        this.pivot.position.copy(this.pivot_position_cylinder);
        /* Adjust zoom. */
        this.update_scale(50);

        /* Color solid: Cone. */
        this.hsv_cone = new Object3D();
        this.hsv_cone_geom = new DynamicCylinderBufferGeometry(this.radius, 0, 1, 30, 2 * Math.PI);
        this.hsv_cone_mat = new ShaderMaterial({
            uniforms: {
                radiusBottom: {type: "f", value: 0.0},
                radiusTop: {type: "f", value: this.radius}
            },
            vertexShader: DEFAULT_VERTEX_SHADER(),
            fragmentShader: HSV_CYLINDER_SHADER()
        });
        this.hsv_cone_mesh = new Mesh(this.hsv_cone_geom, this.hsv_cone_mat);
        this.hsv_cone.add(this.hsv_cone_mesh);
        this.scene.add(this.hsv_cone);

        /* Cube (not visible by default). */
        this.hsv_cube_mat = new ShaderMaterial({
            vertexShader: DEFAULT_VERTEX_SHADER(),
            fragmentShader: HSV_CUBE_SHADER()
        });
        this.hsv_cube = new DynamicAnnotatedCube(this.hsv_cube_mat, "H", "S", "V", new Vector3(1, 1, 1));
        this.hsv_cube.visible = false;
        this.scene.add(this.hsv_cube);

        /* Coordinate system. */
        /* HSV cone bounding box. */
        this.bounding_cone = new DynamicBoundingCylinder(
            this.circle_segments,
            6, // num_vertical_lines
            0x000000,
            this.radius,
            0, // radius_bottom
            true, // include_top_circle
            true // include_bottom_circle
        );
        this.hsv_cone.add(this.bounding_cone);
        /* Arrows. */
        this.arrow_length_padding = .15;
        let arrow_color_hex = 0xffffff;
        this.arrow_head_length = .1;
        this.arrow_head_width = .05;
        this.arrow_value = new ArrowHelper(
            new Vector3(0, 1, 0), // direction
            new Vector3(0, -.5, 0), // origin
            1 + this.arrow_length_padding, // length
            arrow_color_hex,
            this.arrow_head_length,
            this.arrow_head_width
        );
        this.hsv_cone.add(this.arrow_value);
        this.arrow_saturation = new ArrowHelper(
            new Vector3(1, 0, 0), // direction
            new Vector3(this.radius, .5, 0), // origin
            this.arrow_length_padding, // length
            arrow_color_hex,
            this.arrow_head_length,
            this.arrow_head_width
        );
        this.hsv_cone.add(this.arrow_saturation);
        this.circ_arrow_hue = new CircularArrow(
            30, // segments
            this.radius + .05, // radius
            2 * Math.PI, // initial theta
            this.arrow_head_length,
            this.arrow_head_width,
            arrow_color_hex, // circle color
            arrow_color_hex
        );
        this.circ_arrow_hue.position.set(0, .5, 0);
        this.hsv_cone.add(this.circ_arrow_hue);
        /* Labels. */
        this.label_value = new TextSprite("V", .075);
        this.label_value.sprite.position.set(0, .6 + this.arrow_length_padding, 0);
        this.hsv_cone.add(this.label_value.sprite);
        this.label_saturation = new TextSprite("S", .075);
        this.label_saturation.sprite.position.set(this.radius + this.arrow_length_padding + .1, .5, 0);
        this.hsv_cone.add(this.label_saturation.sprite);
        this.label_hue = new TextSprite("H", .075);
        this.set_hue_label_position(2 * Math.PI);
        this.hsv_cone.add(this.label_hue.sprite);
        /* Current color indicator. */
        this.current_color_sprite = new CircleSprite(.05, 256, 10);
        this.current_color_sprite.sprite_material.color.setRGB(1, 1, 1);
        this.current_color_sprite.sprite.position.set(0, 0.5, 0);
        this.hsv_cone.add(this.current_color_sprite.sprite);

        /* Color system. */
        this.hue_property = new ColorSystemProperty(1.0, 0.0, 1.0, "H", "h");
        this.saturation_property = new ColorSystemProperty(0.0, 0.0, 1.0, "S", "s");
        this.value_property = new ColorSystemProperty(1.0, 0.0, 1.0, "V", "v");

        /* Initialize color system controls. */
        this.hue_control = null;
        this.saturation_control = null;
        this.value_control = null;
        this.representation_select_control = null;
        if (this.$figure != null) {
            this.init_controls();
            this.init_advanced_controls();
        }

        /* Attach event handlers. */
        let that = this;
        this.hue_property.add_listener((event) => that.on_color_system_property_change.call(that, event));
        this.saturation_property.add_listener((event) => that.on_color_system_property_change.call(that, event));
        this.value_property.add_listener((event) => that.on_color_system_property_change.call(that, event));
    }

    init_controls() {
        super.init_controls();
        let $controls = this.$figure.find(".visualization-controls");
        if ($controls.length == 0) {
            return;
        }
        this.hue_control = new VisualizationControlSlider(
            $controls,
            this.hue_property,
            0.001
        );
        this.saturation_control = new VisualizationControlSlider(
            $controls,
            this.saturation_property,
            0.001
        );
        this.value_control = new VisualizationControlSlider(
            $controls,
            this.value_property,
            0.001
        );
    }

    init_advanced_controls() {
        super.init_advanced_controls();
        let that = this;
        let $controls = this.$figure.find(".visualization-controls-advanced");
        if ($controls.length == 0) {
            return;
        }
        this.representation_select_control = new VisualizationControlSelect(
            $controls, ["Cone", "Cylinder", "Cube"], "Representation");
        this.representation_select_control.add_listener((event) =>
            that.on_representation_type_changed.call(that, event.option));
    }

    set_hue_label_position(angle) {
        let r = this.radius + .15;
        let angle_p = angle * 2 / 3;
        this.label_hue.sprite.position.set(
            Math.cos(angle_p) * r,
            .5,
            -Math.sin(angle_p) * r
        );
    }

    on_color_system_property_change(event) {
        let selected_rgb = hsv_to_rgb(
            this.hue_property.value, this.saturation_property.value, this.value_property.value);
        this.set_selected_color(selected_rgb.r, selected_rgb.g, selected_rgb.b);

        let r = lerp(this.bounding_cone.radius_bottom, this.radius, this.value_property.value);

        this.hsv_cone_geom.height = this.value_property.value;
        this.hsv_cone_geom.radius_top = r;
        this.hsv_cone_geom.theta_length = this.hue_property.value * 2 * Math.PI;
        this.hsv_cone_geom.update_cylinder();

        this.hsv_cone_mesh.position.set(0, this.value_property.value / 2 - .5, 0);

        /* Update current color indicator. */
        this.current_color_sprite.sprite.position.set(
            Math.cos(this.hsv_cone_geom.theta_length) * r * this.saturation_property.value,
            this.value_property.value - .5,
            -Math.sin(this.hsv_cone_geom.theta_length) * r * this.saturation_property.value
        );
        this.current_color_sprite.sprite_material.color.setRGB(selected_rgb.r, selected_rgb.g, selected_rgb.b);

        /* Update length of value arrow. */
        this.arrow_value.position.set(0, this.value_property.value - .5, 0);
        this.arrow_value.setLength(
            1 + this.arrow_length_padding - this.value_property.value,
            this.arrow_head_length,
            this.arrow_head_width
        );
        /* Update saturation arrow and label. */
        this.arrow_saturation.position.set(
            Math.cos(this.hsv_cone_geom.theta_length) * r,
            this.value_property.value - .5,
            -Math.sin(this.hsv_cone_geom.theta_length) * r
        );
        this.arrow_saturation.setDirection(new Vector3(
            Math.cos(this.hsv_cone_geom.theta_length),
            0,
            -Math.sin(this.hsv_cone_geom.theta_length)
        ));
        r += this.arrow_length_padding + .1;
        this.label_saturation.sprite.position.set(
            Math.cos(this.hsv_cone_geom.theta_length) * r,
            this.value_property.value - .5,
            -Math.sin(this.hsv_cone_geom.theta_length) * r
        );
        /* Update hue arrow and label. */
        this.circ_arrow_hue.theta = this.hue_property.value * 2 * Math.PI;
        this.circ_arrow_hue.update_circle();
        this.set_hue_label_position(this.hue_property.value * 2 * Math.PI);

        /* Update HSV cube (which is not visible by default). */
        this.hsv_cube.value.set(
            this.hue_property.value,
            this.saturation_property.value,
            this.value_property.value
        );
        this.hsv_cube.update_cube();
        this.hsv_cube.current_color_sprite.sprite_material.color.setRGB(
            selected_rgb.r, selected_rgb.g, selected_rgb.b);

        this.render();
    }

    on_representation_type_changed(type) {
        if (type == "Cone" || type == "Cylinder") {
            let r = type == "Cone" ? 0 : this.radius;
            this.hsv_cone.visible = true;
            this.hsv_cube.visible = false;
            this.hsv_cone_mesh.visible = true;
            this.hsv_cone_geom.radius_bottom = r;
            this.hsv_cone_geom.update_cylinder();
            this.bounding_cone.radius_bottom = r;
            this.bounding_cone.update_cylinder();
            this.hsv_cone_mat.uniforms.radiusBottom.value = r;
            this.pivot.position.copy(this.pivot_position_cylinder);
        } else if (type == "Cube") {
            this.hsv_cone.visible = false;
            this.hsv_cube.visible = true;
            this.pivot.position.copy(this.pivot_position_cube);
        }
        this.on_color_system_property_change(null);
    }
}

/**
 * Finds all HSV visualizations in the document and initializes them.
 * @returns {Array} An array containing all newly added visualizations.
 */
export function attach_hsv_visualizations() {
    let visualizations = [];
    $(".visualization.hsv").each(function() {
        let visualization = new HSVVisualization($(this));
        visualization.render();
        visualizations.push(visualization);
    });
    return visualizations;
}
