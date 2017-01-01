/**
 * Created by lumpiluk on 9/26/16.
 */

export class VisualizationControlSlider {
    /**
     *
     * @param $parent
     * @param color_system_property
     * @param step TODO: redundant?
     * @param validity_check A function taking a value between 0 and 1 as parameter and returning true iff that value
     * is valid.
     */
    constructor($parent, color_system_property, step, validity_check=() => true) {
        this.$parent = $parent;
        this.color_system_property = color_system_property;
        this.color_system_property.add_slider(this);
        this.control_id = Math.floor(Math.random() * 1e+15).toString();
        this.slider_id = "vis-ctrl-" + this.control_id + "-slider";
        this.number_id = "vis-ctrl-" + this.control_id + "-number";
        this.step = step;
        this.validity_check = validity_check;

        this.previous_value = this.color_system_property.get_value(false); // in [0,1] interval

        let ranges = 'min="' + this.color_system_property.get_scaled_min() + '" ' +
            'max="' + this.color_system_property.get_scaled_max() + '" ' +
            'step="' + this.color_system_property.get_scaled_step().toString() + '" ' + // TODO: scale step, too, but only if rounding is disabled!
            'value="' + this.color_system_property.get_value(true).toString() + '"';

        this.$control = $(
            '<tr class="visualization-control slider"></tr>'
        ).appendTo(this.$parent);

        this.$label = $(
            '<td class="shrink">' + // label
                '<label for="' + this.slider_id + '">' +
                    this.color_system_property.name + this.color_system_property.get_unit_symbol() +
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
        let val = parseFloat(event.target.value);
        let unscaled_val = this.color_system_property.unit_inverse_transform_value(val);

        /* Check if val is valid. If not so, do not use the new value. (Useful especially for CMYK) */
        if (!this.validity_check(unscaled_val)) {
            val = this.color_system_property.unit_transform_value(this.previous_value);
            unscaled_val = this.previous_value;
        }
        this.previous_value = unscaled_val;

        this.color_system_property.set_value(this.color_system_property.unit_inverse_transform_value(val));
        val = this.color_system_property.get_value(true);
        this.$number.val(val);
        this.$slider.val(val);
    }

    update_slider() {
        this.$number.val(this.color_system_property.get_value(true));
        this.$slider.val(this.color_system_property.get_value(true));
    }

    update_unit_scale() {
        this.$slider.attr("min", this.color_system_property.get_scaled_min());
        this.$slider.attr("max", this.color_system_property.get_scaled_max());
        this.$slider.attr("step", this.color_system_property.get_scaled_step());
        this.$number.attr("min", this.color_system_property.get_scaled_min());
        this.$number.attr("max", this.color_system_property.get_scaled_max());
        this.$number.attr("step", this.color_system_property.get_scaled_step());

        this.$label.text(this.color_system_property.name + this.color_system_property.get_unit_symbol() + ":");

        this.$slider.val(this.color_system_property.get_value(true));
        this.$number.val(this.color_system_property.get_value(true));
    }
}
