import {BufferGeometry, BufferAttribute, Vector3} from "../../bower_components/three.js/build/three";

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

        this.vertices = [
            new Vector3(0, -height / 2, 0), // bottom center
            new Vector3(0, height/ 2, 0) // top center
        ];
        /**
         * Which vertex is connected to which other two vertices.
         * Every triple of vertex indices defines a face (counter-clockwise!).
         * @type {Array}
         */
        this.indices = [];

        /* Init vertices. */
        for (let i = 0; i < num_segments; i++) {
            /* Top circle. */
            this.vertices.push(new Vector3(
                Math.cos(get_current_angle(i, num_segments, theta_length)) * radius_top,
                height / 2,
                Math.sin(get_current_angle(i, num_segments, theta_length)) * radius_top
            ));
            /* Bottom circle. */
            this.vertices.push(new Vector3(
                Math.cos(get_current_angle(i, num_segments, theta_length)) * radius_bottom,
                -height / 2,
                Math.sin(get_current_angle(i, num_segments, theta_length)) * radius_bottom
            ));

            /* Define triangle faces via indices. */
            let current_top_circle_vertex = i * 2 + 2;
            let next_top_circle_vertex = ((i + 1) % num_segments) * 2 + 2;
            let next_bottom_circle_vertex = ((i + 1) % num_segments) * 2 + 3;
            let current_bottom_circle_vertex = i * 2 + 3;
            this.indices.push( // top face triangle
                current_top_circle_vertex,
                1, // top center
                next_top_circle_vertex
            );
            this.indices.push( // mantle triangle #1
                current_top_circle_vertex,
                next_top_circle_vertex,
                next_bottom_circle_vertex
            );
            this.indices.push( //mantle triangle #2
                current_top_circle_vertex,
                next_bottom_circle_vertex,
                current_bottom_circle_vertex
            );
            this.indices.push( // bottom face triangle
                current_bottom_circle_vertex,
                next_bottom_circle_vertex,
                0 // bottom center
            )
        }

        this.setIndex(new BufferAttribute(new Uint16Array(this.indices), 1));
        this.addAttribute('position', new BufferAttribute(this.calculate_positions(), 3));
    }

    /**
     * Turn array of vertices into array of floats required for BufferGeometry.
     * @returns {Float32Array}
     */
    calculate_positions() {
        let positions = new Float32Array(this.vertices.length * 3);
        for (var i = 0; i < this.vertices.length; i++) {
            positions[i * 3] = this.vertices[i].x;
            positions[i * 3 + 1] = this.vertices[i].y;
            positions[i * 3 + 2] = this.vertices[i].z;
        }
        return positions;
    }
}
