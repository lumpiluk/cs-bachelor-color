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
        case "hsl": return new HSLColorSystem();
        case "hsv": return new HSVColorSystem();
    }
    return null;
}
