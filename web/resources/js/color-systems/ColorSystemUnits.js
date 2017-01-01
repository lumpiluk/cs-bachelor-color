/**
 * Created by lumpiluk on 12/30/16.
 */

export class ColorSystemUnits {

    constructor(unit_scales, step_sizes, unit_symbols, name) {
        this.unit_scales = unit_scales;
        this.step_sizes = step_sizes;
        this.unit_symbols = unit_symbols;
        this.name = name;
    }

    toString() {
        return this.name;
    }

    get_transformed(value, index) {
        return value * this.unit_scales[index];
    }

    get_inverse_transformed(value, index) {
        return value / this.unit_scales[index];
    }

}

class DefaultColorSystemUnits extends ColorSystemUnits {
    /* 4 channels should work for all implemented color systems (including CMYK). */
    constructor() { super([1, 1, 1, 1], [.01, .01, .01, .01], ["", "", "", ""], "[0, 1]"); }
    get_transformed(value, index) {
        return super.get_transformed(value, index).toFixed(2);
    }
}
export const DEFAULT_COLOR_SYSTEM_UNITS = new DefaultColorSystemUnits();

class UnitsBytes extends ColorSystemUnits {
    constructor() { super([255, 255, 255, 255], [1, 1, 1, 1], ["", "", "", ""], "0..255"); }
    get_transformed(value, index) {
        return Math.round(super.get_transformed(value, index));
    }
    // use get_inverse_transformed from superclass
}
export const UNITS_BYTES = new UnitsBytes();

class UnitsPercent extends ColorSystemUnits {
    constructor() { super([100, 100, 100, 100], [1, 1, 1, 1], ["%", "%", "%", "%"], "Percent"); }
    get_transformed(value, index) {
        return super.get_transformed(value, index).toFixed(2);
    }
    // use get_inverse_transformed from superclass
}
export const UNITS_PERCENT = new UnitsPercent();

class UnitsDegUnitUnit extends ColorSystemUnits {
    constructor() { super([360, 1, 1], [1, .01, .01], ["°", "", ""], "Degrees, [0, 1], [0, 1]"); }
    get_transformed(value, index) {
        if (index == 0) {
            return Math.round(super.get_transformed(value, index));
        } else {
            return super.get_transformed(value, index).toFixed(2);
        }
    }
}
export const UNITS_DEG_UNIT_UNIT = new UnitsDegUnitUnit();

class UnitsDegBB extends ColorSystemUnits {
    constructor() { super([360, 255, 255], [1, 1, 1], ["°", "", ""], "Degrees, 0..255, 0..255"); }
    get_transformed(value, index) {
        return Math.round(super.get_transformed(value, index));
    }
}
export const UNITS_DEG_B_B = new UnitsDegBB();

class UnitsDegPercentPercent extends ColorSystemUnits {
    constructor() { super([360, 100, 100], [1, 1, 1], ["°", "%", "%"], "Degrees, Percent, Percent"); }
    get_transformed(value, index) {
        if (index == 0) {
            return Math.round(super.get_transformed(value, index));
        } else {
            return super.get_transformed(value, index).toFixed(2);
        }
    }
}
export const UNITS_DEG_PERCENT_PERCENT = new UnitsDegPercentPercent();

class UnitsRadUnitUnit extends ColorSystemUnits {
    constructor() { super([2 * Math.PI, 1, 1], [.01, .01, .01], [" rad", "", ""], "Radians, [0, 1], [0, 1]"); }
    get_transformed(value, index) {
        return super.get_transformed(value, index).toFixed(2);
    }
}
export const UNITS_RAD_UNIT_UNIT = new UnitsRadUnitUnit();

class UnitsRadBB extends ColorSystemUnits {
    constructor() { super([2 * Math.PI, 255, 255], [.01, 1, 1], [" rad", "", ""], "Radians, 0..255, 0..255"); }
    get_transformed(value, index) {
        if (index == 0) {
            return super.get_transformed(value, index).toFixed(2);
        } else {
            return Math.round(super.get_transformed(value, index));
        }
    }
}
export const UNITS_RAD_B_B = new UnitsRadBB();

class UnitsRadPercentPercent extends ColorSystemUnits {
    constructor() { super([2 * Math.PI, 100, 100], [.01, 1, 1], [" rad", "%", "%"], "Radians, Percent, Percent"); }
    get_transformed(value, index) {
        return super.get_transformed(value, index).toFixed(2);
    }
}
export const UNITS_RAD_PERCENT_PERCENT = new UnitsRadPercentPercent();


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
