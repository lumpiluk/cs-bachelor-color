class ColorSystemPropertyChangeEvent {
    constructor(property, instigating_color_system) {
        this.property = property;
        this.instigating_color_system = instigating_color_system;
    }
}

export class ColorSystemProperty {
    /**
     *
     * @param initial_value An initial value.
     * @param name Name of this property as it will appear on labels.
     * @param short_name A name that can be used as part of an html id.
     * @param min Minimum value.
     * @param max Maximum value.
     * @param color_system_units
     * @param index_in_color_system
     */
    constructor(initial_value, min, max, name, short_name,
                color_system_units,
                index_in_color_system) {
        this.value = initial_value;
        this.name = name;
        this.short_name = short_name;
        this.min = min;
        this.max = max;
        this.color_system_units = color_system_units;
        this.index_in_color_system = index_in_color_system;
        this.change_listeners = [];
        this.sliders = [];
    }

    /**
     * @param scaled If scaled is true, will return this property's value scaled by its unit_scale.
     * Otherwise a value between 0 and 1 is returned.
     * @returns {*} This property's value.
     */
    get_value(scaled=false) {
        if (scaled) {
            return this.color_system_units.get_transformed(this.value, this.index_in_color_system);
        }
        return this.value;
    }

    /**
     * Utility function for unit conversions.
     * @param value
     * @returns {*}
     */
    unit_transform_value(value) {
        return this.color_system_units.get_transformed(value, this.index_in_color_system);
    }

    /**
     * Utility function for reverse unit conversions.
     * @param value
     * @returns {*}
     */
    unit_inverse_transform_value(value) {
        return this.color_system_units.get_inverse_transformed(value, this.index_in_color_system);
    }

    get_unit_symbol() {
        return this.color_system_units.unit_symbols[this.index_in_color_system];
    }

    get_scaled_min() {
        return this.color_system_units.get_transformed(this.min, this.index_in_color_system);
    }

    get_scaled_max() {
        return this.color_system_units.get_transformed(this.max, this.index_in_color_system);
    }

    get_scaled_step() {
        return this.color_system_units.step_sizes[this.index_in_color_system];
    }

    add_listener(callback) {
        this.change_listeners.push(callback);
    }

    add_slider(slider) {
        this.sliders.push(slider);
    }

    /**
     * @param value The new value (between 0 and 1).
     * @param update_slider (optional) If true, property's slider will be updated. Default is false.
     * Warning: May cause infinite loops if used incorrectly!
     * @param instigating_color_system (optional) The color system that started the event chain.
     * Required to prevent infinite loops if this color system is connected to other systems.
     */
    set_value(value, update_slider, instigating_color_system) {
        this.value = parseFloat(value);
        let event = new ColorSystemPropertyChangeEvent(this, instigating_color_system);
        for (let callback of this.change_listeners) {
            callback(event);
        }

        if (update_slider) {
            for (let s of this.sliders) {
                s.update_slider();
            }
        }
    }

    change_units_to(color_system_units) {
        this.color_system_units = color_system_units;
        for (let slider of this.sliders) {
            slider.update_unit_scale();
        }
    }

    set_to_random() {
        // TODO: use rounding of current unit
        this.value = Math.random() * Math.abs(this.max - this.min) + this.min;
    }
}
