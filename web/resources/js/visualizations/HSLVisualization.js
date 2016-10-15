import {Visualization, DEFAULT_VERTEX_SHADER} from "./Visualization";
import {TextSprite} from "../objects/TextSprite";
import {CircleSprite} from "../objects/CircleSprite";
import {ColorSystemProperty} from "../color-systems/ColorSystemProperty";
import {hsl_to_rgb} from "../color-systems/color_conversion";
import {VisualizationControlSlider} from "../controls/VisualizationControlSlider";
import {DynamicCylinderBufferGeometry} from "../objects/DynamicCylinderBufferGeometry";
import {CircularArrow} from "../objects/CircularArrow";
import {DynamicBoundingCylinder} from "../objects/DynamicBoundingCylinder";
import {VisualizationControlSelect} from "../controls/VisualizationControlSelect";
import {lerp} from "../util";
import {DynamicAnnotatedCube} from "../objects/DynamicAnnotatedCube";

import {
    ShaderMaterial,
    Vector3,
    ArrowHelper,
    Mesh,
    Object3D
} from "../../../bower_components/three.js/build/three";
import {HSLColorSystem} from "../color-systems/HSLColorSystem";


const HSL_CYLINDER_SHADER = require("../../shaders/hsl-cylinders-fragment.glsl");
const HSL_CUBE_SHADER = require("../../shaders/hsl-cube-fragment.glsl");


export class HSLVisualization extends Visualization {
    constructor($container) {
        super($container);

        this.radius = .5;
        this.height = 1;
        this.circle_segments = 30;
        this.pivot_position_cylinders = new Vector3(0, .1, 0);
        this.pivot_position_cube = new Vector3(.5, .5, .5);

        /* Small pivot offset to keep lightness label in frame. */
        this.pivot.position.copy(this.pivot_position_cylinders);
        /* Adjust zoom. */
        this.update_scale(50);

        /* Color solid: Cones. */
        this.hsl_cones = new Object3D();
        this.hsl_cylinder_top_geom = new DynamicCylinderBufferGeometry(
            0, this.radius, this.height / 2, this.circle_segments, 2 * Math.PI);
        this.hsl_cylinder_bottom_geom = new DynamicCylinderBufferGeometry(
            this.radius, 0, this.height / 2, this.circle_segments, 2 * Math.PI);
        this.hsl_cylinder_mat = new ShaderMaterial({
            uniforms: {
                radiusBottom: {type: "f", value: 0.0},
                radiusTop: {type: "f", value: 0.0},
                radius: {type: "f", value: this.radius},
                height: {type: "f", value: this.height}
            },
            vertexShader: DEFAULT_VERTEX_SHADER(),
            fragmentShader: HSL_CYLINDER_SHADER()
        });
        this.hsl_cylinder_top = new Mesh(this.hsl_cylinder_top_geom, this.hsl_cylinder_mat);
        this.hsl_cylinder_bottom = new Mesh(this.hsl_cylinder_bottom_geom, this.hsl_cylinder_mat);
        this.hsl_cylinder_top.position.set(0, this.height / 4, 0);
        this.hsl_cylinder_bottom.position.set(0, -this.height / 4, 0);
        this.hsl_cones.add(this.hsl_cylinder_top);
        this.hsl_cones.add(this.hsl_cylinder_bottom);
        this.scene.add(this.hsl_cones);

        /* Cube (not visible by default). */
        this.hsl_cube_mat = new ShaderMaterial({
            vertexShader: DEFAULT_VERTEX_SHADER(),
            fragmentShader: HSL_CUBE_SHADER()
        });
        this.hsl_cube = new DynamicAnnotatedCube(this.hsl_cube_mat, "H", "S", "L", new Vector3(1, 1, 1));
        this.hsl_cube.visible = false;
        this.scene.add(this.hsl_cube);

        /* Coordinate system. */
        /* HSL bounding wireframe. */
        this.bounding_cylinder_top = new DynamicBoundingCylinder(
            this.circle_segments,
            6, // num_vertical_lines
            0x000000,
            0, // radius_top
            this.radius, // radius_bottom
            true, // include_top_circle
            true // include_bottom_circle
        );
        this.bounding_cylinder_top.scale.set(1, this.height / 2, 1);
        this.bounding_cylinder_top.position.set(0, this.height / 4, 0);
        this.hsl_cones.add(this.bounding_cylinder_top);
        this.bounding_cylinder_bottom = new DynamicBoundingCylinder(
            this.circle_segments,
            6, // num_vertical_lines
            0x000000,
            this.radius, // radius_top
            0, // radius_bottom
            false, // include_top_circle // TODO: fix error when this is set to false
            true // include_bottom_circle
        );
        this.bounding_cylinder_bottom.scale.set(1, this.height / 2, 1);
        this.bounding_cylinder_bottom.position.set(0, -this.height / 4, 0);
        this.hsl_cones.add(this.bounding_cylinder_bottom);
        /* Arrows. */
        this.arrow_length_padding = .15;
        let arrow_color_hex = 0xffffff;
        this.arrow_head_length = .1;
        this.arrow_head_width = .05;
        this.arrow_lightness = new ArrowHelper(
            new Vector3(0, 1, 0), // direction
            new Vector3(0, -this.height / 2, 0), // origin
            this.height + this.arrow_length_padding, // length
            arrow_color_hex,
            this.arrow_head_length,
            this.arrow_head_width
        );
        this.hsl_cones.add(this.arrow_lightness);
        this.arrow_saturation = new ArrowHelper(
            new Vector3(1, 0, 0), // direction
            new Vector3(0, this.height / 2, 0), // origin
            this.arrow_length_padding, // length
            arrow_color_hex,
            this.arrow_head_length,
            this.arrow_head_width
        );
        this.hsl_cones.add(this.arrow_saturation);
        this.circ_arrow_hue = new CircularArrow(
            this.circle_segments, // segments
            this.radius + .05, // radius
            2 * Math.PI, // initial theta
            this.arrow_head_length,
            this.arrow_head_width,
            arrow_color_hex, // circle color
            arrow_color_hex
        );
        this.circ_arrow_hue.position.set(0, 0, 0);
        this.hsl_cones.add(this.circ_arrow_hue);
        /* Labels. */
        this.label_lightness = new TextSprite("L", .15);
        this.label_lightness.sprite.position.set(0, this.height / 2 + .1 + this.arrow_length_padding, 0);
        this.hsl_cones.add(this.label_lightness.sprite);
        this.label_saturation = new TextSprite("S", .15);
        this.label_saturation.sprite.position.set(this.arrow_length_padding + .1, this.height / 2, 0);
        this.hsl_cones.add(this.label_saturation.sprite);
        this.label_hue = new TextSprite("H", .15);
        this.set_hue_label_position(2 * Math.PI);
        this.hsl_cones.add(this.label_hue.sprite);
        /* Current color indicator. */
        this.current_color_sprite = new CircleSprite(.05, 256, 10);
        this.current_color_sprite.sprite_material.color.setRGB(1, 1, 1);
        this.current_color_sprite.sprite.position.set(0, this.height / 2, 0);
        this.hsl_cones.add(this.current_color_sprite.sprite);

        /* Color system. */
        this.color_system = new HSLColorSystem();
        this.color_system.properties[0].set_value(1);
        this.color_system.properties[1].set_value(0);
        this.color_system.properties[2].set_value(1);

        /* Initialize color system controls. */
        this.hue_control = null;
        this.saturation_control = null;
        this.lightness_control = null;
        this.representation_select_control = null;
        if (this.$figure != null) {
            this.init_controls();
            this.init_advanced_controls();
        }

        /* Attach event handlers. */
        this.color_system.add_listener((event) => this.on_color_system_property_change(event));
    }

