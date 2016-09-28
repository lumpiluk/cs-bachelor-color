/**
 * Created by lumpiluk on 9/28/16.
 */

import {Visualization, DEFAULT_VERTEX_SHADER} from "./Visualization";
import {TextSprite} from "./TextSprite";
import {CircleSprite} from "./CircleSprite";
import {ColorSystemProperty} from "./ColorSystemProperty";
import {VisualizationControlSlider} from "./VisualizationControlSlider";
import {DynamicCylinderBufferGeometry} from "./DynamicCylinderBufferGeometry";

import {
    MeshBasicMaterial,
    LineBasicMaterial,
    Vector3,
    ArrowHelper,
    BufferGeometry,
    BufferAttribute,
    LineSegments,
    Mesh
} from "../../bower_components/three.js/build/three";
import {DoubleSide} from "../../bower_components/three.js/build/three";

export class HSVVisualization extends Visualization {
    constructor($container) {
        super($container);

        this.radius = .5;

        /* Small pivot offset to keep hue label in frame. */
        this.pivot.position.set(0, .15, 0);

        /* Color solid. */
        this.hsv_cone_geom = new DynamicCylinderBufferGeometry(0.5, 0, 1, 30, 2 * Math.PI);
        this.hsv_cone_mat = new MeshBasicMaterial({color: 0xff00ff, wireframe: false});
        //this.hsv_cone_mat.side = DoubleSide;
        this.hsv_cone_mesh = new Mesh(this.hsv_cone_geom, this.hsv_cone_mat);
        this.scene.add(this.hsv_cone_mesh);

        /* Coordinate system. */
        /* HSV cone bounding box. */
        this.bounding_cone = this.make_bounding_cone(30, new LineBasicMaterial({color: 0x000000}));
        this.bounding_cone.matrixAutoUpdate = false;
        this.scene.add(this.bounding_cone);

        /* Arrows. */
        let arrow_origin = new Vector3(0, -.5, 0);
        let arrow_length = 1.15;
        let arrow_color_hex = 0xffffff;
        let arrow_head_length = 0.1;
        let arrow_head_width = 0.05;
        this.arrow_value = new ArrowHelper(
            new Vector3(0, 1, 0),
            arrow_origin, arrow_length, arrow_color_hex, arrow_head_length, arrow_head_width
        );
        this.scene.add(this.arrow_value);
        /* Labels. */
        this.label_value = new TextSprite("H", 0.15);
        this.label_value.sprite.position.set(0, 0.75, 0);
        this.scene.add(this.label_value.sprite);

        /* Color system. */
        this.hue_property = new ColorSystemProperty(1.0, 0.0, 1.0, "H", "h");
        this.saturation_property = new ColorSystemProperty(1.0, 0.0, 1.0, "S", "s");
        this.value_property = new ColorSystemProperty(1.0, 0.0, 1.0, "V", "v");

        /* Initialize color system controls. */
        // TODO

        /* Attach event handlers. */
        // TODO
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
