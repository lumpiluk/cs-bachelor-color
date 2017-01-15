import {TextSprite} from "./TextSprite";
import {CircleSprite} from "./CircleSprite";
import {
    Object3D,
    BoxGeometry,
    Mesh,
    BoxHelper,
    Vector3,
    ArrowHelper
} from "../../../node_modules/three/build/three";

export class DynamicAnnotatedCube extends Object3D {
    /**
     *
     * @param material
     * @param label_x
     * @param label_y
     * @param label_z
     * @param value A Vector3 denoting the current value (e.g. current RGB color).
     */
    constructor(material, label_x, label_y, label_z, value) {
        super();

        this.material = material;
        this.value = value;

        this.cube_geometry = new BoxGeometry(1, 1, 1);
        this.cube_mesh = new Mesh(this.cube_geometry, this.material);
        this.cube_mesh.position.set(.5, .5, .5);
        this.add(this.cube_mesh);

        /* Coordinate system, arrows. */
        /* Cube bounding box (static). */
        this.wireframe_cube_geometry = new BoxGeometry(1, 1, 1);
        this.wireframe_cube = new BoxHelper(
            new Mesh(this.wireframe_cube_geometry),
            0x000000
        );
        this.wireframe_cube.matrixAutoUpdate = false; // Object won't move dynamically anyway.
        this.wireframe_cube.position.set(.5, .5, .5);
        this.wireframe_cube.updateMatrix();
        this.add(this.wireframe_cube);
        /* Cube bounding box (dynamic). */
        this.dynamic_wireframe_cube_geom = new BoxGeometry(1, 1, 1);
        this.dynamic_wireframe_cube = new BoxHelper(
            new Mesh(this.dynamic_wireframe_cube_geom),
            0x000000
        );
        this.dynamic_wireframe_cube.matrixAutoUpdate = false; // Remember to do this manually!
        this.dynamic_wireframe_cube.position.set(.5, .5, .5);
        this.dynamic_wireframe_cube.updateMatrix();
        this.add(this.dynamic_wireframe_cube);
        /*
         * Arrows.
         * Helpful example: view-source:https://stemkoski.github.io/Three.js/Helpers.html
         */
        let arrow_origin = new Vector3(-.01, -.01, -.01);
        let arrow_length = 1.15;
        let arrow_color_hex = 0xffffff;
        let arrow_head_length = 0.1;
        let arrow_head_width = 0.05;
        this.arrow_x = new ArrowHelper(
            new Vector3(1, 0, 0),
            arrow_origin, arrow_length, arrow_color_hex, arrow_head_length, arrow_head_width
        );
        this.arrow_y = new ArrowHelper(
            new Vector3(0, 1, 0),
            arrow_origin, arrow_length, arrow_color_hex, arrow_head_length, arrow_head_width
        );
        this.arrow_z = new ArrowHelper(
            new Vector3(0, 0, 1),
            arrow_origin, arrow_length, arrow_color_hex, arrow_head_length, arrow_head_width
        );
        this.add(this.arrow_x);
        this.add(this.arrow_y);
        this.add(this.arrow_z);
        /* Labels */
        this.label_x = new TextSprite(label_x, 0.2);
        this.label_x.sprite.position.set(1.2, -.1, -.1);
        this.add(this.label_x.sprite);
        this.label_y = new TextSprite(label_y, 0.2);
        this.label_y.sprite.position.set(-.1, 1.2, -.1);
        this.add(this.label_y.sprite);
        this.label_z = new TextSprite(label_z, 0.2);
        this.label_z.sprite.position.set(-.1, -.1, 1.2);
        this.add(this.label_z.sprite);
        this.label_origin = new TextSprite("0", 0.2);
        this.label_origin.sprite.position.set(-.1, -.1, -.1);
        this.add(this.label_origin.sprite);
        /* Current color indicator. */
        this.current_color_sprite = new CircleSprite(.1, 256, 10);
        this.current_color_sprite.sprite_material.color.setRGB(1, 1, 1);
        this.current_color_sprite.sprite.position.set(1, 1, 1);
        this.add(this.current_color_sprite.sprite);
    }

    update_cube() {
        this.cube_mesh.position.set(
            this.value.x / 2,
            this.value.y / 2,
            this.value.z / 2
        );
        this.cube_mesh.scale.set(
            this.value.x,
            this.value.y,
            this.value.z
        );
        this.cube_mesh.updateMatrix();

        this.dynamic_wireframe_cube.position.copy(this.cube_mesh.position);
        this.dynamic_wireframe_cube.scale.copy(this.cube_mesh.scale);
        this.dynamic_wireframe_cube.updateMatrix();

        this.current_color_sprite.sprite.position.set(
            this.value.x,
            this.value.y,
            this.value.z
        );
    }

    show_only_color_solid(value) {
        this.wireframe_cube.visible = !value;
        this.dynamic_wireframe_cube.visible = !value;
        this.arrow_x.visible = !value;
        this.arrow_y.visible = !value;
        this.arrow_z.visible = !value;
        this.label_x.sprite.visible = !value;
        this.label_y.sprite.visible = !value;
        this.label_z.sprite.visible = !value;
        this.label_origin.sprite.visible = !value;
        this.current_color_sprite.sprite.visible = !value;
    }
}
