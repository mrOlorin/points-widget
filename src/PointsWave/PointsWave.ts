import {
    AdditiveBlending,
    BufferGeometry,
    Color,
    Float32BufferAttribute,
    GLSL3,
    Mesh,
    Points,
    Scene,
    ShaderMaterial,
    Vector3
} from 'three';
import vertexShader from './pointsVert.glsl';
import fragmentShader from './pointsFrag.glsl';
import {MeshSurfaceSampler} from 'three/examples/jsm/math/MeshSurfaceSampler';
import {IUniform} from "three/src/renderers/shaders/UniformsLib";
import {WebGLRenderer} from "three/src/renderers/WebGLRenderer";
import {Camera} from "three/src/cameras/Camera";

export interface PointsWaveSettings {
    id: string;
    name: string;
    pointSize: number;
    pointsNumber: number;
    intensity: number;
    speed: number;
    randomColor: boolean;
    pointColor: Color;
    shape: {
        geometry: BufferGeometry;
        settings: {}
    };
}

export const defaultSettings: PointsWaveSettings = {
    id: '1',
    name: 'Дефолт',
    pointSize: 15,
    pointsNumber: 10000,
    intensity: 1,
    speed: 1,
    randomColor: false,
    pointColor: new Color(41, 19, 11),
    shape: {
        geometry: undefined,
        settings: {},
    }
}

interface Point {
    position: Vector3,
    color: Color,
}

export default class PointsWave {
    public readonly scene: Scene = new Scene();
    private readonly mesh: Points = new Points();
    private points: Array<Point> = [];
    private shape: BufferGeometry;
    public phase: number = 0;
    public stepsLeft: number = 0;

    public constructor(private _settings: PointsWaveSettings = defaultSettings) {
        this.settings = _settings;
        this.scene.add(this.mesh);
    }

    public get settings() {
        return this._settings;
    }

    public set settings(settings: PointsWaveSettings) {
        this._settings = this.initSettingsProxy(settings);
        this.buildMesh();
    }

    public async run(times: number = 1) {
        let range = [0, Math.PI];
        let speedScale = .01;
        return new Promise<void>((resolve) => {
            this.stepsLeft += times;
            const animate = () => {
                if (this.phase >= range[1]) {
                    this.phase = range[0];
                    this.stepsLeft--;
                }
                if (this.stepsLeft > range[0]) {
                    this.phase += this.settings.speed * speedScale;
                    requestAnimationFrame(animate);
                } else {
                    return resolve();
                }
            }
            if (this.stepsLeft === times) {
                animate();
            }
        });
    };

    public stop() {
        this.stepsLeft = 0;
    }

    private async buildMesh(): Promise<void> {
        this.shape = this.settings.shape.geometry;
        this.mesh.geometry = new BufferGeometry();
        this.mesh.material = this.initMaterial() as ShaderMaterial;

        this.buildPoints();

        this.mesh.onBeforeRender = (renderer: WebGLRenderer, scene: Scene, camera: Camera) => {
            this.uniforms.uTime.value = performance.now() * .001;
            this.uniforms.uPhase.value = this.phase;
        }
        /*this.mesh.onAfterRender = (renderer: WebGLRenderer, scene: Scene, camera: Camera) => {
            this.points.sort((a, b) => {
                const d1 = camera.position.distanceTo(a.position);
                const d2 = camera.position.distanceTo(b.position);
                if (d1 > d2) {
                    return -1;
                } else if (d1 < d2) {
                    return 1;
                } else {
                    return 0;
                }
            });
            this.updatePositions();
            this.updateColors();
        }*/
    }

    private buildPoints() {
        const n = this.settings.pointsNumber - this.points.length;
        if (n < 0) {
            this.points.length = this.settings.pointsNumber;
        } else {
            const pointsGenerator = this.pointsGenerator();
            for (let i = 0; i < n; i++) {
                this.points.push(pointsGenerator.next().value);
            }
        }
        this.updatePositions();
        this.updateColors();
    }

    private buildPositions() {
        const positionsGenerator = this.positionsGenerator();
        this.points.forEach(point => point.position = positionsGenerator.next().value);
        this.updatePositions();
    }

