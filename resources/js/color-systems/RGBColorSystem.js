import {AbstractColorSystem} from "./AbstractColorSystem";
import {ColorSystemProperty} from "./ColorSystemProperty";
import {RGBCubeVisualization} from "../visualizations/RGBCubeVisualization";

export class RGBColorSystem extends AbstractColorSystem {
    constructor() {
        super();
        // nothing to do
    }

    get_name() {
        return "RGB";
    }

    get_visualization_class_name() {
        return "RGBCubeVisualization";
    }

    get_visualization_css_class() {
        return "rgb-cube";
    }

    create_color_system_properties() {
        super.create_color_system_properties();
        let properties = [];
        properties.push(new ColorSystemProperty(1, 0, 1, "R", "r"));
        properties.push(new ColorSystemProperty(1, 0, 1, "G", "g"));
        properties.push(new ColorSystemProperty(1, 0, 1, "B", "b"));
        return properties;
    }

    get_rgb() {
        return {
            r: this.properties[0].value,
            g: this.properties[1].value,
            b: this.properties[2].value
        }
    }

    set_from_rgb(r, g, b, update_sliders, instigating_color_system) {
        this.properties[0].set_value(r, update_sliders, instigating_color_system);
        this.properties[1].set_value(g, update_sliders, instigating_color_system);
        this.properties[2].set_value(b, update_sliders, instigating_color_system);
    }
}
