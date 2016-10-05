import {AbstractColorSystem} from "./AbstractColorSystem";
import {RGBCubeVisualization} from "../visualizations/RGBCubeVisualization";
import {ColorSystemProperty} from "./ColorSystemProperty";

class RGBColorSystem extends AbstractColorSystem {
    constructor() {
        super();
        // nothing to do
    }

    create_associated_visualization($container, options) {
        super.create_associated_visualization();
        return new RGBCubeVisualization($container, options);
    }

    create_color_system_properties() {
        super.create_color_system_properties();
        let properties = [];
        properties.push(new ColorSystemProperty(1, 0, 1, "R", "r"));
        properties.push(new ColorSystemProperty(1, 0, 1, "G", "g"));
        properties.push(new ColorSystemProperty(1, 0, 1, "B", "b"));
        return properties;
    }
}

export const RGB_COLOR_SYSTEM = new RGBColorSystem();
