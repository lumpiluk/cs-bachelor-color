class SelectChangeEvent {
    constructor(option, index, original_event) {
        this.option = option;
        this.option_index = index;
        this.original_event = original_event;
    }
}

export class VisualizationControlSelect {
    constructor($parent, options, label) {
        this.change_listeners = [];
        this.$parent = $parent;
        this._options = options;
        this.control_id = Math.floor(Math.random() * 1e+15).toString();
        this.select_id = "vis-ctrl-" + this.control_id + "-select";
        this.label = label;

        this._indeces_for_texts = {}; // needed for set_selected_text()
        let options_html = '';
        for (let i = 0; i < options.length; i++) {
            this._indeces_for_texts[options[i].toString()] = i.toString();
            options_html += '<option value="' + i.toString() + '">' + options[i].toString() + '</option>';
        }

        this.$select = $(
            '<div class="visualization-control select">' +
                (this.label != null ? '<label for="' + this.select_id + '">' + this.label + ':</label>' : '') +
                '<span class="select-container">' +
                    '<select name="' + this.select_id + '" id="' + this.select_id + '">' +
                        options_html +
                    '</select>' +
                '</span>' +
            '</div>'
        ).appendTo(this.$parent).find("select");

        /* Attach event listener. */
        let that = this;
        this.$select.on("change", (event) => that._on_change.call(that, event));
    }

    set_selected_text(value) {
        this.$select.val(this._indeces_for_texts[value]).change();
    }

    set_selected_index(index) {
        this.$select.val(0);
    }

    get_selected_text() {
        return this.$select.find(":selected").text();
    }

    add_listener(callback) {
        this.change_listeners.push(callback);
    }

    _on_change(event) {
        let option_index = this.$select.val();
        let e = new SelectChangeEvent(this._options[option_index], option_index, event);
        for (let callback of this.change_listeners) {
            callback(e);
        }
    }
}
