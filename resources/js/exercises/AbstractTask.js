export class AbstractTask {
    constructor(exercise) {
        this.exercise = exercise;
        this.$container = exercise.$container;
    }

    /**
     * Replaces the contents of this.$container with the task,
     * including all required controls.
     * @returns {boolean}
     */
    run() {
        this.$container.empty();
        // TODO: Add button bar?
    }
}
