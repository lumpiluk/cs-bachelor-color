varying vec4 worldCoord;

void main() {
    /* worldPos = ModelView^(-1) * Projection^(-1) * p */
    /*mat4 normalMatrix4 = mat4(varNormalMatrix);
    normalMatrix4[3][3] = 1.0;
    vec4 worldPositionTmp = normalMatrix4 * gl_FragCoord;
    vec4 worldPosition = vec4(
        worldPositionTmp.x,
        worldPositionTmp.y,
        worldPositionTmp.z,
        worldPositionTmp.z / gl_FragCoord.w // undo perspective projection matrix
    );*/
    gl_FragColor = vec4(worldCoord.x,
                        worldCoord.y,
                        worldCoord.z,
                        1.0);
}
