
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

export function cmyk_to_rgb(c, m, y, k) {
    return cmy_to_rgb(c + k, m + k, y + k);
}

export function cmy_to_rgb(c, m, y) {
    return {r: 1 - c, g: 1 - m, b: 1 - y};
}

export function cmy_to_cmyk(c, m, y) {
    let k = Math.min(c, m, y);
    return {c: c - k, m: m - k, y: y - k, k: k};
}
