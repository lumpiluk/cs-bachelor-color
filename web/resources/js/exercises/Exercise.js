import {VisualizationControlSelect} from "../controls/VisualizationControlSelect";
import {
    TASK_TYPES_WITHOUT_MIXED,
    show_task_specific_options_by_name,
    construct_task_from_task_type
} from "./exercises";
import {construct_task_type_by_name} from "./exercises";
import {deep_copy} from "../util";
import {saveAs} from "../../../node_modules/file-saver/FileSaver";

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
            show_options_on_startup: true,
            advanced_config: false // If true, will show advanced exercise configurator for presentations.
        };
        let container_options = this.read_options_from_container();
        /*
         * Use options and set defaults where necessary.
         * See http://stackoverflow.com/questions/9602449/a-javascript-design-pattern-for-options-with-default-values.
         */
        let actual = $.extend({}, defaults, container_options || {}, options || {});
        this.num_rounds = actual.num_rounds;
        this.post_to = actual.post_to;

        /*
         * In regular exercise mode, this array will store names and options of possible tasks in this exericse.
         * If this exercise uses the advanced configurator for presentations,
         * this array will serve as a list of all tasks in the exercise.
         */
        this.task_types = actual.task_types;

        this.allow_random_units = actual.allow_random_units;
        this.random_units = actual.random_units;
        this.advanced_config = actual.advanced_config;

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

        if (actual.show_options_on_startup || this.advanced_config) {
            this.show_options(deep_copy(actual));
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
        if ($c.data("show-options-on-startup") != null)
            options.show_options_on_startup = $c.data("show-options-on-startup");
        if ($c.data("advanced-config") != null)
            options.advanced_config = $c.data("advanced-config");
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
        this._remaining_tasks = []; // needs to be cleared here for reset to work with configurator
        this.$container.empty();
        this.$container.append((this.advanced_config ?
            '<h2>Exercise Configuration</h2>' : '<h2>Exercise Options</h2>'));
        let $options_table = $(
            '<table class="options-table"></table>'
        ).appendTo(this.$container);

        /* Button bar, reset button, and start button: */
        let $button_bar = $(
            '<div class="exercise-button-bar"></div>'
        ).appendTo(this.$container);
        let $start_button = $(
            '<button>Start exercise</button>'
        ).appendTo($button_bar); // (Buttons will appear right to left.)
        let $reset_button = $(
            (this.advanced_config ? '<button>Clear</button>' : '<button>Reset to defaults</button>')
        ).appendTo($button_bar);

        $start_button.click(() => {
            this.initialize_tasks();
            this.next_task();
        });
        $reset_button.click(() => {
            if (this.advanced_config && !confirm("Your current exercise configuration will be cleared!")) {
                return;
            }
            this.show_options(defaults); // Will replace current options menu.
        });

        if (!this.advanced_config) {
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
                                (defaults.random_units ?
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
                show_task_specific_options_by_name(
                    defaults.task_types[i].name,
                    this.task_types[i], defaults.task_types[i], $options_table
                )
            }
        } else { // if this.advanced_config
            /* Initialize advanced exercise configurator for presentations: */
            let $advanced_config_toolbar = $(
                '<div class="exercise-button-bar left-to-right"></div>'
            ).insertBefore($options_table);
            let $save_config_btn = $(
                '<button>Save to file...</button>'
            ).appendTo($advanced_config_toolbar);
            $save_config_btn.on("click", () => {
                console.log(this.task_types);
                let blob = new Blob([JSON.stringify(this.task_types)], {type: "text/plain;charset=utf-8"});
                saveAs(blob, "color-exercise.json");
            });

            // Loading configuration from file:
            let $load_config_btn = $(
                '<button>Load from file...</button>'
            ).appendTo($advanced_config_toolbar);
            let $load_config_file_input = $(
                '<input type="file" accept="text/*" style="display: none;"/>'
            ); // This element will be hidden because it's ugly. Functionality will be called w/ the other button.
            // continued below

            // Adding a task:
            let $task_add_controls = $(
                '<table class="add-task-controls"><tr></tr></table>'
            ).insertAfter($options_table).find("tr");
            let task_to_add_type_select = new VisualizationControlSelect(
                $('<td class="expand"></td>').appendTo($task_add_controls),
                TASK_TYPES_WITHOUT_MIXED,
                null // no label necessary
            );
            let $task_add_button = $(
                '<td class="shrink"><button>Add task</button></td>'
            ).appendTo($task_add_controls);
            let add_configuration_elements = (new_task_type, index) => {
                let $sub_table = $(
                    '<tbody class="sub-table"></tbody>' +
                    '<tr class="separator"></tr>'
                ).appendTo($options_table).closest(".sub-table");
                $sub_table.append(
                    '<tr><td colspan="2" class="exercise-configurator-task-item-header">' +
                        (index + 1).toString() + '. ' +
                        task_to_add_type_select.get_selected_text() +
                    '</td></tr>'
                );
                show_task_specific_options_by_name(
                    new_task_type.name,
                    new_task_type,
                    new_task_type, // no need for a different default in this case (reset to global default anyway)
                    $sub_table,
                    true // is_configurator => make this function show sliders to pre-configure colors
                );
                $sub_table.append(
                    '<tr><td colspan="2" class="exercise-configurator-task-item-footer"></td></tr>'
                );
            };
            $task_add_button.on("click", () => {
                let new_task_type = construct_task_type_by_name(task_to_add_type_select.get_selected_text());
                this.task_types.unshift(new_task_type); // unshift: add to beginning of array (for fifo order)
                add_configuration_elements(new_task_type, this.task_types.length - 1);
            });

            // Loading configuration from file (continued):
            $load_config_btn.on("click", () => {
                /*if (this.task_types.length > 0 && !confirm("Your current exercise configuration will be cleared!")) {
                    return;
                }
                this.task_types = [];
                $options_table.empty();*/

                $load_config_file_input[0].click();
            });
            $load_config_file_input.on("change", () => {
                // console.log($load_config_file_input[0].files[0]);
                let f = $load_config_file_input[0].files[0];
                if (!f) {
                    alert("Failed to load file.");
                    return;
                }
                let file_reader = new FileReader();
                file_reader.onload = (e) => {
                    this.task_types = JSON.parse(e.target.result);
                    console.log("Loaded " + this.task_types.length.toString() + " tasks");
                    for (let i = 0; i < this.task_types.length; i++) {
                        add_configuration_elements(this.task_types[i], i);
                    }
                };
                file_reader.readAsText($load_config_file_input[0].files[0]);
            });
        }
    }

    initialize_tasks() {
        this._remaining_tasks = [];
        if (this.advanced_config) {
            this.num_rounds = this.task_types.length; // see comment on this.task_types
        }
        for (let i = 0; i < this.num_rounds; i++) {
            let new_task_type = this.advanced_config ? this.task_types[i] : this.get_random_task_type();
            new_task_type.options.random_units = this.random_units; // default or random color system units?
            let new_task = construct_task_from_task_type(new_task_type, this, this.num_rounds - i);
            if (new_task == null) {
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
