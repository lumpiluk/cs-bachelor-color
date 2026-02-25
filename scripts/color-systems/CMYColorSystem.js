import {AbstractColorSystem} from "./AbstractColorSystem";
import {ColorSystemProperty} from "./ColorSystemProperty";
import {cmy_to_rgb, rgb_to_cmy} from "./color_conversion";
import {CMYCubeVisualization} from "../visualizations/CMYCubeVisualization";


export class CMYColorSystem extends AbstractColorSystem {
    constructor(color_system_units=null) {
        super(color_system_units);
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

    create_color_system_properties(color_system_units) {
        super.create_color_system_properties();
        let properties = [];
        let u = color_system_units;
        properties.push(new ColorSystemProperty(1, 0, 1, "C", "c", u, 0));
        properties.push(new ColorSystemProperty(1, 0, 1, "M", "m", u, 1));
        properties.push(new ColorSystemProperty(1, 0, 1, "Y", "y", u, 2));
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

    /* (override) */
    randomize(easy) {
        if (easy == null || !easy) {
            super.randomize(easy);
            return;
        }
        // let r = Math.random();
        // if (r < 1 / 2) {
            /* Choose one of the cube's vertices. */
            for (let i = 0; i < this.properties.length; i++) {
                this.properties[i].set_value(Math.random() < .5 ? 0 : 1);
            }
        // } else {
        //     /* Choose a shade of grey. */
        //     let v = Math.random();
        //     for (let i = 0; i < this.properties.length; i++) {
        //         this.properties[i].set_value(v);
        //     }
        // }
    }
}
