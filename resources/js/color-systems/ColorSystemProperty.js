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
     */
    constructor(initial_value, min, max, name, short_name) {
        this.value = initial_value;
        this.name = name;
        this.short_name = short_name;
        this.min = min;
        this.max = max;
        this.change_listeners = [];
        this.sliders = [];
    }

    add_listener(callback) {
        this.change_listeners.push(callback);
    }

    add_slider(slider) {
        this.sliders.push(slider);
    }

    /**
     * @param value The new value.
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

    set_to_random() {
        this.value = Math.random() * Math.abs(this.max - this.min) + this.min;
    }
}
