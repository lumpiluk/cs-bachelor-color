export function lerp(a, b, alpha) {
    let m = b - a; // (e-s)/1
    return m * alpha + a;
}

export function random_sample(array) {
    return array[Math.floor(Math.random() * array.length)];
}

export function rgb_to_css(r, g, b) {
    return "rgb(" +
        (r * 100).toString() + "%, " +
        (g * 100).toString() + "%, " +
        (b * 100).toString() + "%)";
}

export function get_euclidean_distance_for_error(error, num_dimensions) {
    return Math.sqrt(Math.pow(error, 2) * num_dimensions);
}

export function update_mathjax($container) {
    MathJax.Hub.Queue(["Typeset", MathJax.Hub, $container[0]]);
}
