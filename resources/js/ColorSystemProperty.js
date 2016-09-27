/**
 * Created by lumpiluk on 9/21/16.
 */

class ColorSystemPropertyChangeEvent {
    constructor(property) {
        this.property = property;
    }
}

export class ColorSystemProperty {
    /**
     *
     * @param initial_value An initial value.
     * @param name Name of this property as it will appear on labels.
     * @param short_name An name that can be used as part of an html id.
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
    }

    add_listener(callback) {
        this.change_listeners.push(callback);
    }

    set_value(value) {
        this.value = value;
        let event = new ColorSystemPropertyChangeEvent(this);
        for (let callback of this.change_listeners) {
            callback(event);
        }
    }
}