    init_controls() {
        super.init_controls();
        let $controls = this.$controls;
        if ($controls.length == 0) {
            return;
        }
        this.hue_control = new VisualizationControlSlider(
            $controls,
            this.color_system.properties[0],
            0.001
        );
        this.saturation_control = new VisualizationControlSlider(
            $controls,
            this.color_system.properties[1],
            0.001
        );
        this.lightness_control = new VisualizationControlSlider(
            $controls,
            this.color_system.properties[2],
            0.001
        );
    }

    init_advanced_controls() {
        super.init_advanced_controls(this.color_system.get_name());
        let that = this;
        let $controls = this.$controls_advanced;
        if ($controls.length == 0) {
            return;
        }
        this.representation_select_control = new VisualizationControlSelect(
            $controls, ["Cones", "Cylinder", "Cube"], "Representation");
        this.representation_select_control.add_listener((event) =>
            that.on_representation_type_changed.call(that, event.option));
    }

    set_hue_label_position(angle) {
        let r = this.radius + .15;
        let angle_p = angle * 2 / 3;
        this.label_hue.sprite.position.set(
            Math.cos(angle_p) * r,
            0,
            -Math.sin(angle_p) * r
        );
    }

    on_color_system_property_change(event) {
        let selected_rgb = this.color_system.get_rgb();
        let h = this.color_system.properties[0].value;
        let s = this.color_system.properties[1].value;
        let l = this.color_system.properties[2].value;

        this.set_selected_color(selected_rgb.r, selected_rgb.g, selected_rgb.b);

        let lightness_top = Math.max(0, (l - .5) * 2);
        let lightness_bottom = Math.min(1, l * 2);
        let theta = h * 2 * Math.PI;
        let current_y = l * this.height - this.height / 2;

        this.hsl_cylinder_top_geom.height = lightness_top * this.height / 2;
        this.hsl_cylinder_bottom_geom.height = lightness_bottom * this.height / 2;
        this.hsl_cylinder_top_geom.radius_top = lerp(this.radius, this.bounding_cylinder_top.radius_top, lightness_top);
        this.hsl_cylinder_bottom_geom.radius_top =
            lerp(this.bounding_cylinder_bottom.radius_bottom, this.radius, lightness_bottom);
        this.hsl_cylinder_top_geom.theta_length = h * 2 * Math.PI;
        this.hsl_cylinder_bottom_geom.theta_length = h * 2 * Math.PI;
        this.hsl_cylinder_top_geom.update_cylinder();
        this.hsl_cylinder_bottom_geom.update_cylinder();

        this.hsl_cylinder_top.position.set(0, this.hsl_cylinder_top_geom.height / 2, 0);
        this.hsl_cylinder_bottom.position.set(
            0,
            (l <= .5 ? current_y : 0) - this.hsl_cylinder_bottom_geom.height / 2,
            0
        );
        this.hsl_cylinder_top.visible = l >= .5;

        /* Update current color indicator. */
        let radius = l <= .5 ?
            lerp(this.bounding_cylinder_bottom.radius_bottom, this.radius, lightness_bottom) :
            lerp(this.radius, this.bounding_cylinder_top.radius_top, lightness_top);
        this.current_color_sprite.sprite.position.set(
            Math.cos(theta) * radius * s,
            current_y,
            -Math.sin(theta) * radius * s
        );
        this.current_color_sprite.sprite_material.color.setRGB(selected_rgb.r, selected_rgb.g, selected_rgb.b);

        /* Update length of lightness arrow. */
        this.arrow_lightness.position.set(0, current_y, 0);
        this.arrow_lightness.setLength(
            this.height / 2 - current_y + this.arrow_length_padding,
            this.arrow_head_length,
            this.arrow_head_width
        );
        /* Update saturation arrow and label. */
        this.arrow_saturation.position.set(
            Math.cos(theta) * radius,
            current_y,
            -Math.sin(theta) * radius
        );
        this.arrow_saturation.setDirection(new Vector3(
            Math.cos(theta),
            0,
            -Math.sin(theta)
        ));
        radius += this.arrow_length_padding + .1;
        this.label_saturation.sprite.position.set(
            Math.cos(theta) * radius,
            current_y,
            -Math.sin(theta) * radius
        );
        /* Update hue arrow and label. */
        this.circ_arrow_hue.theta = theta;
        this.circ_arrow_hue.update_circle();
        this.set_hue_label_position(theta);

        /* Update HSL cube (which is not visible by default). */
        this.hsl_cube.value.set(h, s, l);
        this.hsl_cube.update_cube();
        this.hsl_cube.current_color_sprite.sprite_material.color.setRGB(
            selected_rgb.r, selected_rgb.g, selected_rgb.b);

        this.render();
    }

