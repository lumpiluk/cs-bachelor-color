
export function hsv_to_rgb(h, s, v) {
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

/**
 * Converts RGB colors to HSV colors.
 * Keep in mind that hue is undefined for saturation=0.
 */
export function rgb_to_hsv(r, g, b) {
    let c_high = Math.max(r, g, b);
    let c_low = Math.min(r, g, b);
    let c_rng = c_high - c_low;
    let rp = c_high - r;
    let gp = c_high - g;
    let bp = c_high - b;
    let hp;
    switch (c_high) {
        case r:
            hp = bp - gp;
            break;
        case g:
            hp = rp - bp + 2;
            break;
        case b:
            hp = gp - rp + 4;
            break;
    }
    let h = (hp < 0 ? hp + 6 : hp) / 6;
    let s = c_high > 0 ? c_rng / c_high : 0;
    return {h: h, s: s, v: c_high};
}

export function hsl_to_rgb(h, s, l) {
    if (l <= 0) {
        return {r: 0, g: 0, b: 0};
    } else if (l >= 1) {
        return {r: 1, g: 1, b: 1};
    }

    let hp = (h * 6) % 6;
    let c1 = Math.floor(hp);
    let c2 = hp - c1;
    let d = l <= .5 ? s * l : s * (1 - l);

    let u1 = l + d;
    let u2 = l - d;
    let u3 = u1 - (u1 - u2) * c2;
    let u4 = u2 + (u1 - u2) * c2;

    switch (c1) {
        case 0: return {r: u1, g: u4, b: u2};
        case 1: return {r: u3, g: u1, b: u2};
        case 2: return {r: u2, g: u1, b: u4};
        case 3: return {r: u2, g: u3, b: u1};
        case 4: return {r: u4, g: u2, b: u1};
        default: return {r: u1, g: u2, b: u3};
    }
}

/**
 * Converts RGB colors to HSL colors.
 * Keep in mind that hue is undefined for saturation=0.
 */
export function rgb_to_hsl(r, g, b) {
    let c_high = Math.max(r, g, b);
    let c_low = Math.min(r, g, b);
    let c_rng = c_high - c_low;
    let rp = c_high - r;
    let gp = c_high - g;
    let bp = c_high - b;
    let hp;
    switch (c_high) {
        case r:
            hp = bp - gp;
            break;
        case g:
            hp = rp - bp + 2;
            break;
        case b:
            hp = gp - rp + 4;
            break;
    }
    let h = (hp < 0 ? hp + 6 : hp) / 6;
    let l = (c_high + c_low) / 2;
    let s = 0;
    if (l > 0 && l <= .5) {
        s = c_rng / 2 / l;
    } else if (l > .5 && l < 1) {
        s = c_rng / 2 / (1 - l);
    }
    return {h: h, s: s, l: l};
}

export function cmy_to_rgb(c, m, y) {
    return {r: 1 - c, g: 1 - m, b: 1 - y};
}

export function rgb_to_cmy(r, g, b) {
    return {c: 1 - r, m: 1 - g, y: 1 - b};
}

export function cmy_to_cmyk(c, m, y) {
    let k = Math.min(c, m, y);
    return {c: c - k, m: m - k, y: y - k, k: k};
}

export function cmyk_to_rgb(c, m, y, k) {
    return cmy_to_rgb(c + k, m + k, y + k);
}

export function rgb_to_cmyk(r, g, b) {
    let cmy = rgb_to_cmy(r, g, b);
    return cmy_to_cmyk(cmy.c, cmy.m, cmy.y);
}
