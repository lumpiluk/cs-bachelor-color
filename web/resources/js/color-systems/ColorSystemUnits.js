/**
 * Created by lumpiluk on 12/30/16.
 */

export class ColorSystemUnits {

    constructor(unit_scales, unit_symbols, name) {
        this.unit_scales = unit_scales;
        this.unit_symbols = unit_symbols;
        this.name = name;
    }

    toString() {
        return this.name;
    }

}

/*
 * 4 channels should work for all implemented color systems (including CMYK).
 */
export const DEFAULT_COLOR_SYSTEM_UNITS = new ColorSystemUnits([1, 1, 1, 1], ["", "", "", ""], "[0, 1]");

export const UNITS_BYTES = new ColorSystemUnits([255, 255, 255, 255], ["", "", "", ""], "0..255");

export const UNITS_PERCENT = new ColorSystemUnits([100, 100, 100, 100], ["%", "%", "%", "%"], "Percent");

export const UNITS_DEG_UNIT_UNIT = new ColorSystemUnits([360, 1, 1], ["°", "", ""], "Degrees, [0, 1], [0, 1]");

export const UNITS_DEG_B_B = new ColorSystemUnits([360, 255, 255], ["°", "", ""], "Degrees, 0..255, 0..255");

export const UNITS_DEG_PERCENT_PERCENT = new ColorSystemUnits([360, 100, 100], ["°", "%", "%"],
    "Degrees, Percent, Percent");

export const UNITS_RAD_UNIT_UNIT = new ColorSystemUnits([2 * Math.PI, 1, 1], [" rad", "", ""],
    "Radians, [0, 1], [0, 1]");

export const UNITS_RAD_B_B = new ColorSystemUnits([2 * Math.PI, 255, 255], [" rad", "", ""],
    "Radians, 0..255, 0..255");

export const UNITS_RAD_PERCENT_PERCENT = new ColorSystemUnits([2 * Math.PI, 100, 100], [" rad", "%", "%"],
    "Radians, Percent, Percent");


export const UNITS_OPTIONS_HSL_HSV = [
    UNITS_DEG_UNIT_UNIT,
    UNITS_DEG_B_B,
    UNITS_DEG_PERCENT_PERCENT,
    UNITS_RAD_UNIT_UNIT,
    UNITS_RAD_B_B,
    UNITS_RAD_PERCENT_PERCENT,
    DEFAULT_COLOR_SYSTEM_UNITS,
    UNITS_BYTES,
    UNITS_PERCENT
];

export const UNITS_OPTIONS_DEFAULT = [
    DEFAULT_COLOR_SYSTEM_UNITS,
    UNITS_BYTES,
    UNITS_PERCENT
];
