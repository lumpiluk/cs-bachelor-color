class CheckChangeEvent {
    constructor(checked, original_event) {
        this.checked = checked;
        this.original_event = original_event;
    }
}

export class VisualizationControlCheck {
    constructor($parent, label) {
        this.change_listeners = [];
        this.$parent = $parent;
        this.control_id = Math.floor(Math.random() * 1e+15).toString();
        this.checkbox_id = "vis-ctrl-" + this.control_id + "-check";
        this.label = label;
        let that = this;

        this.$check_container = $(
            '<div class="visualization-control check"></div>'
        ).appendTo(this.$parent);
        this.$checkbox = $(
            '<input type="checkbox" name="' + this.checkbox_id + '" id="' + this.checkbox_id +
                '" value="Yes">'
        ).appendTo(this.$check_container);
        this.$label = $(
            '<label for="' + this.checkbox_id + '">' + this.label + '</label>'
        ).appendTo(this.$check_container);

        this.$checkbox.change((event) => that._on_state_change.call(that, event));
        // this.$label.click(function(event) {
        //     that.$checkbox.prop('checked', !that.$checkbox[0].checked);
        //     that._on_state_change(event);
        // });
    }

    add_listener(callback) {
        this.change_listeners.push(callback);
    }

    _on_state_change(event) {
        let e = new CheckChangeEvent(this.$checkbox[0].checked, event);
        for (let callback of this.change_listeners) {
            callback(e);
        }
    }
}
