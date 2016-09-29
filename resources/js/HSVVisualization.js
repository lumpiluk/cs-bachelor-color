/**
 * Created by lumpiluk on 9/28/16.
 */

import {Visualization, DEFAULT_VERTEX_SHADER} from "./Visualization";
import {TextSprite} from "./TextSprite";
import {CircleSprite} from "./CircleSprite";
import {ColorSystemProperty} from "./ColorSystemProperty";
import {hsv_to_rgb} from "./color_conversion";
import {VisualizationControlSlider} from "./VisualizationControlSlider";
import {DynamicCylinderBufferGeometry} from "./DynamicCylinderBufferGeometry";

import {
    ShaderMaterial,
    LineBasicMaterial,
    Vector3,
    ArrowHelper,
    BufferGeometry,
    BufferAttribute,
    LineSegments,
    Mesh
} from "../../bower_components/three.js/build/three";


const HSV_CYLINDER_SHADER = require("../shaders/hsv-cylinder-fragment.glsl");

export class HSVVisualization extends Visualization {
    constructor($container) {
        super($container);

        this.radius = .5;

        /* Small pivot offset to keep hue label in frame. */
        this.pivot.position.set(0, .15, 0);
        /* Adjust zoom. */
        this.update_scale(50);

        /* Color solid. */
        this.hsv_cone_geom = new DynamicCylinderBufferGeometry(0.5, 0, 1, 30, 2 * Math.PI);
        this.hsv_cone_mat = this.rgb_cube_mat = new ShaderMaterial({
            uniforms: {
                radiusBottom: {type: "f", value: 0.0},
                radiusTop: {type: "f", value: .5}
            },
            vertexShader: DEFAULT_VERTEX_SHADER(),
            fragmentShader: HSV_CYLINDER_SHADER()
        });
        this.hsv_cone_mesh = new Mesh(this.hsv_cone_geom, this.hsv_cone_mat);
        this.scene.add(this.hsv_cone_mesh);

        /* Coordinate system. */
        /* HSV cone bounding box. */
        this.bounding_cone = this.make_bounding_cone(30, new LineBasicMaterial({color: 0x000000}));
        this.bounding_cone.matrixAutoUpdate = false;
        this.scene.add(this.bounding_cone);

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
        this.scene.add(this.arrow_value);
        this.arrow_saturation = new ArrowHelper(
            new Vector3(1, 0, 0), // direction
            new Vector3(this.radius, .5, 0), // origin
            this.arrow_length_padding, // length
            arrow_color_hex,
            this.arrow_head_length,
            this.arrow_head_width
        );
        this.scene.add(this.arrow_saturation);
        /* Labels. */
        this.label_value = new TextSprite("V", .15);
        this.label_value.sprite.position.set(0, .6 + this.arrow_length_padding, 0);
        this.scene.add(this.label_value.sprite);
        this.label_saturation = new TextSprite("S", .15);
        this.label_saturation.sprite.position.set(this.radius + this.arrow_length_padding + .1, .5, 0);
        this.scene.add(this.label_saturation.sprite);
        /* Current color indicator. */
        this.current_color_sprite = new CircleSprite(.05, 256, 10);
        this.current_color_sprite.sprite_material.color.setRGB(1, 1, 1);
        this.current_color_sprite.sprite.position.set(0, 0.5, 0);
        this.scene.add(this.current_color_sprite.sprite);

        /* Color system. */
        this.hue_property = new ColorSystemProperty(1.0, 0.0, 1.0, "H", "h");
        this.saturation_property = new ColorSystemProperty(0.0, 0.0, 1.0, "S", "s");
        this.value_property = new ColorSystemProperty(1.0, 0.0, 1.0, "V", "v");

        /* Initialize color system controls. */
        this.hue_control = null;
        this.saturation_control = null;
        this.value_control = null;
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

    make_bounding_cone(num_circle_segments, material) {
        let geometry = new BufferGeometry();
        let vertices = [
            new Vector3(0, -.5, 0)
        ];
        let indices = []; // Which vertex is connected to which.

        /* Init circle vertices. */
        for (let i = 0; i < num_circle_segments; i++) {
            vertices.push(new Vector3(
                Math.cos(i * 2 * Math.PI / num_circle_segments) * this.radius,
                0.5,
                Math.sin(i * 2 * Math.PI / num_circle_segments) * this.radius
            ));
            indices.push(i + 1); // Offset of 1 to account for first vertex at cone tip.
            indices.push(i + 2);
        }
        /* Init the six vertices for attaching the diagonal lines. */
        for (let i = 0; i < 6; i++) {
            vertices.push(new Vector3(
                Math.cos(i * 2 * Math.PI / 6) * this.radius,
                0.5,
                Math.sin(i * 2 * Math.PI / 6) * this.radius
            ));
            indices.push(i + 1 + num_circle_segments);
            indices.push(0); // Connect to cone tip.
        }

        /* Turn array of vertices into array of floats required for BufferGeometry. */
        let positions = new Float32Array(vertices.length * 3);
        for (var i = 0; i < vertices.length; i++) {
            positions[i * 3] = vertices[i].x;
            positions[i * 3 + 1] = vertices[i].y;
            positions[i * 3 + 2] = vertices[i].z;
        }

        geometry.addAttribute('position', new BufferAttribute(positions, 3));
        geometry.setIndex(new BufferAttribute(new Uint16Array(indices), 1));

        return new LineSegments(geometry, material);
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
        let $controls = this.$figure.find(".visualization-controls-advanced");
        if ($controls.length == 0) {
            return;
        }
        // TODO: switch between cylinder, cone, and cube
    }

    on_color_system_property_change(event) {
        let selected_rgb = hsv_to_rgb(
            this.hue_property.value, this.saturation_property.value, this.value_property.value);
        this.set_selected_color(selected_rgb.r, selected_rgb.g, selected_rgb.b);

        this.hsv_cone_geom.height = this.value_property.value;
        this.hsv_cone_geom.radius_top = .5 * this.value_property.value;
        this.hsv_cone_geom.theta_length = this.hue_property.value * 2 * Math.PI;
        this.hsv_cone_geom.update_cylinder();

        this.hsv_cone_mesh.position.set(0, this.value_property.value / 2 - .5, 0);

        /* Update current color indicator. */
        let r = .5 * this.value_property.value * this.saturation_property.value;
        this.current_color_sprite.sprite.position.set(
            Math.cos(this.hsv_cone_geom.theta_length) * r,
            this.value_property.value - .5,
            -Math.sin(this.hsv_cone_geom.theta_length) * r
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
        r = .5 * this.value_property.value;
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

        this.render();
    }
}

/**
 * Finds all HSV visualizations in the document and initializes them.
 * @returns {Array} An array containing all newly added visualizations.
 */
export function attach_hsv_visualizations() {
    let visualizations = [];
    $(".visualization.hsv").each(function() {
        let rgb_cube = new HSVVisualization($(this));
        rgb_cube.render();
        visualizations.push(rgb_cube);
    });
    return visualizations;
}
