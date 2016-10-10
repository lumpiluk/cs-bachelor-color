varying vec4 worldCoord;


vec3 get_hsv() {
    return vec3(worldCoord.x, worldCoord.y, worldCoord.z);
}

vec3 hsv_to_rgb(in vec3 hsv) {
    float h = hsv.x;
    float s = hsv.y;
    float v = hsv.z;

    if (s <= 0.0) {
        return vec3(v, v, v);
    }

    float hp = mod(h * 6.0, 6.0);
    float c1 = floor(hp);
    float c2 = hp - c1;

    float w1 = (1.0 - s) * v;
    float w2 = (1.0 - s * c2) * v;
    float w3 = (1.0 - s * (1.0 - c2)) * v;

    int ic1 = int(c1);
    if (ic1 == 0)
        return vec3(v, w3, w1);
    if (ic1 == 1)
        return vec3(w2, v, w1);
    if (ic1 == 2)
        return vec3(w1, v, w3);
    if (ic1 == 3)
        return vec3(w1, w2, v);
    if (ic1 == 4)
        return vec3(w3, w1, v);
    return vec3(v, w1, w2);
}

void main() {
    vec3 rgb = hsv_to_rgb(get_hsv());
    gl_FragColor = vec4(rgb.x, rgb.y, rgb.z, 1.0);
}
