import {AbstractColorSystem} from "./AbstractColorSystem";
import {ColorSystemProperty} from "./ColorSystemProperty";
import {cmyk_to_rgb, cmy_to_cmyk, rgb_to_cmyk} from "./color_conversion";

export class CMYKColorSystem extends AbstractColorSystem {
    constructor(color_system_units=null) {
        super(color_system_units);
        // nothing to do
    }

    get_name() {
        return "CMYK";
    }

    get_visualization_class_name() {
        return null;
    }

    get_visualization_css_class() {
        return null;
    }

    randomize() {
        for (let i = 0; i < 3; i++) {
            this.properties[i].set_to_random();
        }
        let cmyk = cmy_to_cmyk(this.properties[0].value, this.properties[1].value, this.properties[2].value);
        this.properties[0].set_value(cmyk.c);
        this.properties[1].set_value(cmyk.m);
        this.properties[2].set_value(cmyk.y);
        this.properties[3].set_value(cmyk.k);
    }

    create_color_system_properties(color_system_units) {
        super.create_color_system_properties();
        let properties = [];
        let u = color_system_units;
        properties.push(new ColorSystemProperty(1, 0, 1, "C", "c", u.unit_scales[0], u.unit_symbols[0]));
        properties.push(new ColorSystemProperty(1, 0, 1, "M", "m", u.unit_scales[1], u.unit_symbols[1]));
        properties.push(new ColorSystemProperty(1, 0, 1, "Y", "y", u.unit_scales[2], u.unit_symbols[2]));
        properties.push(new ColorSystemProperty(1, 0, 1, "K", "k", u.unit_scales[3], u.unit_symbols[3]));
        return properties;
    }

    get_rgb() {
        return cmyk_to_rgb(
            this.properties[0].value,
            this.properties[1].value,
            this.properties[2].value,
            this.properties[3].value
        );
    }

    set_from_rgb(r, g, b, update_sliders, instigating_color_system) {
        let cmyk = rgb_to_cmyk(r, g, b);
        this.properties[0].set_value(cmyk.c, update_sliders, instigating_color_system);
        this.properties[1].set_value(cmyk.m, update_sliders, instigating_color_system);
        this.properties[2].set_value(cmyk.y, update_sliders, instigating_color_system);
        this.properties[3].set_value(cmyk.k, update_sliders, instigating_color_system);
    }
}
