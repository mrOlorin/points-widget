uniform float uPhase;
uniform float uIntensity;
in vec3 vColor;
in vec3 vPosition;
in float vWave;
in float vSize;
out vec4 fragColor;

void main() {
    vec2 uv = gl_PointCoord - .5;
    float d = length(uv) * 2.;
    if (vSize < 1. || d > .5) discard;

    fragColor = vec4(vColor, 1. - d * 2.);
}
