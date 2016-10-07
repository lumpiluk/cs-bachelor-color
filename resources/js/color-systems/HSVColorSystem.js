import {AbstractColorSystem} from "./AbstractColorSystem";
import {ColorSystemProperty} from "./ColorSystemProperty";
import {hsv_to_rgb, rgb_to_hsv} from "./color_conversion";
import {HSVVisualization} from "../visualizations/HSVVisualization";

export class HSVColorSystem extends AbstractColorSystem {
    constructor() {
        super();
        // nothing to do
    }

    get_name() {
        return "HSV";
    }

    get_visualization_class_name() {
        return "HSVVisualization";
    }

    create_associated_visualization($container, options) {
        return new HSVVisualization($container, options);
    }

    create_color_system_properties() {
        super.create_color_system_properties();
        let properties = [];
        properties.push(new ColorSystemProperty(1, 0, 1, "H", "h"));
        properties.push(new ColorSystemProperty(1, 0, 1, "S", "s"));
        properties.push(new ColorSystemProperty(1, 0, 1, "V", "v"));
        return properties;
    }

    get_rgb() {
        return hsv_to_rgb(
            this.properties[0].value,
            this.properties[1].value,
            this.properties[2].value
        );
    }

    set_from_rgb(r, g, b) {
        let hsv = rgb_to_hsv(r, g, b);
        this.properties[0].set_value(hsv.h);
        this.properties[1].set_value(hsv.s);
        this.properties[2].set_value(hsv.v);
    }
}
