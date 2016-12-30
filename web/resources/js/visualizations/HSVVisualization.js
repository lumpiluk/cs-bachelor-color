import {Visualization, DEFAULT_VERTEX_SHADER} from "./Visualization";
import {TextSprite} from "../objects/TextSprite";
import {CircleSprite} from "../objects/CircleSprite";
import {DynamicCylinderBufferGeometry} from "../objects/DynamicCylinderBufferGeometry";
import {DynamicBoundingCylinder} from "../objects/DynamicBoundingCylinder";
import {CircularArrow} from "../objects/CircularArrow";
import {lerp} from "../util";
import {VisualizationControlSelect} from "../controls/VisualizationControlSelect";
import {DynamicAnnotatedCube} from "../objects/DynamicAnnotatedCube";
import {HSVColorSystem} from "../color-systems/HSVColorSystem";
import {UNITS_DEG_UNIT_UNIT, UNITS_OPTIONS_HSL_HSV} from "../color-systems/ColorSystemUnits";

import {
    ShaderMaterial,
    Vector3,
    ArrowHelper,
    Mesh,
    Object3D
} from "../../../bower_components/three.js/build/three";
import {DynamicBoundingCylinderSliced} from "../objects/DynamicBoundingCylinderSliced";


const HSV_CYLINDER_SHADER = require("../../shaders/hsv-cylinder-fragment.glsl");
const HSV_CUBE_SHADER = require("../../shaders/hsv-cube-fragment.glsl");

export class HSVVisualization extends Visualization {
    constructor($container) {
        super($container, new HSVColorSystem(UNITS_DEG_UNIT_UNIT));

        /* Color system. */
        this.color_system.properties[0].set_value(1);
        this.color_system.properties[1].set_value(0);
        this.color_system.properties[2].set_value(1);

        /* Initialize color system controls. */
        this.representation_select_control = null;
        this.units_select_control = null;

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
        /* HSV bounding wireframe for current color indication. */
        this.bounding_slice = new DynamicBoundingCylinderSliced(
            this.circle_segments,
            0x000000,
            this.radius, // radius_top
            0, // radius_bottom
            true, // include_top_circle
            false, // include_bottom_circle
            2 * Math.PI // theta
        );
        this.hsv_cone.add(this.bounding_slice);
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
        this.label_value = new TextSprite("V", .15);
        this.label_value.sprite.position.set(0, .6 + this.arrow_length_padding, 0);
        this.hsv_cone.add(this.label_value.sprite);
        this.label_saturation = new TextSprite("S", .15);
        this.label_saturation.sprite.position.set(this.radius + this.arrow_length_padding + .1, .5, 0);
        this.hsv_cone.add(this.label_saturation.sprite);
        this.label_hue = new TextSprite("H", .15);
        this.set_hue_label_position(2 * Math.PI);
        this.hsv_cone.add(this.label_hue.sprite);
        /* Current color indicator. */
        this.current_color_sprite = new CircleSprite(.05, 256, 10);
        this.current_color_sprite.sprite_material.color.setRGB(1, 1, 1);
        this.current_color_sprite.sprite.position.set(0, 0.5, 0);
        this.hsv_cone.add(this.current_color_sprite.sprite);

        /* Attach event handlers. */
        this.color_system.add_listener((event) => this.on_color_system_property_change(event));
    }

