import {ColorMatchingTask} from "./ColorMatchingTask";
/**
 * Creates an exercise in a given container.
 * On creation, the container's parameters are searched for the following data-attributes:
 *   - data-num-rounds: The number of rounds until a summary of results is shown.
 *   - data-task-types: A list of possible tasks for this exercise in the following JSON format:
 *     '[{"name":"task1","options":{<task-specific options>,"weight":.5}},{"name":"task2","options":{},"weight":1}]'.
 */
export class Exercise {
    /**
     * @param $container
     * @param options Options corresponding to the possible HTML data arguments.
     * See read_options_from_container: options object contains num_rounds and task_types.
     * This constructor argument takes precedence over the HTML attributes, which in turn take
     * precedence over the default values.
     */
    constructor($container, options) {
        this.$container = $container;
        let defaults = {
            task_types: [], // length 0 => let the user choose. Every task can be for different color systems.
            num_rounds: 10
        };
        let container_options = this.read_options_from_container();
        /*
         * Use options and set defaults where necessary.
         * See http://stackoverflow.com/questions/9602449/a-javascript-design-pattern-for-options-with-default-values.
         */
        let actual = $.extend({}, defaults, container_options || {}, options || {});
        this.num_rounds = actual.num_rounds;
        this.task_types = actual.task_types;
        /**
         * Weights can be specified in the data-taskTypes attribute in HTML.
         * For example, if one task is listed in three different variants (or for three different color systems)
         * which should have the same probability of appearing as another task, its weight should be set to 3.
         * @type {Array}
         */
        this.task_weights = [];
        for (let i = 0; i < this.task_types.length; i++) { // (for ... of not working in this case...)
            let element = this.task_types[i];
            this.task_weights.push(element.weight);
        }
        this.task_weights_sum = this.task_weights.reduce((pv, cv) => pv+cv, 0);

        this._remaining_tasks = []; // (Underscore to prevent WebStorm warning about "not exported" element.)
        this.current_task = null;
        this.initialize_tasks();
        this.next_task();
    }

    read_options_from_container() {
        let options = {};
        let $c = this.$container;
        let num_rounds = $c.data("num-rounds");
        if (!isNaN(num_rounds))
            options.num_rounds = num_rounds;
        if ($c.data("task-types") != undefined )
            options.task_types = $c.data("task-types"); // JSON.parse() not necessary thanks to JQuery!
        console.log(options.task_types);
        return options;
    }

    get_random_task_type() {
        let r = Math.random();
        let sum = 0;
        for (let i = 0; i < this.task_types.length; i++) { // (for ... of not working in this case...)
            let element = this.task_types[i];
            if (sum <= r && r < sum + element.weight / this.task_weights_sum) {
                return element;
            }
            sum += element.weight / this.task_weights_sum;
        }
        console.log("WARNING: Could not get a random task!");
        return null; // Should never happen.
    }

    initialize_tasks() {
        this._remaining_tasks = [];
        for (let i = 0; i < this.num_rounds; i++) {
            let new_task = null;
            let new_task_type = this.get_random_task_type();
            switch(new_task_type.name) {
                case "ColorMatching":
                    new_task = new ColorMatchingTask(this, new_task_type.options);
                    break;
                case "ColorSelection":

                    break;
                case "ColorConversion":

                    break;
                case "RGBModification": // TODO: Combine with other types?

                    break;
                // TODO: Other task types!
                default:
                    this.$container.append(
                        '<p style="color:red;">' +
                            'Exercise initialization error: Task "' + new_task_type.name +
                            '" does not exist.' +
                        '</p>'
                    );
            }
            this._remaining_tasks.push(new_task);
        }
    }

    next_task() {
        if (this._remaining_tasks.length == 0) {
            this.current_task = null;
            this.show_results();
            return;
        }
        this.current_task = this._remaining_tasks.pop();
        this.current_task.run();
    }

    on_task_finished(task) {
        this.next_task();
    }

    show_results() {
        // TODO
    }
}
