import {
    Object3D,
    BufferGeometry,
    Vector3,
    ArrowHelper,
    BufferAttribute,
    LineSegments,
    LineBasicMaterial
} from "../../bower_components/three.js/build/three";

function get_current_angle(i, num_segments, theta_length) {
    return (i * 2 * Math.PI / num_segments) * theta_length / (2 * Math.PI);
}

export class CircularArrow extends Object3D {
    constructor(segments, radius, theta, arrow_head_length, arrow_head_width, color, arrow_color) {
        super();

        this.segments = segments;
        this.radius = radius;
        this.theta = theta;
        this.arrow_head_length = arrow_head_length;
        this.arrow_head_width = arrow_head_width;

        this.circle_geometry = new BufferGeometry();
        this.circle_material = new LineBasicMaterial({color: color});
        this.circle_vertices = [];
        this.circle_vertex_positions = new Float32Array((segments + 1) * 3);
        this.circle_indices = []; // Which vertex is connected to which.

        /* Fill vertices array and set indices. Vertices be initialized in update_circle(). */
        for (let i = 0; i < segments + 1; i++) {
            this.circle_vertices.push(new Vector3(0, 0, 0));
            if (i != segments) {
                this.circle_indices.push(i, i + 1);
            }
        }

        this.circle_geometry.setIndex(new BufferAttribute(new Uint16Array(this.circle_indices), 1));
        this.circle_geometry.addAttribute("position", new BufferAttribute(this.circle_vertex_positions, 3));
        this.circle_mesh = new LineSegments(this.circle_geometry, this.circle_material);
        this.add(this.circle_mesh);

        this.arrow = new ArrowHelper(
            new Vector3(0, 1, 0), // Initial direction, will be updated in update_circle().
            new Vector3(0, 0, 0), // Initial origin.
            arrow_head_length + 0.001, // Arrow length.
            arrow_color,
            arrow_head_length,
            arrow_head_width
        );
        this.add(this.arrow);

        this.update_circle();
    }

    /**
     * Turn array of vertices into array of floats required for BufferGeometry.
     */
    update_positions() {
        let positions = this.circle_vertex_positions;
        for (var i = 0; i < this.circle_vertices.length; i++) {
            positions[i * 3] = this.circle_vertices[i].x;
            positions[i * 3 + 1] = this.circle_vertices[i].y;
            positions[i * 3 + 2] = this.circle_vertices[i].z;
        }
        this.circle_geometry.attributes.position.needsUpdate = true;
    }

    update_circle() {
        /* Update vertices. */
        for (let i = 0; i < this.segments + 1; i++) {
            this.circle_vertices[i].x =
                Math.cos(get_current_angle(i, this.segments, this.theta)) * this.radius;
            this.circle_vertices[i].z =
                -Math.sin(get_current_angle(i, this.segments, this.theta)) * this.radius;
        }
        this.update_positions();

        /* Update arrow. */
        this.arrow.position.set(
            Math.cos(get_current_angle(this.segments - 1, this.segments, this.theta)) * this.radius,
            0,
            -Math.sin(get_current_angle(this.segments - 1, this.segments, this.theta)) * this.radius
        );
        let dir = new Vector3(
            Math.cos(this.theta) * this.radius,
            0,
            -Math.sin(this.theta) * this.radius
        ).sub(this.arrow.position);
        if (dir.length() == 0) {
            dir = new Vector3(0, 0, -1);
        } else {
            dir.normalize();
        }
        this.arrow.rotation.set(0, 0, 0, "XYZ"); // because translateOnAxis is in object space...
        this.arrow.translateOnAxis(dir, -(this.arrow_head_length + 0.001) + this.theta * this.radius / this.segments);
        this.arrow.setDirection(dir);
    }
}
