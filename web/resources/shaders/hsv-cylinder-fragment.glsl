varying vec4 worldCoord;
uniform float radiusBottom;
uniform float radiusTop;

const float PI = 3.1415926535897932384626433832795;
const float HALF_PI = 1.57079632679489661923;
const float TWO_PI = 6.283185307179586;

const float Y_TRANSLATE = .5;

vec3 get_hsv() {
    float distFromY = distance(vec2(worldCoord.x, worldCoord.z), vec2(0, 0));

    float v = worldCoord.y + Y_TRANSLATE;
    /* Adjust saturation for linear interpolation between radii. */
    float s = distFromY / mix(radiusBottom, radiusTop, v);
    float h = (atan(worldCoord.z, -worldCoord.x) + PI) / TWO_PI;

    return vec3(h, s, v);
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
