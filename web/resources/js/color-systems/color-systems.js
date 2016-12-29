import {RGBColorSystem} from "./RGBColorSystem";
import {CMYColorSystem} from "./CMYColorSystem";
import {CMYKColorSystem} from "./CMYKColorSystem";
import {HSLColorSystem} from "./HSLColorSystem";
import {HSVColorSystem} from "./HSVColorSystem";

export function get_color_system_by_name(color_system_name) {
    switch (color_system_name) {
        case "rgb": return new RGBColorSystem();
        case "cmy": return new CMYColorSystem();
        case "cmyk": return new CMYKColorSystem();
        case "hsl":
            let hsl_color = new HSLColorSystem();
            hsl_color.properties[0].set_unit_scale(360); // set hue to degrees by default
            return hsl_color;
        case "hsv":
            let hsv_color = new HSVColorSystem();
            hsv_color.properties[0].set_unit_scale(360); // set hue to degrees by default
            return hsv_color;
    }
    /*
    TODO: In exercises, when initializing sliders, also scale according to unit_scale!
     */
    return null;
}
