# TODO

- Readme
    - Explain how to enable/disable experiment.
- Exercises
    - 'Restart' button.
    - Let each task type summarize its own results.
    - finish presentation mode for tasks other than matching
    - matching: show result also in visualizations; show correct results on failure
    - advanced configurator: matching: when switching system to HSV or HSL, units stay at "[0, 1]", even though they should be "Degrees, [0, 1], [0, 1]". The other way round is also problematic.
    - matching: visualizations often invisible because jquery returns height 0 on init of vis.
- Visualizations
    - Option to dynamically load any visualization for comparison.
    - HSL, HSV: Option to not slice the cylinders/cones.
    - Comparison: Fix NaN.
    - Scrolling in Firefox, Edge!
    - adjust zoom in vis. comparisons
    - make elements resizable in fullscreen (see http://codepen.io/pprice/pen/splkc/)
    - FIX: in fullscreen visualization comparisons, when opening the development panel and resizing it, the visualizations' heights grow monotonically
    - FIX: Firefox, vis. comparison: "TypeError: _this.$fullscreen_button is null"
