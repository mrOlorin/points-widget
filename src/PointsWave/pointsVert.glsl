attribute float size;
uniform float uTime;
uniform float uPhase;
uniform float uWobbliness;
uniform float uIntensity;
out vec3 vColor;
out vec3 vPosition;
out float vWave;
out float vSize;

void main() {
    vColor = color;
    vPosition = position;
    vSize = size;

    vWave = pow(.5 + .5 * sin(vPosition.x * 2. - uPhase - 1.), 12.);

    if (uIntensity > 0.) {
        vSize *= uIntensity * max(vWave, .0001);
    }

    vec3 shift = .02 * vec3(cos(vPosition.yzx * uWobbliness * 15. + vWave * uWobbliness));

    vec4 mvPosition = modelViewMatrix * vec4(vPosition + shift, 1.0);
    vSize /= -mvPosition.z;
    gl_PointSize = vSize;
    gl_Position = projectionMatrix * mvPosition;
}
