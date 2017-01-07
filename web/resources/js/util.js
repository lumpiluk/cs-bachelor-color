export function lerp(a, b, alpha) {
    let m = b - a; // (end-start)/1
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

/**
 * Fisher-Yates Shuffle.
 * Copied from http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript,
 * which is an adaptation from https://bost.ocks.org/mike/shuffle/.
 * @param array
 * @returns {*}
 */
export function shuffle(array) {
    let counter = array.length;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        let index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

/**
 * Remove element from array.
 * http://stackoverflow.com/questions/3596089/how-to-remove-specifc-value-from-array-using-jquery
 * May be replaced by _.without if underscore were included.
 * @param array
 * @param element
 * @returns {*}
 */
export function remove_from_array(array, element) {
    array.splice($.inArray(element, array), 1);
    return array;
}

export function is_fullscreen() {
    return document.fullscreenElement ||    // alternative standard method
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
}

/**
 * Toogle fullscreen.
 * Copied from http://stackoverflow.com/questions/13303151/getting-fullscreen-mode-to-my-browser-using-jquery
 */
export function toggle_full_screen(element) {
    if (!is_fullscreen()) {  // current working methods
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
}
