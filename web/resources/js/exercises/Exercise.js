import {ColorMatchingTask} from "./ColorMatchingTask";
import {ColorSelectionTask} from "./ColorSelectionTask";
import {ColorConversionSelectionTask} from "./ColorConversionSelectionTask";
import {
    show_color_matching_options,
    show_color_conversion_options
} from "./ColorMatchingTask";
import {show_conlor_selection_options} from "./ColorSelectionTask";
import {show_conversion_selection_options} from "./ColorConversionSelectionTask";

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
            num_rounds: 10,
            post_to: null, // URL to which to post results on completion.
            allow_random_units: false, // Whether or not to show the option (provided show_options_on_startup is true).
            random_units: false, // If true, color system units will be chosen at random instead of using the default.
            show_options_on_startup: true
        };
        let container_options = this.read_options_from_container();
        /*
         * Use options and set defaults where necessary.
         * See http://stackoverflow.com/questions/9602449/a-javascript-design-pattern-for-options-with-default-values.
         */
        let actual = $.extend({}, defaults, container_options || {}, options || {});
        this.num_rounds = actual.num_rounds;
        this.post_to = actual.post_to;
        this.task_types = actual.task_types;
        this.allow_random_units = actual.allow_random_units;
        this.random_units = actual.random_units;

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

        /* Stats. */
        this.num_correct_answers = 0;
        this.num_skipped = 0;
        this.num_attempts = 0;

        this._remaining_tasks = []; // (Underscore to prevent WebStorm warning about "not exported" element.)
        this.current_task = null;

        if (actual.show_options_on_startup) {
            this.show_options($.extend(true, {}, actual)); // pass deep copy of actual as defaults
        } else {
            /* Start immediately. */
            this.initialize_tasks();
            this.next_task();
        }
    }

    read_options_from_container() {
        let options = {};
        let $c = this.$container;
        let num_rounds = $c.data("num-rounds");
        if (!isNaN(num_rounds))
            options.num_rounds = num_rounds;
        if ($c.data("task-types") != null)
            options.task_types = $c.data("task-types"); // JSON.parse() not necessary thanks to JQuery!
        if ($c.data("post-to") != null)
            options.post_to = $c.data("post-to");
        if ($c.data("allow-random-units") != null)
            options.allow_random_units = $c.data("allow-random-units");
        if ($c.data("random-units") != null)
            options.random_units = $c.data("random-units");
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

    show_options(defaults) {
        this.$container.empty();
        this.$container.append('<h2>Exercise Options</h2>');
        let $options_table = $(
            '<table class="options-table"></table>'
        ).appendTo(this.$container);
        let $button_bar = $(
            '<div class="exercise-button-bar"></div>'
        ).appendTo(this.$container);
        let $start_button = $(
            '<button>Start exercise</button>'
        ).appendTo($button_bar); // (Buttons will appear right to left.)
        let $reset_button = $(
            '<button>Reset to defaults</button>'
        ).appendTo($button_bar);

        $start_button.click(() => {
            this.initialize_tasks();
            this.next_task();
        });
        $reset_button.click(() => {
            this.show_options(defaults); // Will replace current options menu.
        });

        /* General exercise options: */

        // Number of rounds
        let $num_rounds_input = $(
            '<tr>' +
                '<td class="shrink">Number of rounds:</td>' +
                '<td class="expand">' +
                    '<input type="number" min="3" max="100" step="1" value="' +
                        defaults.num_rounds.toString() +
                    '" />' +
                '</td>' +
            '</tr>'
        ).appendTo($options_table).find('input');
        $num_rounds_input.on("change", (event) => this.num_rounds = parseInt(event.target.value));
        this.num_rounds = defaults.num_rounds; // necessary for reset

        if (this.allow_random_units) {
            // Default or random units
            let $random_units_input = $(
                '<tr>' +
                    '<td class="shrink">Random units:</td>' +
                    '<td class="expand">' +
                        '<input type="checkbox" name="Show visualizations" value="Show" ' +
                            (this.random_units ?
                                'checked' : '') +
                        ' />' +
                    '</td>' +
                '</tr>' +
                '<tr>' +
                    '<td colspan="2" class="option-explanation">' +
                        'If checked, random units will be used instead of default units only.' +
                    '</td>' +
                '</tr>'
            ).appendTo($options_table).find('input');
            $random_units_input.change((event) => this.random_units = $random_units_input[0].checked);
            this.random_units = defaults.random_units; // necessary for reset
        }

        /* Task-specific options: */
        for (let i = 0; i < defaults.task_types.length; i++) {
            switch(defaults.task_types[i].name) {
                case "ColorMatching":
                    show_color_matching_options(this.task_types[i], defaults.task_types[i], $options_table);
                    break;
                case "ColorSelection":
                    show_conlor_selection_options(this.task_types[i], defaults.task_types[i], $options_table);
                    break;
                case "ColorConversionSelection":
                    show_conversion_selection_options(this.task_types[i], defaults.task_types[i], $options_table);
                    break;
                case "ColorConversion":
                    show_color_conversion_options(this.task_types[i], defaults.task_types[i], $options_table);
                    break;
                // TODO: If you create a new task type, include it here!
            }
        }
    }

    initialize_tasks() {
        this._remaining_tasks = [];
        for (let i = 0; i < this.num_rounds; i++) {
            let new_task = null;
            let new_task_type = this.get_random_task_type();
            new_task_type.options.random_units = this.random_units; // default or random color system units?
            switch(new_task_type.name) {
                case "ColorMatching":
                    new_task = new ColorMatchingTask(this, this.num_rounds - i, new_task_type.options);
                    break;
                case "ColorSelection":
                    new_task = new ColorSelectionTask(this, this.num_rounds - i, new_task_type.options);
                    break;
                case "ColorConversionSelection":
                    new_task = new ColorConversionSelectionTask(this, this.num_rounds - i, new_task_type.options);
                    break;
                case "ColorConversion":
                    /* ColorMatchingTask handles this case as well. */
                    new_task = new ColorMatchingTask(this, this.num_rounds - i, new_task_type.options);
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
            this.on_exercise_end();
            return;
        }
        this.current_task = this._remaining_tasks.pop();
        this.current_task.run();
    }

    on_task_finished(task) {
        this.num_correct_answers += task.stats.correct ? 1 : 0;
        this.num_attempts += task.stats.attempts;
        this.num_skipped += task.stats.skipped ? 1 : 0;
        this.next_task();
    }

    on_exercise_end() {
        let avg_attempts = this.num_attempts / this.num_correct_answers;
        this.current_task = null;
        let that = this;

        this.show_results();

        if (this.post_to != null) {
            $.post(this.post_to,
                {
                    avg_attempts: avg_attempts,
                    num_correct_answers: this.num_correct_answers,
                    num_skipped: this.num_skipped,
                    num_rounds: this.num_rounds
                },
                function(data, status) {
                    // on post response
                    if (status == "success") {
                        that.$container.find(".post-result").html(
                            data
                        );
                    } else {
                        that.$container.find(".post-result").html(
                            "Unable to reach the server. " + data
                        );
                    }
                }
            );
        }
    }

    show_results() {
        let avg_attempts = this.num_attempts / this.num_correct_answers;
        this.$container.empty();
        this.$container.append(
            '<h3>Exercise complete!</h3>' +
            '<table class="exercise-results">' +
                '<tr>' +
                    '<td>Correct answers:</td>' +
                    '<td>' + this.num_correct_answers + '/' + this.num_rounds + '</td>' +
                '</tr>' +
                '<tr>' +
                    '<td>Skipped tasks:</td>' +
                    '<td>' + this.num_skipped + '</td>' +
                '</tr>' +
                '<tr>' +
                    '<td>Average attempts per correct answer:</td>' +
                    '<td>' + avg_attempts.toFixed(3) + '</td>' +
                '</tr>' +
            '</table>' +
            '<div class="post-result"></div>'
        );
    }
}
