import {AbstractColorSystem} from "./AbstractColorSystem";
import {ColorSystemProperty} from "./ColorSystemProperty";
import {cmyk_to_rgb, cmy_to_cmyk} from "../color_conversion";

export class CMYKColorSystem extends AbstractColorSystem {
    constructor() {
        super();
        // nothing to do
    }

    get_name() {
        return "CMYK";
    }

    get_visualization_class_name() {
        return null;
    }

    create_associated_visualization($container, options) {
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

    create_color_system_properties() {
        super.create_color_system_properties();
        let properties = [];
        properties.push(new ColorSystemProperty(1, 0, 1, "C", "c"));
        properties.push(new ColorSystemProperty(1, 0, 1, "M", "m"));
        properties.push(new ColorSystemProperty(1, 0, 1, "Y", "y"));
        properties.push(new ColorSystemProperty(1, 0, 1, "K", "k"));
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
}
