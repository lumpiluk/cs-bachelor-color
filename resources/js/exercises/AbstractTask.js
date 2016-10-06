export class AbstractTask {
    constructor(exercise, task_num) {
        this.exercise = exercise;
        this.$container = exercise.$container;
        this.task_num = task_num;

        this.stats = {
            correct: false,
            attempts: 0, // 0 => unanswered
            skipped: true
        };
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
