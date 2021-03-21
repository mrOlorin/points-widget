uniform float uPhase;
uniform float uIntensity;
in vec3 vColor;
in vec3 vPosition;
in float vWave;
in float vSize;
out vec4 fragColor;

void main() {
    if (length(gl_PointCoord.xy - .5) > .4 || vSize < .1) discard;
    fragColor = vec4(vColor, 1.);
}
