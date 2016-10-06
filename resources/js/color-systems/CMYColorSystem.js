import {AbstractColorSystem} from "./AbstractColorSystem";
import {ColorSystemProperty} from "./ColorSystemProperty";
import {cmy_to_rgb} from "../color_conversion";
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

    create_associated_visualization($container, options) {
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

    get_rgb() {
        return cmy_to_rgb(
            this.properties[0].value,
            this.properties[1].value,
            this.properties[2].value
        );
    }
}
