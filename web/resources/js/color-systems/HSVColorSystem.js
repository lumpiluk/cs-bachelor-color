import {AbstractColorSystem} from "./AbstractColorSystem";
import {ColorSystemProperty} from "./ColorSystemProperty";
import {hsv_to_rgb, rgb_to_hsv} from "./color_conversion";
import {HSVVisualization} from "../visualizations/HSVVisualization";
import {random_sample} from "../util";

var EASY_HUES = [];
for (let i = 0; i < 1; i += 1/12) {
    EASY_HUES.push(i);
}

export class HSVColorSystem extends AbstractColorSystem {
    constructor(color_system_units=null) {
        super(color_system_units);
        // nothing to do
    }

    get_name() {
        return "HSV";
    }

    get_visualization_class_name() {
        return "HSVVisualization";
    }

    get_visualization_css_class() {
        return "hsv";
    }

    create_color_system_properties(color_system_units) {
        super.create_color_system_properties();
        let properties = [];
        let u = color_system_units;
        properties.push(new ColorSystemProperty(1, 0, 1, "H", "h", u, 0));
        properties.push(new ColorSystemProperty(1, 0, 1, "S", "s", u, 1));
        properties.push(new ColorSystemProperty(1, 0, 1, "V", "v", u, 2));
        return properties;
    }

    get_rgb() {
        return hsv_to_rgb(
            this.properties[0].value,
            this.properties[1].value,
            this.properties[2].value
        );
    }

    set_from_rgb(r, g, b, update_sliders, instigating_color_system) {
        let hsv = rgb_to_hsv(r, g, b);
        this.properties[0].set_value(hsv.h, update_sliders, instigating_color_system);
        this.properties[1].set_value(hsv.s, update_sliders, instigating_color_system);
        this.properties[2].set_value(hsv.v, update_sliders, instigating_color_system);
    }

    /* (override) */
    randomize(easy) {
        super.randomize(easy);
        if (easy != null && easy) {
            this.properties[0].set_value(random_sample(EASY_HUES));
        }
    }
}
