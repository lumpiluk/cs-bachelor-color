import {AbstractColorSystem} from "./AbstractColorSystem";
import {ColorSystemProperty} from "./ColorSystemProperty";
import {CMYCubeVisualization} from "../visualizations/CMYCubeVisualization";

class CMYColorSystem extends AbstractColorSystem {
    constructor() {
        super();
        // nothing to do
    }

    create_associated_visualization($container, options) {
        super.create_associated_visualization();
        return new CMYCubeVisualization($container, options);
    }

    create_color_system_properties() {
        super.create_color_system_properties();
        let properties = [];
        properties.push(new ColorSystemProperty(1, 0, 1, "C", "c"));
        properties.push(new ColorSystemProperty(1, 0, 1, "M", "m"));
        properties.push(new ColorSystemProperty(1, 0, 1, "Y", "y"));
        return properties;
    }
}

export const CMY_COLOR_SYSTEM = new CMYColorSystem();
