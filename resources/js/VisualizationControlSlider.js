/**
 * Created by lumpiluk on 9/26/16.
 */

export class VisualizationControlSlider {
    constructor($parent, color_system_property, step) {
        this.$parent = parent;
        this.color_system_property = color_system_property;
        this.control_id = Math.floor(Math.random() * 1e+15).toString();
        this.slider_id = "vis-ctrl-" + this.control_id + "-slider";
        this.number_id = "vis-ctrl-" + this.control_id + "-number";

        let ranges = 'min="' + this.color_system_property.min + '" ' +
            'max="' + this.color_system_property.max + '" ' +
            'step="' + step.toString() + '" ' +
            'value="' + this.color_system_property.value.toString() + '"';

        $parent.append(
            '<div class="visualization-control slider">' +
                '<label for="' + this.slider_id + '">' + this.color_system_property.name + ':</label>' +
                '<input type="number" value="' + this.color_system_property.value.toString() +
                    '" id="' + this.number_id + '" ' + ranges + ' />' +
                '<span class="slider-container">' +
                    '<input type="range" name="' + this.slider_id + '" id="' + this.slider_id +
                        '" ' + ranges + ' />' +
                '</span>' +
            '</div>'
        );

        /* Attach event handlers. */
        let that = this;
        $("#" + this.slider_id).on("input", (event) => that.on_slider_change.call(that, event));
        $("#" + this.number_id).on("change", (event) => that.on_number_change.call(that, event));
    }

    on_slider_change(event) {
        $("#" + this.number_id).val(event.target.value);
        this.color_system_property.set_value(event.target.value);
    }

    on_number_change(event) {
        $("#" + this.slider_id).val(event.target.value);
        this.color_system_property.set_value(event.target.value);
    }
}