    on_representation_type_changed(type) {
        if (type == "Cones" || type == "Cylinder") {
            let r = type == "Cones" ? 0 : this.radius;
            this.hsl_cones.visible = true;
            this.hsl_cube.visible = false;
            this.hsl_cylinder_top_geom.radius_top = r;
            this.hsl_cylinder_bottom_geom.radius_bottom = r;
            this.hsl_cylinder_top_geom.update_cylinder();
            this.hsl_cylinder_bottom_geom.update_cylinder();
            this.bounding_cylinder_top.radius_top = r;
            this.bounding_cylinder_bottom.radius_bottom = r;
            this.bounding_cylinder_top.update_cylinder();
            this.bounding_cylinder_bottom.update_cylinder();
            this.hsl_cylinder_mat.uniforms.radiusTop.value = r;
            this.hsl_cylinder_mat.uniforms.radiusBottom.value = r;
            this.pivot.position.copy(this.pivot_position_cylinders);
        } else if (type == "Cube") {
            this.hsl_cones.visible = false;
            this.hsl_cube.visible = true;
            this.pivot.position.copy(this.pivot_position_cube);
        }
        this.on_color_system_property_change(null);
    }
}

/**
 * Finds all HSL visualizations in the document and initializes them.
 * @returns {Array} An array containing all newly added visualizations.
 */
export function attach_hsl_visualizations() {
    let visualizations = [];
    $(".figure > .visualization.hsl").each(function() {
        let visualization = new HSLVisualization($(this));
        visualization.render();
        visualizations.push(visualization);
    });
    return visualizations;
}
