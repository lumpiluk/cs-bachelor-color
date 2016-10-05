import {AbstractColorSystem} from "./AbstractColorSystem";
import {ColorSystemProperty} from "./ColorSystemProperty";
import {HSVVisualization} from "../visualizations/HSVVisualization";

class HSVColorSystem extends AbstractColorSystem {
    constructor() {
        super();
        // nothing to do
    }

    create_associated_visualization($container, options) {
        super.create_associated_visualization();
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
}

export const HSV_COLOR_SYSTEM = new HSVColorSystem();
