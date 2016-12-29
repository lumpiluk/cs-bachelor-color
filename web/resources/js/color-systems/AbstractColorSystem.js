class ColorSystemChangeEvent {
    constructor(system, property) {
        this.system = system;
        this.propery = property;
    }
}

export class AbstractColorSystem {
    constructor() {
        this.properties = this.create_color_system_properties();
        this.change_listeners = [];
        this.connected_systems = [];
        for (let p of this.properties) {
            p.add_listener((event) => this.on_property_changed(event));
        }
    }

    add_listener(callback) {
        this.change_listeners.push(callback);
    }

    get_name() {

    }

    get_visualization_class_name() {

    }

    get_visualization_css_class() {

    }

    create_color_system_properties() {

    }

    get_rgb() {

    }

    /**
     *
     * @param r
     * @param g
     * @param b
     * @param update_sliders (optional) If true, properties' sliders will be updated. Default is false.
     * Warning: May cause infinite loops if used incorrectly!
     * @param instigating_color_system The color system that started the event chain.
     * Required to prevent infinite loops if this color system is connected to other systems.
     */
    set_from_rgb(r, g, b, update_sliders, instigating_color_system) {

    }

    randomize(easy) {
        for (let property of this.properties) {
            property.set_to_random();
        }
    }

    get_tex(scaled=true) {
        let s = "(";
        for (let i = 0; i < this.properties.length; i++) {
            s += this.properties[i].get_value(scaled).toFixed(3);
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

    on_property_changed(event) {
        let e = new ColorSystemChangeEvent(this, event.property);
        for (let callback of this.change_listeners) {
            callback(e);
        }

        let rgb = this.get_rgb();
        for (let c of this.connected_systems) {
            if (event.instigating_color_system === c) {
                /* Prevent infinite loop. */
                continue;
            }
            c.set_from_rgb(rgb.r, rgb.g, rgb.b, true, this);
        }
    }

    /**
     * Connects another color system to this color system. If either system's values change,
     * both systems will be set to the same color.
     * @param other_color_system
     */
    connect_to(other_color_system) {
        this.connected_systems.push(other_color_system);
        other_color_system.connected_systems.push(this);
    }
}
