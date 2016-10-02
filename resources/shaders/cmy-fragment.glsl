varying vec4 worldCoord;

void main() {
    gl_FragColor = vec4(1.0 - worldCoord.x,
                        1.0 - worldCoord.y,
                        1.0 - worldCoord.z,
                        1.0);
}
