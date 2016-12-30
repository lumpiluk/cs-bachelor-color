import {RGBColorSystem} from "./RGBColorSystem";
import {CMYColorSystem} from "./CMYColorSystem";
import {CMYKColorSystem} from "./CMYKColorSystem";
import {HSLColorSystem} from "./HSLColorSystem";
import {HSVColorSystem} from "./HSVColorSystem";
import {
    DEFAULT_COLOR_SYSTEM_UNITS,
    UNITS_DEG_UNIT_UNIT,
    UNITS_OPTIONS_HSL_HSV,
    UNITS_OPTIONS_DEFAULT
} from "./ColorSystemUnits";
import {random_sample} from "../util";



export function get_color_system_by_name(color_system_name, random_units=true) {
    switch (color_system_name) {
        case "rgb":
            let rgb_units = random_units ? random_sample(UNITS_OPTIONS_DEFAULT) : DEFAULT_COLOR_SYSTEM_UNITS;
            return new RGBColorSystem(rgb_units);
        case "cmy":
            let cmy_units = random_units ? random_sample(UNITS_OPTIONS_DEFAULT) : DEFAULT_COLOR_SYSTEM_UNITS;
            return new CMYColorSystem(cmy_units);
        case "cmyk":
            let cmyk_units = random_units ? random_sample(UNITS_OPTIONS_DEFAULT) : DEFAULT_COLOR_SYSTEM_UNITS;
            return new CMYKColorSystem(cmyk_units);
        case "hsl":
            let hsl_units = random_units ? random_sample(UNITS_OPTIONS_HSL_HSV) : UNITS_DEG_UNIT_UNIT;
            return new HSLColorSystem(hsl_units);
        case "hsv":
            let hsv_units = random_units ? random_sample(UNITS_OPTIONS_HSL_HSV) : UNITS_DEG_UNIT_UNIT;
            return new HSVColorSystem(hsv_units);
    }
    return null;
}
