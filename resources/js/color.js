/*
 * This is the main script.
 */

import {initialize_visualizations} from "./visualizations";
import {initialize_exercises} from "./exercises";


$(document).ready(function() {
    initialize_visualizations();
    initialize_exercises();
});
