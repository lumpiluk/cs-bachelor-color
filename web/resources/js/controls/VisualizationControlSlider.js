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
            'value="' + this.color_system_property.get_value(true).toString() + '"';

        this.$control = $(
            '<tr class="visualization-control slider"></tr>'
        ).appendTo(this.$parent);

        this.$label = $(
            '<td class="shrink">' + // label
                '<label for="' + this.slider_id + '">' +
                    this.color_system_property.name + this.color_system_property.unit_symbol +
                ':</label>' +
            '</td>'
        ).appendTo(this.$control);
        this.$label = this.$label.find("label");

        this.$slider = $(
            '<td class="expand">' +
                '<input type="range" name="' + this.slider_id + '" id="' + this.slider_id +
                    '" ' + ranges + ' />' +
            '</td>'
        ).appendTo(this.$control);
        this.$slider = this.$slider.find("input");

        this.$number = $(
            '<td class="shrink">' +
                '<input type="number"' +
                    '" id="' + this.number_id + '" ' + ranges + ' />' +
            '</td>'
        ).appendTo(this.$control);
        this.$number = this.$number.find("input");

        /* Attach event handlers. */
        let that = this;
        this.$slider.on("input", (event) => that.on_value_change.call(that, event));
        this.$number.on("change", (event) => that.on_value_change.call(that, event));
    }

    on_value_change(event) {
        // TODO: consider CMYK limits depending on K
        let val = Math.min(this.color_system_property.get_scaled_max(),
            Math.max(this.color_system_property.get_scaled_min(), event.target.value));
        this.$number.val(parseFloat(val).toFixed(this.decimal_points));
        this.$slider.val(val);
        this.color_system_property.set_value(val / this.color_system_property.unit_scale);
    }

    update_slider() {
        this.$number.val(this.color_system_property.get_value(true).toFixed(this.decimal_points));
        this.$slider.val(this.color_system_property.get_value(true).toFixed(this.decimal_points));
    }

    update_unit_scale() {
        this.$slider.attr("min", this.color_system_property.get_scaled_min());
        this.$slider.attr("max", this.color_system_property.get_scaled_max());
        this.$slider.attr("step", this.step * this.color_system_property.unit_scale);
        this.$number.attr("min", this.color_system_property.get_scaled_min());
        this.$number.attr("max", this.color_system_property.get_scaled_max());
        this.$number.attr("step", this.step * this.color_system_property.unit_scale);

        this.$label.text(this.color_system_property.name + this.color_system_property.unit_symbol + ":");

        this.$slider.val(this.color_system_property.get_value(true).toFixed(this.decimal_points));
        this.$number.val(this.color_system_property.get_value(true).toFixed(this.decimal_points));
    }
}