    init_advanced_controls() {
        super.init_advanced_controls(this.color_system.get_name());
        let that = this;
        let $controls = this.$figure.find(".visualization-controls-advanced");
        if ($controls.length == 0) {
            return;
        }
        this.representation_select_control = new VisualizationControlSelect(
            $controls, ["Cone", "Cylinder", "Cube"], "Representation");
        this.representation_select_control.add_listener((event) =>
            that.on_representation_type_changed.call(that, event.option));

        this.units_select_control = new VisualizationControlSelect(
            $controls, UNITS_OPTIONS_HSL_HSV, "Units"
        );
        this.units_select_control.add_listener((event) =>
            this.color_system.change_units_to(event.option));
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
        let selected_rgb = this.color_system.get_rgb();
        let h = this.color_system.properties[0].value;
        let s = this.color_system.properties[1].value;
        let v = this.color_system.properties[2].value;

        this.set_selected_color(selected_rgb.r, selected_rgb.g, selected_rgb.b);

        let radius = lerp(this.bounding_cone.radius_bottom, this.radius, v);

        this.hsv_cone_geom.height = v;
        this.hsv_cone_geom.radius_top = radius;
        this.hsv_cone_geom.theta_length = h * 2 * Math.PI;
        this.hsv_cone_geom.update_cylinder();

        this.hsv_cone_mesh.position.set(0, v / 2 - .5, 0);

        /* Updated sliced bounding cylinder. */
        this.bounding_slice.scale.set(1, v, 1);
        this.bounding_slice.radius_top = radius;
        this.bounding_slice.theta_length = h * 2 * Math.PI;
        this.bounding_slice.update_cylinder();
        this.bounding_slice.position.set(0, v / 2 - .5, 0);

        /* Update current color indicator. */
        this.current_color_sprite.sprite.position.set(
            Math.cos(this.hsv_cone_geom.theta_length) * radius * s,
            v - .5,
            -Math.sin(this.hsv_cone_geom.theta_length) * radius * s
        );
        this.current_color_sprite.sprite_material.color.setRGB(selected_rgb.r, selected_rgb.g, selected_rgb.b);

        /* Update length of value arrow. */
        this.arrow_value.position.set(0, v - .5, 0);
        this.arrow_value.setLength(
            1 + this.arrow_length_padding - v,
            this.arrow_head_length,
            this.arrow_head_width
        );
        /* Update saturation arrow and label. */
        this.arrow_saturation.position.set(
            Math.cos(this.hsv_cone_geom.theta_length) * radius,
            v - .5,
            -Math.sin(this.hsv_cone_geom.theta_length) * radius
        );
        this.arrow_saturation.setDirection(new Vector3(
            Math.cos(this.hsv_cone_geom.theta_length),
            0,
            -Math.sin(this.hsv_cone_geom.theta_length)
        ));
        radius += this.arrow_length_padding + .1;
        this.label_saturation.sprite.position.set(
            Math.cos(this.hsv_cone_geom.theta_length) * radius,
            v - .5,
            -Math.sin(this.hsv_cone_geom.theta_length) * radius
        );
        /* Update hue arrow and label. */
        this.circ_arrow_hue.theta = h * 2 * Math.PI;
        this.circ_arrow_hue.update_circle();
        this.set_hue_label_position(h * 2 * Math.PI);

        /* Update HSV cube (which is not visible by default). */
        this.hsv_cube.value.set(h, s, v);
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
            this.bounding_slice.radius_bottom = r;
            this.bounding_slice.update_cylinder();
            this.hsv_cone_mat.uniforms.radiusBottom.value = r;
            this.pivot.position.copy(this.pivot_position_cylinder);
        } else if (type == "Cube") {
            this.hsv_cone.visible = false;
            this.hsv_cube.visible = true;
            this.pivot.position.copy(this.pivot_position_cube);
        }
        this.on_color_system_property_change(null);
    }

    show_only_color_solid_changed(event) {
        super.show_only_color_solid_changed(event);
        let visible = !event.checked;
        this.bounding_cone.visible = visible;
        this.bounding_slice.visible = visible;
        this.circ_arrow_hue.visible = visible;
        this.arrow_saturation.visible = visible;
        this.arrow_value.visible = visible;
        this.label_hue.sprite.visible = visible;
        this.label_saturation.sprite.visible = visible;
        this.label_value.sprite.visible = visible;
        this.current_color_sprite.sprite.visible = visible;

        this.hsv_cube.show_only_color_solid(event.checked);

        this.render();
    }
}

/**
 * Finds all HSV visualizations in the document and initializes them.
 * @returns {Array} An array containing all newly added visualizations.
 */
export function attach_hsv_visualizations() {
    let visualizations = [];
    $(".figure > .visualization.hsv").each(function() {
        let visualization = new HSVVisualization($(this));
        visualization.render();
        visualizations.push(visualization);
    });
    return visualizations;
}
