import {Visualization, DEFAULT_VERTEX_SHADER} from "./Visualization";
import {TextSprite} from "./TextSprite";
import {CircleSprite} from "./CircleSprite";
import {ColorSystemProperty} from "./ColorSystemProperty";
import {VisualizationControlSlider} from "./VisualizationControlSlider";
import {
    BoxGeometry,
    ShaderMaterial,
    Mesh,
    Matrix4,
    BoxHelper,
    Vector3,
    ArrowHelper
} from "../../bower_components/three.js/build/three";


const RGB_CUBE_SHADER = require("../shaders/rgb-fragment.glsl");

export class RGBCubeVisualization extends Visualization {
    constructor($container) {
        super($container);

        this.rgb_cube_geometry = new BoxGeometry(1, 1, 1);
        this.rgb_cube_mat = new ShaderMaterial({
            vertexShader: DEFAULT_VERTEX_SHADER(),
            fragmentShader: RGB_CUBE_SHADER()
        });
        this.rgb_cube_mesh = new Mesh(this.rgb_cube_geometry, this.rgb_cube_mat);
        this.rgb_cube_mesh.matrixAutoUpdate = false; // Makes adjusting world transforms easier.
        this.rgb_cube_mesh.applyMatrix(new Matrix4().makeTranslation(0.5, 0.5, 0.5));
        this.scene.add(this.rgb_cube_mesh);

        /* Coordinate system, arrows. */
        /* Cube bounding box. */
        this.wireframe_cube_geometry = new BoxGeometry(1, 1, 1);
        this.wireframe_cube = new BoxHelper(
            new Mesh(this.wireframe_cube_geometry),
            0x000000
        );
        this.wireframe_cube.matrixAutoUpdate = false; // Object won't move dynamically anyway.
        this.wireframe_cube.applyMatrix(new Matrix4().makeTranslation(0.5, 0.5, 0.5));
        this.scene.add(this.wireframe_cube);
        /*
         * Arrows.
         * Helpful example: view-source:https://stemkoski.github.io/Three.js/Helpers.html
         */
        let arrow_origin = new Vector3(-.01, -.01, -.01);
        let arrow_length = 1.15;
        let arrow_color_hex = 0xffffff;
        let arrow_head_length = 0.1;
        let arrow_head_width = 0.05;
        this.arrow_red = new ArrowHelper(
            new Vector3(1, 0, 0),
            arrow_origin, arrow_length, arrow_color_hex, arrow_head_length, arrow_head_width
        );
        this.arrow_green = new ArrowHelper(
            new Vector3(0, 1, 0),
            arrow_origin, arrow_length, arrow_color_hex, arrow_head_length, arrow_head_width
        );
        this.arrow_blue = new ArrowHelper(
            new Vector3(0, 0, 1),
            arrow_origin, arrow_length, arrow_color_hex, arrow_head_length, arrow_head_width
        );
        this.scene.add(this.arrow_red);
        this.scene.add(this.arrow_green);
        this.scene.add(this.arrow_blue);
        /* Labels */
        this.label_value = new TextSprite("R", 0.15);
        this.label_value.sprite.position.set(1.2, -.1, -.1);
        this.scene.add(this.label_value.sprite);
        this.label_green = new TextSprite("G", 0.15);
        this.label_green.sprite.position.set(-.1, 1.2, -.1);
        this.scene.add(this.label_green.sprite);
        this.label_blue = new TextSprite("B", 0.15);
        this.label_blue.sprite.position.set(-.1, -.1, 1.2);
        this.scene.add(this.label_blue.sprite);
        this.label_origin = new TextSprite("0", 0.15);
        this.label_origin.sprite.position.set(-.1, -.1, -.1);
        this.scene.add(this.label_origin.sprite);
        /* Current color indicator. */
        //this.current_color_sphere_geometry = new SphereGeometry(.05, 7, 7);
        //this.current_color_material = new MeshBasicMaterial({color: 0xffffff});
        //this.current_color_sphere_mesh = new Mesh(this.current_color_sphere_geometry,
        //    this.current_color_material);
        //this.current_color_sphere_mesh.position.set(1, 1, 1);
        //this.scene.add(this.current_color_sphere_mesh);
        this.current_color_sprite = new CircleSprite(.1, 256, 10);
        this.current_color_sprite.sprite_material.color.setRGB(1, 1, 1);
        this.current_color_sprite.sprite.position.set(1, 1, 1);
        this.scene.add(this.current_color_sprite.sprite);

        /* Rotate around center of the cube rather than the origin. */
        this.pivot.applyMatrix(new Matrix4().makeTranslation(0.5, 0.5, 0.5));

        /* Color system. */
        this.red_property = new ColorSystemProperty(1.0, 0.0, 1.0, "R", "r");
        this.green_property = new ColorSystemProperty(1.0, 0.0, 1.0, "G", "g");
        this.blue_property = new ColorSystemProperty(1.0, 0.0, 1.0, "B", "b");

        /* Initialize color system controls. */
        this.red_control = null;
        this.green_control = null;
        this.blue_control = null;
        if (this.$figure != null) {
            this.init_controls();
            this.init_advanced_controls();
        }

        /* Attach event handlers. */
        let that = this;
        this.red_property.add_listener((event) => that.on_color_system_property_change.call(this, event));
        this.blue_property.add_listener((event) => that.on_color_system_property_change.call(this, event));
        this.green_property.add_listener((event) => that.on_color_system_property_change.call(this, event));
    }

    init_controls() {
        super.init_controls();
        let $controls = this.$figure.find(".visualization-controls");
        if ($controls.length == 0) {
            return;
        }
        this.red_control = new VisualizationControlSlider(
            this.$figure.find(".visualization-controls"),
            this.red_property,
            0.001
        );
        this.green_control = new VisualizationControlSlider(
            this.$figure.find(".visualization-controls"),
            this.green_property,
            0.001
        );
        this.blue_control = new VisualizationControlSlider(
            this.$figure.find(".visualization-controls"),
            this.blue_property,
            0.001
        );
    }

    init_advanced_controls() {
        super.init_advanced_controls();
        let $controls = this.$figure.find(".visualization-controls-advanced");
        if ($controls.length == 0) {
            return;
        }
        // TODO?
    }

    on_color_system_property_change(event) {
        this.set_selected_color(
            "rgb(" +
            (this.red_property.value * 100).toString() + "%, " +
            (this.green_property.value * 100).toString() + "%, " +
            (this.blue_property.value * 100).toString() + "%)"
        );

        this.rgb_cube_mesh.matrix.identity();
        this.rgb_cube_mesh.matrix.multiply(new Matrix4().makeTranslation(
            this.red_property.value / 2,
            this.green_property.value / 2,
            this.blue_property.value / 2
        ));
        this.rgb_cube_mesh.matrix.multiply(new Matrix4().makeScale(
            this.red_property.value,
            this.green_property.value,
            this.blue_property.value
        ));

        this.current_color_sprite.sprite.position.set(
            this.red_property.value,
            this.green_property.value,
            this.blue_property.value
        );
        this.current_color_sprite.sprite_material.color.setRGB(
            this.red_property.value,
            this.green_property.value,
            this.blue_property.value
        );

        this.render();
    }
}

/**
 * Finds all RGB cube visualizations in the document and initializes them.
 * @returns {Array} An array containing all newly added visualizations.
 */
export function attach_rgb_cube_visualizations() {
    let visualizations = [];
    $(".visualization.rgb-cube").each(function() {
        let rgb_cube = new RGBCubeVisualization($(this));
        rgb_cube.render();
        visualizations.push(rgb_cube);
    });
    return visualizations;
}
