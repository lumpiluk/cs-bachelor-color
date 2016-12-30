import {AbstractColorSystem} from "./AbstractColorSystem";
import {ColorSystemProperty} from "./ColorSystemProperty";
import {hsl_to_rgb, rgb_to_hsl} from "./color_conversion";
import {HSLVisualization} from "../visualizations/HSLVisualization";
import {random_sample} from "../util";


var EASY_HUES = [];
for (let i = 0; i < 1; i += 1/12) {
    EASY_HUES.push(i);
}

export class HSLColorSystem extends AbstractColorSystem {
    constructor(color_system_units=null) {
        super(color_system_units);
        // nothing to do
    }

    get_name() {
        return "HSL";
    }

    get_visualization_class_name() {
        return "HSLVisualization";
    }

    get_visualization_css_class() {
        return "hsl";
    }

    create_color_system_properties(color_system_units) {
        super.create_color_system_properties();
        let properties = [];
        let u = color_system_units;
        properties.push(new ColorSystemProperty(1, 0, 1, "H", "h", u.unit_scales[0], u.unit_symbols[0]));
        properties.push(new ColorSystemProperty(1, 0, 1, "S", "s", u.unit_scales[1], u.unit_symbols[1]));
        properties.push(new ColorSystemProperty(1, 0, 1, "L", "l", u.unit_scales[2], u.unit_symbols[2]));
        return properties;
    }

    get_rgb() {
        return hsl_to_rgb(
            this.properties[0].value,
            this.properties[1].value,
            this.properties[2].value
        );
    }

    set_from_rgb(r, g, b, update_sliders, instigating_color_system) {
        let hsl = rgb_to_hsl(r, g, b);
        this.properties[0].set_value(hsl.h, update_sliders, instigating_color_system);
        this.properties[1].set_value(hsl.s, update_sliders, instigating_color_system);
        this.properties[2].set_value(hsl.l, update_sliders, instigating_color_system);
    }

    randomize(easy) {
        super.randomize(easy);
        if (easy == null) {
            return;
        }
        if (easy) {
            this.properties[0].set_value(random_sample(EASY_HUES));
        }
    }
}
