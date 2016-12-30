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
     * @param unit_scale Values will be stored as floating point numbers between 0 and 1.
     * To use this property as degrees, for example, you can set unit_scale to 360.
     * You can retrieve the scaled value using get_value().
     * @param unit_symbol E.g. "°" or "rad".
     */
    constructor(initial_value, min, max, name, short_name, unit_scale=1, unit_symbol="") {
        this.value = initial_value;
        this.name = name;
        this.short_name = short_name;
        this.min = min;
        this.max = max;
        this.unit_scale = unit_scale;
        this.unit_symbol = unit_symbol;
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
            return this.value * this.unit_scale;
        }
        return this.value;
    }

    get_scaled_min() {
        return this.min * this.unit_scale;
    }

    get_scaled_max() {
        return this.max * this.unit_scale;
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
     * @param instigating_color_system The color system that started the event chain.
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

    change_unit_scale_to(value, symbol="") {
        this.unit_scale = value;
        this.unit_symbol = symbol;
        for (let slider of this.sliders) {
            slider.update_unit_scale();
        }
    }

    set_to_random() {
        this.value = Math.random() * Math.abs(this.max - this.min) + this.min;
    }
}