    private buildColors() {
        const colorsGenerator = this.colorsGenerator();
        this.points.forEach(point => point.color = colorsGenerator.next().value);
        this.updateColors();
    }

    private updatePositions() {
        const positions = [];
        for (const point of this.points) {
            positions.push(point.position.x, point.position.y, point.position.z);
        }
        this.mesh.geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
        this.mesh.geometry.getAttribute('position').needsUpdate = true;
    }

    private updateColors() {
        const colors = [];
        for (const point of this.points) {
            colors.push(point.color.r, point.color.g, point.color.b);
        }
        this.mesh.geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
        this.mesh.geometry.getAttribute('color').needsUpdate = true;
    }

    private* pointsGenerator(): Iterator<Point> {
        const positionsGenerator = this.positionsGenerator();
        const colorsGenerator = this.colorsGenerator();
        while (true) yield {
            position: positionsGenerator.next().value,
            color: colorsGenerator.next().value,
        };
    }

    private* colorsGenerator(): Iterator<Color> {
        const getColor: () => Color = this.settings.randomColor ? () => {
            return new Color(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1)
        } : (() => {
            const color = new Color(
                this.settings.pointColor.r / 255,
                this.settings.pointColor.g / 255,
                this.settings.pointColor.b / 255
            );
            return () => color;
        })();
        while (true) yield getColor();
    }

    private* positionsGenerator(): Iterator<Vector3> {
        const getPosition: () => Vector3 = this.shape ? (() => {
            const shapeMesh = new Mesh(this.shape);
            const sampler = new MeshSurfaceSampler(shapeMesh).build();
            const randomPosition: Vector3 = new Vector3();
            return (): Vector3 => {
                sampler.sample(randomPosition)
                return new Vector3(randomPosition.x, randomPosition.y, randomPosition.z);
            }
        })() : () => new Vector3(.5 - Math.random(), .5 - Math.random(), .5 - Math.random());
        while (true) yield getPosition()

    }

    private uniforms: { [uniform: string]: IUniform };

    private get pointSizeFactor() {
        return .001 * (window.innerHeight / (2 * Math.tan(0.5 * 60 * Math.PI / 180)));
    }

    private initMaterial(): ShaderMaterial {
        this.uniforms = {
            uTime: {value: 0},
            uPhase: {value: 0},
            uIntensity: {value: this.settings.intensity},
            uSize: {value: this.settings.pointSize * this.pointSizeFactor},
        };
        console.log(this.uniforms.uSize.value);
        return new ShaderMaterial({
            uniforms: this.uniforms,
            glslVersion: GLSL3,
            vertexShader,
            fragmentShader,
            depthTest: true,
            transparent: true,
            depthWrite: false,
            vertexColors: true,
            blending: AdditiveBlending,
            // blendEquation: AddEquation,
            // blendSrc: OneFactor,
            // blendDst: OneMinusDstAlphaFactor,
        });
    }

    private onSettingsChanges: Map<keyof PointsWaveSettings, () => void> = new Map([
        ['pointSize', () => this.uniforms.uSize.value = this.settings.pointSize * this.pointSizeFactor],
        ['pointColor', () => this.buildColors()],
        ['randomColor', () => this.buildColors()],
        ['pointsNumber', () => this.buildPoints()],
        ['intensity', () => {
            this.uniforms.uIntensity.value = this.settings.intensity;
        }],
        ['shape', async () => {
            this.shape = await this.settings.shape.geometry;
            this.buildPositions()
        }],
    ]);

    private initSettingsProxy(settings: PointsWaveSettings): PointsWaveSettings {
        return new Proxy(settings, {
            get: (target: PointsWaveSettings, prop: keyof PointsWaveSettings, receiver) => {
                return Reflect.get(target, prop, receiver);
            },
            set: (target: PointsWaveSettings, prop: keyof PointsWaveSettings, receiver) => {
                const result = Reflect.set(target, prop, receiver);
                if (this.onSettingsChanges.has(prop)) {
                    this.onSettingsChanges.get(prop)();
                }
                return result;
            },
        });
    }

}
