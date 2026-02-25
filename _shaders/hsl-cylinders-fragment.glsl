varying vec4 worldCoord;
uniform float radiusBottom;
uniform float radiusTop;
uniform float radius;
uniform float height;

const float PI = 3.1415926535897932384626433832795;
const float HALF_PI = 1.57079632679489661923;
const float TWO_PI = 6.283185307179586;

vec3 get_hsl() {
    float distFromY = distance(vec2(worldCoord.x, worldCoord.z), vec2(0, 0));

    float l = (worldCoord.y + height / 2.0) / height;
    /* Adjust saturation for linear interpolation between radii. */
    float s = 0.0;
    if (l > .5) {
        s = distFromY / mix(radius, radiusTop, worldCoord.y / (height / 2.0));
    } else {
        s = distFromY / mix(radiusBottom, radius, (worldCoord.y + height / 2.0) / (height / 2.0));
    }
    float h = (atan(worldCoord.z, -worldCoord.x) + PI) / TWO_PI;

    return vec3(h, s, l);
}

vec3 hsl_to_rgb(in vec3 hsl) {
    float h = hsl.x;
    float s = hsl.y;
    float l = hsl.z;

    if (l <= 0.0) {
        return vec3(0.0, 0.0, 0.0);
    } else if (l >= 1.0) {
        return vec3(1.0, 1.0, 1.0);
    }

    float hp = mod(h * 6.0, 6.0);
    float c1 = floor(hp);
    float c2 = hp - c1;
    float d = l <= .5 ? s * l : s * (1.0 - l);

    float u1 = l + d;
    float u2 = l - d;
    float u3 = u1 - (u1 - u2) * c2;
    float u4 = u2 + (u1 - u2) * c2;

    int ic1 = int(c1);
    if (ic1 == 0)
        return vec3(u1, u4, u2);
    if (ic1 == 1)
        return vec3(u3, u1, u2);
    if (ic1 == 2)
        return vec3(u2, u1, u4);
    if (ic1 == 3)
        return vec3(u2, u3, u1);
    if (ic1 == 4)
        return vec3(u4, u2, u1);
    return vec3(u1, u2, u3);
}

void main() {
    vec3 rgb = hsl_to_rgb(get_hsl());
    gl_FragColor = vec4(rgb.x, rgb.y, rgb.z, 1.0);
}
