class SelectChangeEvent {
    constructor(option, original_event) {
        this.option = option;
        this.original_event = original_event;
    }
}

export class VisualizationControlSelect {
    constructor($parent, options, label) {
        this.change_listeners = [];
        this.$parent = $parent;
        this.control_id = Math.floor(Math.random() * 1e+15).toString();
        this.select_id = "vis-ctrl-" + this.control_id + "-select";
        this.label = label;

        let options_html = '';
        for (let option of options) {
            options_html += '<option value="' + option + '">' + option + '</option>';
        }

        this.$parent.append(
            '<div class="visualization-control select">' +
                '<label for="' + this.select_id + '">' + this.label + ':</label>' +
                '<select name="' + this.select_id + '" id="' + this.select_id + '">' +
                    options_html +
                '</select>' +
            '</div>'
        );

        /* Attach event listener. */
        let that = this;
        this.$select = this.$parent.find("#" + this.select_id);
        this.$select.on("change", (event) => that._on_change.call(that, event));
    }

    add_listener(callback) {
        this.change_listeners.push(callback);
    }

    _on_change(event) {
        let option = this.$select.val();
        for (let callback of this.change_listeners) {
            callback(new SelectChangeEvent(option, event));
        }
    }
}
