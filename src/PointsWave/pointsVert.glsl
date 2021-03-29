attribute float size;
uniform float uTime;
uniform float uPhase;
uniform float uIntensity;
uniform float uSize;
out vec3 vColor;
out vec3 vPosition;
out float vWave;
out float vSize;

float vawe(vec3 p, float phase) {
    return sin(p.x-phase*2.-1.);
}

vec3 shift(vec3 p, float phase) {
    return .01 * vec3(
        sin(p.y*10. + phase),
        cos(p.x*10. + phase),
        cos((p.x+p.y)*10. + phase)
    );
}

void main() {
    vColor = color;
    vPosition = position;
    vSize = uSize;

    vWave = uIntensity * vawe(vPosition, uPhase);
    if (uIntensity > 0.) {
        vSize *= max(vWave, .0001);
    }

    vPosition += shift(vPosition, uTime) ;

    vec4 mvPosition = modelViewMatrix * vec4(vPosition, 1.);
    vSize /= -mvPosition.z;
    gl_PointSize = vSize;
    gl_Position = projectionMatrix * mvPosition;
}
