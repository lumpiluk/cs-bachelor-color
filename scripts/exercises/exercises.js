import {show_color_matching_options} from "./ColorMatchingTask";
import {show_conlor_selection_options} from "./ColorSelectionTask";
import {show_conversion_selection_options} from "./ColorConversionSelectionTask";
import {show_color_conversion_options} from "./ColorMatchingTask";
import {
    ColorMatchingTask,
    DEFAULT_COLOR_MATCHING_OPTIONS,
    DEFAULT_COLOR_CONVERSION_OPTIONS
} from "./ColorMatchingTask";
import {
    ColorSelectionTask,
    DEFAULT_COLOR_SELECTION_OPTIONS
} from "./ColorSelectionTask";
import {
    ColorConversionSelectionTask,
    DEFAULT_COLOR_CONVERSION_SELECTION_OPTIONS
} from "./ColorConversionSelectionTask";
import {deep_copy} from "../util";

export const TASK_TYPES_WITHOUT_MIXED = [
    "Color Matching", "Color Selection", "Color Conversion Selection", "Color Conversion"
];

// the same in upper camel case
export const TASK_TYPES_WITHOUT_MIXED_UCC = [
    "ColorMatching", "ColorSelection", "ColorConversionSelection", "ColorConversion"
];

/**
 *
 * @param name Task name in upper camel case or upper case words with spaces
 * @param task_type
 * @param default_task_type
 * @param $options_table
 * @param is_configurator
 */
export function show_task_specific_options_by_name(name, task_type, default_task_type, $options_table,
                                                   is_configurator) {
    name = name.replace(/ /g, "").toLowerCase();
    switch(name) {
        case "colormatching":
            show_color_matching_options(task_type, default_task_type, $options_table, is_configurator);
            break;
        case "colorselection":
            show_conlor_selection_options(task_type, default_task_type, $options_table, is_configurator);
            break;
        case "colorconversionselection":
            show_conversion_selection_options(task_type, default_task_type, $options_table, is_configurator);
            break;
        case "colorconversion":
            show_color_conversion_options(task_type, default_task_type, $options_table, is_configurator);
            break;
    }
}

/**
 * Will create a task type with the proper name and default options by the given name.
 * @param name Name of the task (will be converted to lower case w/o spaces)
 */
export function construct_task_type_by_name(name) {
    name = name.replace(/ /g, "").toLowerCase();
    let new_task_type = {
        "name": name,
        "weight": 1
    };
    switch(name) {
        case "colormatching":
            new_task_type.options = deep_copy(DEFAULT_COLOR_MATCHING_OPTIONS);
            break;
        case "colorselection":
            new_task_type.options = deep_copy(DEFAULT_COLOR_SELECTION_OPTIONS);
            break;
        case "colorconversionselection":
            new_task_type.options = deep_copy(DEFAULT_COLOR_CONVERSION_SELECTION_OPTIONS);
            break;
        case "colorconversion":
            new_task_type.options = deep_copy(DEFAULT_COLOR_CONVERSION_OPTIONS);
    }
    return new_task_type;
}

export function construct_task_from_task_type(task_type, exercise, task_num) {
    let name = task_type.name.replace(/ /g, "").toLowerCase();
    switch(name) {
        case "colormatching":
            return new ColorMatchingTask(exercise, task_num, task_type.options);
        case "colorselection":
            return new ColorSelectionTask(exercise, task_num, task_type.options);
        case "colorconversionselection":
            return new ColorConversionSelectionTask(exercise, task_num, task_type.options);
        case "colorconversion":
            /* ColorMatchingTask handles this case as well. */
            return new ColorMatchingTask(exercise, task_num, task_type.options);
        default:
            return null;
    }
}
