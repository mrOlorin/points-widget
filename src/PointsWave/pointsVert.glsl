attribute float size;
uniform float uTime;
uniform float uPhase;
uniform float uIntensity;
out vec3 vColor;
out vec3 vPosition;
out float vWave;
out float vSize;

float vawe(vec3 p, float phase) {
    // float a = vPosition.x + vPosition.y - uPhase;
    return .5+.5*sin(vPosition.x + vPosition.y - uPhase);
}

vec3 shift(vec3 p, float phase) {
    return vec3(
        0.,
        0.,
        0.
    );
}

void main() {
    vColor = color;
    vPosition = position;
    vSize = size;

    vWave = uIntensity*vawe(vPosition, uPhase);
    if (uIntensity > 0.) {
        vSize *= max(vWave, .0001);
    }

    vPosition += shift(vPosition, uTime) ;

    vec4 mvPosition = modelViewMatrix * vec4(vPosition, 1.0);
    vSize /= -mvPosition.z;
    gl_PointSize = vSize;
    gl_Position = projectionMatrix * mvPosition;
}
