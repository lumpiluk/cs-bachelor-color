varying vec4 worldCoord;

void main() {
    gl_FragColor = vec4(worldCoord.x,
                        worldCoord.y,
                        worldCoord.z,
                        1.0);
}
