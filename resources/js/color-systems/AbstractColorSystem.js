export class AbstractColorSystem {
    constructor() {
        this.properties = this.create_color_system_properties();
    }

    get_name() {

    }

    get_visualization_class_name() {

    }

    create_associated_visualization($container, options) {

    }

    create_color_system_properties() {

    }

    get_rgb() {

    }

    set_from_rgb(r, g, b) {

    }

    randomize() {
        for (let property of this.properties) {
            property.set_to_random();
        }
    }

    get_tex() {
        let s = "(";
        for (let i = 0; i < this.properties.length; i++) {
            s += this.properties[i].value.toFixed(3);
            if (i != this.properties.length - 1) {
                s += ",";
            }
        }
        s += ")_\\text{" + this.get_name() + "}";
        return s;
    }

    get_euclidean_distance_rgb(other_color_system) {
        let other_rgb = other_color_system.get_rgb();
        let this_rgb = this.get_rgb();
        return Math.sqrt(Math.pow(this_rgb.r - other_rgb.r, 2) +
            Math.pow(this_rgb.g - other_rgb.g, 2) +
            Math.pow(this_rgb.b - other_rgb.b, 2));
    }
}
