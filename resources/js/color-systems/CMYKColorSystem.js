import {AbstractColorSystem} from "./AbstractColorSystem";
import {ColorSystemProperty} from "./ColorSystemProperty";

class CMYKColorSystem extends AbstractColorSystem {
    constructor() {
        super();
        // nothing to do
    }

    create_associated_visualization($container, options) {
        super.create_associated_visualization();
        return null;
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
}

export const CMYK_COLOR_SYSTEM = new CMYKColorSystem();
