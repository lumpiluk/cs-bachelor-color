import {BufferGeometry, BufferAttribute, Vector3} from "../../bower_components/three.js/build/three";

const BOTTOM_CENTER_VERTEX_ID = 0;
const TOP_CENTER_VERTEX_ID = 1;

function get_current_angle(i, num_segments, theta_length) {
    return (i * 2 * Math.PI / num_segments) * theta_length / (2 * Math.PI);
}

/**
 * A dynamic cylinder without normals or UVs.
 */
export class DynamicCylinderBufferGeometry extends BufferGeometry {
    constructor(radius_top, radius_bottom, height, num_segments, theta_length) {
        super();

        this.type = "DynamicCylinderBufferGeometry";

        this.radius_top = radius_top;
        this.radius_bottom = radius_bottom;
        this.height = height;
        this.num_segments = num_segments;
        this.theta_length = theta_length;

        this.vertices = [];
        /**
         * Which vertex is connected to which other two vertices.
         * Every triple of vertex indices defines a face (counter-clockwise!).
         * @type {Array}
         */
        this.indices = [];

        /*
         * Create vertices. Will be properly initialized in update_cylinder.
         * # of vertices = 2 * #(vertices per circle) + top center + bottom center.
         * Note that, in order to make theta_length work, two vertices are needed for each
         * circle at 0 degrees and at 360 degrees. (=> this.num_segments + 1)
         */
        for (let i = 0; i < (this.num_segments + 1) * 2 + 2; i++) {
            this.vertices.push(new Vector3(0, 0, 0));
        }

        /* Init triangle faces. */
        for (let i = 0; i < num_segments; i++) {
            /* Define triangle faces via indices. */
            let current_top_circle_vertex = i * 2 + 2;
            let next_top_circle_vertex = (i + 1) * 2 + 2;
            let next_bottom_circle_vertex = (i + 1) * 2 + 3;
            let current_bottom_circle_vertex = i * 2 + 3;
            this.indices.push( // top face triangle
                current_top_circle_vertex,
                next_top_circle_vertex,
                TOP_CENTER_VERTEX_ID,
            );
            this.indices.push( // mantle triangle #1
                current_top_circle_vertex,
                next_bottom_circle_vertex,
                next_top_circle_vertex,
            );
            this.indices.push( //mantle triangle #2
                current_top_circle_vertex,
                current_bottom_circle_vertex,
                next_bottom_circle_vertex,
            );
            this.indices.push( // bottom face triangle
                current_bottom_circle_vertex,
                BOTTOM_CENTER_VERTEX_ID,
                next_bottom_circle_vertex,
            )
        }
        /* Inner quad at 0 degrees. */
        this.indices.push(
            TOP_CENTER_VERTEX_ID,
            3, // bottom circle at 0 degrees
            2, // top circle at 0 degrees
        );
        this.indices.push(
            3, // bottom circle at 0 degrees
            TOP_CENTER_VERTEX_ID,
            BOTTOM_CENTER_VERTEX_ID,
        );
        /* Inner quad at theta_length. */
        this.indices.push(
            TOP_CENTER_VERTEX_ID,
            this.vertices.length - 1, // bottom circle at theta_length
            BOTTOM_CENTER_VERTEX_ID,
        );
        this.indices.push(
            this.vertices.length - 1,
            TOP_CENTER_VERTEX_ID,
            this.vertices.length - 2, // top circle at theta_length
        );

        this.vertex_positions = new Float32Array(this.vertices.length * 3);
        this.setIndex(new BufferAttribute(new Uint16Array(this.indices), 1));
        this.addAttribute('position', new BufferAttribute(this.vertex_positions, 3));

        this.update_cylinder();
    }

    /**
     * Turn array of vertices into array of floats required for BufferGeometry.
     * @returns {Float32Array}
     */
    update_positions() {
        let positions = this.vertex_positions;
        for (var i = 0; i < this.vertices.length; i++) {
            positions[i * 3] = this.vertices[i].x;
            positions[i * 3 + 1] = this.vertices[i].y;
            positions[i * 3 + 2] = this.vertices[i].z;
        }
        this.attributes.position.needsUpdate = true;
    }

    update_cylinder() {
        /* Update vertices. */
        this.vertices[BOTTOM_CENTER_VERTEX_ID].x = 0;
        this.vertices[BOTTOM_CENTER_VERTEX_ID].y = -this.height / 2;
        this.vertices[BOTTOM_CENTER_VERTEX_ID].z = 0;
        this.vertices[TOP_CENTER_VERTEX_ID].x = 0;
        this.vertices[TOP_CENTER_VERTEX_ID].y = this.height / 2;
        this.vertices[TOP_CENTER_VERTEX_ID].z = 0;
        for (let i = 0; i < this.num_segments + 1; i++) {
            let j = i * 2 + 2;
            /* Top circle. */
            this.vertices[j].x =
                Math.cos(get_current_angle(i, this.num_segments, this.theta_length)) * this.radius_top;
            this.vertices[j].y = this.height / 2;
            this.vertices[j].z =
                -Math.sin(get_current_angle(i, this.num_segments, this.theta_length)) * this.radius_top;
            /* Bottom circle. */
            j += 1;
            this.vertices[j].x =
                Math.cos(get_current_angle(i, this.num_segments, this.theta_length)) * this.radius_bottom;
            this.vertices[j].y = -this.height / 2;
            this.vertices[j].z =
                -Math.sin(get_current_angle(i, this.num_segments, this.theta_length)) * this.radius_bottom;
        }

        this.update_positions();
    }
}
