import {Exercise} from "./exercises/Exercise";

/**
 * Find and initialize all exercises.
 */
export function initialize_exercises() {
    let exercises = [];

    console.log("Initializing exercises.");
    $(".exercise").each(function() {
        let exercise = new Exercise($(this));
        exercises.push(exercise);
    });

    return exercises;
}
