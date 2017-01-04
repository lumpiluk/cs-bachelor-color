import {DEFAULT_COLOR_SYSTEM_UNITS} from "./ColorSystemUnits";
import {srgb_to_lab} from "./color_conversion";

class ColorSystemChangeEvent {
    constructor(system, property) {
        this.system = system;
        this.propery = property;
    }
}

export class AbstractColorSystem {
    constructor(color_system_units=null) {
        if (color_system_units == null) {
            color_system_units = DEFAULT_COLOR_SYSTEM_UNITS;
        }
        this.properties = this.create_color_system_properties(color_system_units);

        this.change_listeners = [];
        this.connected_systems = [];
        for (let p of this.properties) {
            p.add_listener((event) => this.on_property_changed(event));
        }
    }

    add_listener(callback) {
        this.change_listeners.push(callback);
    }

    change_units_to(color_system_units) {
        let u = color_system_units;
        if (this.properties.length > u.unit_scales.length ||
                this.properties.length > u.unit_symbols.length ||
                this.properties.length > u.step_sizes.length) {
            throw "Insufficient unit parameters for color system properties.";
        }
        for (let i = 0; i < this.properties.length; i++) {
            this.properties[i].change_units_to(u);
        }
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
     * Validity check intended for use in VisualizationControlSlider.
     * Useful for CMYK where this function should be overridden.
     * @param value
     * @param index
     * @returns {boolean}
     */
    is_valid(value, index) {
        return value >= this.properties[index].min && value <= this.properties[index].max;
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

    get_tex(scaled=true, with_units=true) {
        let s = "(";
        for (let i = 0; i < this.properties.length; i++) {
            s += this.properties[i].get_value(scaled);
            if (with_units) {
                s += "\\text{" + this.properties[i].get_unit_symbol() + "}";
            }
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

    get_lab_color_difference(other_color_system) {
        let other_rgb = other_color_system.get_rgb();
        let this_rgb = this.get_rgb();
        let other_lab = srgb_to_lab(other_rgb.r, other_rgb.g, other_rgb.b);
        let this_lab = srgb_to_lab(this_rgb.r, this_rgb.g, this_rgb.b);
        return Math.sqrt(Math.pow(this_lab.l - other_lab.l, 2) +
            Math.pow(this_lab.a - other_lab.a, 2) +
            Math.pow(this_lab.b - other_lab.b, 2));
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
