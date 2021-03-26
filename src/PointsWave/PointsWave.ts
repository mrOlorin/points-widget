import {
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
    pointSize: 10,
    pointsNumber: 10000,
    intensity: 1,
    speed: 1,
    randomColor: true,
    pointColor: new Color(255, 80, 0),
    shape: {
        geometry: undefined,
        settings: {},
    }
}

export default class PointsWave {
    public readonly scene: Scene = new Scene();
    private readonly points: Points = new Points();
    public phase: number = 0;
    public stepsLeft: number = 0;

    public constructor(private _settings: PointsWaveSettings = defaultSettings) {
        this.settings = _settings;
        this.scene.add(this.points);
    }

    public get settings() {
        return this._settings;
    }

    public set settings(settings: PointsWaveSettings) {
        this._settings = this.initSettingsProxy(settings);
        this.buildPoints();
    }

    public async run(times: number = 1) {
        let range = [0, 2 * Math.PI];
        let speedScale = .02;
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

    private async buildPoints(): Promise<void> {
        this.points.geometry = this.initGeometry(this.settings.shape.geometry);
        this.points.material = this.initMaterial() as ShaderMaterial;
        this.points.onBeforeRender = () => {
            this.uniforms.uTime.value = performance.now() * .001;
            this.uniforms.uPhase.value = this.phase;
        }
    }

    private initGeometry(shape?: BufferGeometry) {
        const geometry = new BufferGeometry();
        this.setPositions(geometry, shape);
        this.setColors(geometry);
        this.setSizes(geometry);
        return geometry;
    }

    private lastShape: BufferGeometry;

    private setPositions(geometry: BufferGeometry, shape?: BufferGeometry) {
        const positions = [];
        if (shape) {
            this.lastShape = shape;
        } else if (null !== shape) {
            shape = this.lastShape;
        }
        const getPoint = shape ? (() => {
            const shapeMesh = new Mesh(shape);
            const sampler = new MeshSurfaceSampler(shapeMesh).build();
            const randomPosition: Vector3 = new Vector3();
            return () => {
                sampler.sample(randomPosition)
                return [randomPosition.x, randomPosition.y, randomPosition.z];
            }
        })() : () => {
            return [.5 - Math.random(), .5 - Math.random(), .5 - Math.random()];
        };

        for (let i = 0; i < this.settings.pointsNumber; i++) {
            const offset = i * 3;
            const point = getPoint();
            positions[offset] = point[0];
            positions[offset + 1] = point[1];
            positions[offset + 2] = point[2];
        }

        geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    }

    private setSizes(geometry: BufferGeometry) {
        const sizes = [];
        for (let i = 0; i < this.settings.pointsNumber * 3; i++) {
            sizes.push(Math.random() * this.settings.pointSize);
        }
        geometry.setAttribute('size', new Float32BufferAttribute(sizes, 1));
    }

    private setColors(geometry: BufferGeometry) {
        const colors = [];
        const color = [this.settings.pointColor.r / 255, this.settings.pointColor.g / 255, this.settings.pointColor.b / 255];
        for (let i = 0; i < this.settings.pointsNumber; i++) {
            if (this.settings.randomColor) {
                colors.push(Math.random(), Math.random(), Math.random());
            } else {
                colors.push(...color);
            }
        }
        geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
    }

    private uniforms: { [uniform: string]: IUniform };

    private initMaterial(): ShaderMaterial {
       this.uniforms = {
           uTime: {value: 0},
           uPhase: {value: 0},
           uIntensity: {value: this.settings.intensity},
       };
        return new ShaderMaterial({
            uniforms: this.uniforms,
            glslVersion: GLSL3,
            vertexShader,
            fragmentShader,
            depthTest: true,
            transparent: true,
            vertexColors: true
        });
    }

    private onSettingsChanges: Map<keyof PointsWaveSettings, () => void> = new Map([
        ['pointSize', () => this.setSizes(this.points.geometry)],
        ['pointColor', () => this.setColors(this.points.geometry)],
        ['randomColor', () => this.setColors(this.points.geometry)],
        ['pointsNumber', () => {
            this.setPositions(this.points.geometry);
            this.setSizes(this.points.geometry);
            this.setColors(this.points.geometry);
        }],
        ['intensity', () => {
            this.uniforms.uIntensity.value = this.settings.intensity;
        }],
        ['shape', async () => {
            this.setPositions(this.points.geometry, await this.settings.shape.geometry)
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
