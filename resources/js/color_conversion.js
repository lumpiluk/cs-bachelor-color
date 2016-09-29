/**
 * Created by lumpiluk on 9/27/16.
 */

/* function rgb_component_to_hex(c) {
    let c_bytes = Math.floor(c * 255);
    let c_hex = c_bytes.toString(16);
    return c_hex.length < 2 ? "0" + c_hex : c_hex;
} */

export function hsv_to_rgb(h, s, v) {
    /*
    TODO: fix conversions for (1, 1, 1) (purple instead of red), (0.999, 0, 1) (black instead of white)
     */
    if (s <= 0) {
        return {r: v, g: v, b: v};
    }

    let hp = h * 6 % 6;
    let c1 = Math.floor(hp);
    let c2 = hp - c1;

    let w1 = (1 - s) * v;
    let w2 = (1 - s * c2) * v;
    let w3 = (1 - s * (1 - c2)) * v;

    switch (c1) {
        case 0: return {r: v, g: w3, b: w1};
        case 1: return {r: w2, g: v, b: w1};
        case 2: return {r: w1, g: v, b: w3};
        case 3: return {r: w1, g: w2, b: v};
        case 4: return {r: w3, g: w1, b: v};
        default: return {r: v, g: w1, b: w2};
    }
}
