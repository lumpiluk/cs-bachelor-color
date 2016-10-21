import {
    Object3D,
    Vector3,
    BufferGeometry,
    BufferAttribute,
    LineBasicMaterial,
    LineSegments
} from "../../../bower_components/three.js/build/three";


function get_current_angle(i, num_segments, theta_length) {
    return (i * 2 * Math.PI / num_segments) * theta_length / (2 * Math.PI);
}


export class DynamicBoundingCylinderSliced extends Object3D {
    /**
     * Creates a cylinder of height one centered around the origin.
     * @param num_circle_segments
     * @param color
     * @param radius_top
     * @param radius_bottom
     * @param include_top_circle If true, draws a circle at the top. Set to false if another bounding cylinder is to be
     * attached.
     * @param include_bottom_circle If true, draws a circle at the bottom.
     * @param theta_length
     */
    constructor(num_circle_segments, color, radius_top, radius_bottom,
                include_top_circle, include_bottom_circle, theta_length) {
        super();

        this.num_circle_segments = num_circle_segments;
        this.radius_top = radius_top;
        this.radius_bottom = radius_bottom;
        this.include_top_circle = include_top_circle;
        this.include_bottom_circle = include_bottom_circle;
        this.theta_length = theta_length;
        this.geometry = new BufferGeometry();
        this.material = new LineBasicMaterial({color: color});
        this.vertices = [
            new Vector3(0, .5, 0),
            new Vector3(0, -.5, 0)
        ];
        this.indices = []; // Which vertex is connected to which.

        /* Init circle indices, fill vertices array. */
        if (this.include_top_circle) {
            for (let i = 0; i < num_circle_segments + 1; i++) {
                this.vertices.push(new Vector3(0, 0, 0));

                if (i == num_circle_segments)
                    continue;
                // Offset of two for top and bottom center vectors.
                this.indices.push(
                    i + 2,
                    (i + 1) + 2
                );
            }
        }
        if (this.include_bottom_circle) {
            for (let i = 0; i < num_circle_segments + 1; i++) {
                this.vertices.push(new Vector3(0, 0, 0));

                if (i == num_circle_segments)
                    continue;
                let offset = this.include_top_circle ? num_circle_segments + 3: 2;
                this.indices.push(
                    i + offset,
                    (i + 1) % num_circle_segments + offset
                );
            }
        }

        /* Init lines connecting the two (potential) circles. */
        let index_offset = 2;
        index_offset += this.include_top_circle ? this.num_circle_segments + 1 : 0;
        index_offset += this.include_bottom_circle ? this.num_circle_segments + 1 : 0;
        for (let i = 0; i < 2; i++) {
            // Unlike DynamicBoundingCylinder, this will only have an opening and a closing line.
            this.vertices.push(new Vector3(0, 0, 0));
            this.vertices.push(new Vector3(0, 0, 0));
            this.indices.push(
                2 * i + index_offset,
                2 * i + index_offset + 1
            );
        }
        /* Lines connected to the respective circle's center. */
        index_offset += 4;
        if (this.include_top_circle) {
            this.indices.push(
                0, // top center
                2 // top circle start
            );
            this.indices.push(
                0, // top center
                2 + this.num_circle_segments
            );
        }
        if (this.include_bottom_circle) {
            this.indices.push(
                1, // bottom center
                2 + (this.include_top_circle ? this.num_circle_segments + 1: 0)
            );
            this.indices.push(
                1, // bottom center
                2 + (this.include_top_circle ? (this.num_circle_segments + 1) * 2: this.num_circle_segments)
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
            for (let i = 0; i < this.num_circle_segments + 1; i++) {
                let alpha = get_current_angle(i, this.num_circle_segments, this.theta_length);
                this.vertices[i + offset].set(
                    Math.cos(alpha) * this.radius_top,
                    .5,
                    -Math.sin(alpha) * this.radius_top
                );
            }
        }
        if (this.include_bottom_circle) {
            let offset = this.include_top_circle ? this.num_circle_segments + 3 : 2;
            for (let i = 0; i < this.num_circle_segments + 1; i++) {
                let alpha = get_current_angle(i, this.num_circle_segments, this.theta_length);
                this.vertices[i + offset].set(
                    Math.cos(alpha) * this.radius_bottom,
                    -.5,
                    -Math.sin(alpha) * this.radius_bottom
                );
            }
        }

        /* Vertical lines. */
        let index_offset = 2;
        index_offset += this.include_top_circle ? this.num_circle_segments + 1 : 0;
        index_offset += this.include_bottom_circle ? this.num_circle_segments + 1 : 0;

        this.vertices[index_offset].set(
            this.radius_top, .5, 0
        );
        this.vertices[index_offset + 1].set(
            this.radius_bottom, -.5, 0
        );

        this.vertices[index_offset + 2].set(
            Math.cos(this.theta_length) * this.radius_top,
            .5,
            -Math.sin(this.theta_length) * this.radius_top
        );
        this.vertices[index_offset + 3].set(
            Math.cos(this.theta_length) * this.radius_bottom,
            -.5,
            -Math.sin(this.theta_length) * this.radius_bottom
        );

        this.update_positions();
    }
}
