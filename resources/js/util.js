export function lerp(a, b, alpha) {
    let m = b - a; // (e-s)/1
    return m * alpha + a;
}
