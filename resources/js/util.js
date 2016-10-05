import {RGB_COLOR_SYSTEM} from "./color-systems/RGBColorSystem";
import {CMY_COLOR_SYSTEM} from "./color-systems/CMYColorSystem";
import {CMYK_COLOR_SYSTEM} from "./color-systems/CMYKColorSystem";
import {HSL_COLOR_SYSTEM} from "./color-systems/HSLColorSystem";
import {HSV_COLOR_SYSTEM} from "./color-systems/HSVColorSystem";


export function lerp(a, b, alpha) {
    let m = b - a; // (e-s)/1
    return m * alpha + a;
}

export function random_sample(array) {
    return array[Math.floor(Math.random() * array.length)];
}

export function get_color_system_by_name(color_system_name) {
    switch (color_system_name) {
        case "rgb": return RGB_COLOR_SYSTEM;
        case "cmy": return CMY_COLOR_SYSTEM;
        case "cmyk": return CMYK_COLOR_SYSTEM;
        case "hsl": return HSL_COLOR_SYSTEM;
        case "hsv": return HSV_COLOR_SYSTEM;
    }
    return null;
}
