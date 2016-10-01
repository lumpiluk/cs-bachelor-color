import {
    Object3D,
    Vector3,
    BufferGeometry,
    BufferAttribute,
    LineBasicMaterial,
    LineSegments
} from "../../../bower_components/three.js/build/three";


export class DynamicBoundingCylinder extends Object3D {
    /**
     * Creates a cylinder of height one centered around the origin.
     * @param num_circle_segments
     * @param num_vertical_lines
     * @param color
     * @param radius_top
     * @param radius_bottom
     * @param include_top_circle If true, draws a circle at the top. Set to false if another bounding cylinder is to be
     * attached.
     * @param include_bottom_circle If true, draws a circle at the bottom.
     */
    constructor(num_circle_segments, num_vertical_lines, color, radius_top, radius_bottom,
                include_top_circle, include_bottom_circle) {
        super();

        this.num_circle_segments = num_circle_segments;
        this.num_vertical_lines = num_vertical_lines;
        this.radius_top = radius_top;
        this.radius_bottom = radius_bottom;
        this.include_top_circle = include_top_circle;
        this.include_bottom_circle = include_bottom_circle;
        this.geometry = new BufferGeometry();
        this.material = new LineBasicMaterial({color: color});
        this.vertices = [
            new Vector3(0, .5, 0),
            new Vector3(0, -.5, 0)
        ];
        this.indices = []; // Which vertex is connected to which.

        /* Init circle indices, fill vertices array. */
        if (this.include_top_circle) {
            for (let i = 0; i < num_circle_segments; i++) {
                this.vertices.push(new Vector3(0, 0, 0));
                // Offset of two for top and bottom center vectors.
                this.indices.push(
                    i + 2,
                    (i + 1) % num_circle_segments + 2
                );
            }
        }
        if (this.include_bottom_circle) {
            for (let i = 0; i < num_circle_segments; i++) {
                this.vertices.push(new Vector3(0, 0, 0));
                let offset = this.include_top_circle ? num_circle_segments + 2: 2;
                this.indices.push(
                    i + offset,
                    (i + 1) % num_circle_segments + offset
                );
            }
        }

        /* Init lines connecting the two (potential) circles. */
        let index_offset = 2;
        index_offset += this.include_top_circle ? this.num_circle_segments : 0;
        index_offset += this.include_bottom_circle ? this.num_circle_segments : 0;
        for (let i = 0; i < this.num_vertical_lines; i++) {
            this.vertices.push(new Vector3(0, 0, 0));
            this.vertices.push(new Vector3(0, 0, 0));
            this.indices.push(
                2 * i + index_offset,
                2 * i + index_offset + 1
            );
        }

        this.vertex_positions = new Float32Array(this.vertices.length * 3);
        this.geometry.setIndex(new BufferAttribute(new Uint16Array(this.indices), 1));
        this.geometry.addAttribute("position", new BufferAttribute(this.vertex_positions, 3));
        this.mesh = new LineSegments(this.geometry, this.material);
        this.add(this.mesh);

        this.update_cylinder();
    }

    /**
     * Turn array of vertices into array of floats required for BufferGeometry.
     */
    update_positions() {
        let positions = this.vertex_positions;
        for (var i = 0; i < this.vertices.length; i++) {
            positions[i * 3] = this.vertices[i].x;
            positions[i * 3 + 1] = this.vertices[i].y;
            positions[i * 3 + 2] = this.vertices[i].z;
        }
        this.geometry.attributes.position.needsUpdate = true;
    }

    update_cylinder() {
        /* Circles. */
        if (this.include_top_circle) {
            let offset = 2;
            for (let i = 0; i < this.num_circle_segments; i++) {
                this.vertices[i + offset].set(
                    Math.cos(i * 2 * Math.PI / this.num_circle_segments) * this.radius_top,
                    0.5,
                    Math.sin(i * 2 * Math.PI / this.num_circle_segments) * this.radius_top
                );
            }
        }
        if (this.include_bottom_circle) {
            let offset = this.include_top_circle ? this.num_circle_segments + 2 : 2;
            for (let i = 0; i < this.num_circle_segments; i++) {
                this.vertices[i + offset].set(
                    Math.cos(i * 2 * Math.PI / this.num_circle_segments) * this.radius_bottom,
                    -0.5,
                    Math.sin(i * 2 * Math.PI / this.num_circle_segments) * this.radius_bottom
                );
            }
        }

        /* Vertical lines. */
        let index_offset = 2;
        index_offset += this.include_top_circle ? this.num_circle_segments : 0;
        index_offset += this.include_bottom_circle ? this.num_circle_segments : 0;
        for (let i = 0; i < this.num_vertical_lines; i++) {
            this.vertices[i * 2 + index_offset].set(
                Math.cos(i * 2 * Math.PI / this.num_vertical_lines) * this.radius_top,
                0.5,
                Math.sin(i * 2 * Math.PI / this.num_vertical_lines) * this.radius_top
            );
            this.vertices[i * 2 + index_offset + 1].set(
                Math.cos(i * 2 * Math.PI / this.num_vertical_lines) * this.radius_bottom,
                -0.5,
                Math.sin(i * 2 * Math.PI / this.num_vertical_lines) * this.radius_bottom
            );
        }
        this.update_positions();
    }
}
