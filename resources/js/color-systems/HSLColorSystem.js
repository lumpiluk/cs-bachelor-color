import {AbstractColorSystem} from "./AbstractColorSystem";
import {ColorSystemProperty} from "./ColorSystemProperty";
import {HSLVisualization} from "../visualizations/HSLVisualization";

class HSLColorSystem extends AbstractColorSystem {
    constructor() {
        super();
        // nothing to do
    }

    create_associated_visualization($container, options) {
        super.create_associated_visualization();
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
}

export const HSL_COLOR_SYSTEM = new HSLColorSystem();
