import {AbstractColorSystem} from "./AbstractColorSystem";
import {ColorSystemProperty} from "./ColorSystemProperty";
import {hsl_to_rgb, rgb_to_hsl} from "./color_conversion";
import {HSLVisualization} from "../visualizations/HSLVisualization";

export class HSLColorSystem extends AbstractColorSystem {
    constructor() {
        super();
        // nothing to do
    }

    get_name() {
        return "HSL";
    }

    get_visualization_class_name() {
        return "HSLVisualization";
    }

    create_associated_visualization($container, options) {
        return new HSLVisualization($container, options);
    }

    create_color_system_properties() {
        super.create_color_system_properties();
        let properties = [];
        properties.push(new ColorSystemProperty(1, 0, 1, "H", "h"));
        properties.push(new ColorSystemProperty(1, 0, 1, "S", "s"));
        properties.push(new ColorSystemProperty(1, 0, 1, "L", "l"));
        return properties;
    }

    get_rgb() {
        return hsl_to_rgb(
            this.properties[0].value,
            this.properties[1].value,
            this.properties[2].value
        );
    }

    set_from_rgb(r, g, b) {
        let hsl = rgb_to_hsl(r, g, b);
        this.properties[0].set_value(hsl.h);
        this.properties[1].set_value(hsl.s);
        this.properties[2].set_value(hsl.l);
    }
}
