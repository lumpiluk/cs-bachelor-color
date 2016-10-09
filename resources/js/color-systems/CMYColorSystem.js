import {AbstractColorSystem} from "./AbstractColorSystem";
import {ColorSystemProperty} from "./ColorSystemProperty";
import {cmy_to_rgb, rgb_to_cmy} from "./color_conversion";
import {CMYCubeVisualization} from "../visualizations/CMYCubeVisualization";


export class CMYColorSystem extends AbstractColorSystem {
    constructor() {
        super();
    }

    get_name() {
        return "CMY";
    }

    get_visualization_class_name() {
        return "CMYCubeVisualization";
    }

    get_visualization_css_class() {
        return "cmy-cube";
    }

    create_color_system_properties() {
        super.create_color_system_properties();
        let properties = [];
        properties.push(new ColorSystemProperty(1, 0, 1, "C", "c"));
        properties.push(new ColorSystemProperty(1, 0, 1, "M", "m"));
        properties.push(new ColorSystemProperty(1, 0, 1, "Y", "y"));
        return properties;
    }

    get_rgb() {
        return cmy_to_rgb(
            this.properties[0].value,
            this.properties[1].value,
            this.properties[2].value
        );
    }

    set_from_rgb(r, g, b, update_sliders, instigating_color_system) {
        let cmy = rgb_to_cmy(r, g, b);
        this.properties[0].set_value(cmy.c, update_sliders, instigating_color_system);
        this.properties[1].set_value(cmy.m, update_sliders, instigating_color_system);
        this.properties[2].set_value(cmy.y, update_sliders, instigating_color_system);
    }
}
