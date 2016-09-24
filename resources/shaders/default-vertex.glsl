/*
 * Predefined built-in uniforms and attributes for vertex shader:
 * http://threejs.org/docs/api/renderers/webgl/WebGLProgram.html

 * // = object.matrixWorld
 * uniform mat4 modelMatrix;

 * // = camera.matrixWorldInverse * object.matrixWorld
 * uniform mat4 modelViewMatrix;

 * // = camera.projectionMatrix
 * uniform mat4 projectionMatrix;

 * // = camera.matrixWorldInverse
 * uniform mat4 viewMatrix;

 * // = inverse transpose of modelViewMatrix
 * uniform mat3 normalMatrix;

 * // = camera position in world space
 * uniform vec3 cameraPosition;
 *
 * Additionally from GLSL:
 * https://www.opengl.org/wiki/Built-in_Variable_(GLSL)
 * gl_FragCoord
 */

/*
  Fragment position in world space.
  Thanks to
  https://www.opengl.org/discussion_boards/showthread.php/163272-How-do-I-get-a-fragments-x-y-z-in-world-coordinates-in-the-fragment-shader
  and
  https://en.wikibooks.org/wiki/GLSL_Programming/Unity/Shading_in_World_Space
*/
varying vec4 worldCoord;

/**
 * Multiply each vertex by the
 * model-view matrix and the
 * projection matrix (both provided
 * by Three.js) to get a final
 * vertex position.
 * (Copied from https://aerotwist.com/tutorials/an-introduction-to-shaders-part-1/)
 */
void main() {
  worldCoord = modelMatrix * vec4(position,1.0);

  gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4(position,1.0);
}