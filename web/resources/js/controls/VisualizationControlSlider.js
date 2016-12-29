/**
 * Created by lumpiluk on 9/26/16.
 */

export class VisualizationControlSlider {
    constructor($parent, color_system_property, step, decimal_points=2) {
        this.$parent = $parent;
        this.color_system_property = color_system_property;
        this.color_system_property.add_slider(this);
        this.control_id = Math.floor(Math.random() * 1e+15).toString();
        this.slider_id = "vis-ctrl-" + this.control_id + "-slider";
        this.number_id = "vis-ctrl-" + this.control_id + "-number";
        this.step = step;
        this.decimal_points = decimal_points;

        let ranges = 'min="' + this.color_system_property.get_scaled_min() + '" ' +
            'max="' + this.color_system_property.get_scaled_max() + '" ' +
            'step="' + (this.step * this.color_system_property.unit_scale).toString() + '" ' +
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
        this.$slider = this.$parent.find("#" + this.slider_id);
        this.$number = this.$parent.find("#" + this.number_id);

        /* Attach event handlers. */
        let that = this;
        this.$slider.on("input", (event) => that.on_slider_change.call(that, event));
        this.$number.on("change", (event) => that.on_number_change.call(that, event));
    }

    on_slider_change(event) {
        this.$number.val(parseFloat(event.target.value).toFixed(this.decimal_points));
        this.color_system_property.set_value(event.target.value / this.color_system_property.unit_scale);
    }

    on_number_change(event) {
        this.$slider.val(event.target.value);
        this.color_system_property.set_value(event.target.value / this.color_system_property.unit_scale);
    }

    update_slider() {
        $("#" + this.number_id).val(this.color_system_property.get_value(true).toFixed(this.decimal_points));
        $("#" + this.slider_id).val(this.color_system_property.get_value(true).toFixed(this.decimal_points));
    }

    update_unit_scale() {
        console.log("slider: updating unit scale");

        this.$slider.attr("min", this.color_system_property.get_scaled_min());
        this.$slider.attr("max", this.color_system_property.get_scaled_max());
        this.$slider.attr("step", this.step * this.color_system_property.unit_scale);
        this.$number.attr("min", this.color_system_property.get_scaled_min());
        this.$number.attr("max", this.color_system_property.get_scaled_max());
        this.$number.attr("step", this.step * this.color_system_property.unit_scale);

        this.$slider.val(this.color_system_property.get_value(true).toFixed(this.decimal_points));
        this.$number.val(this.color_system_property.get_value(true).toFixed(this.decimal_points));
    }
}
