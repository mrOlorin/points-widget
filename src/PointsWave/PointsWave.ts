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

interface PointsWaveOptions {
    pointSize: number;
    pointsNumber: number;
    wobbliness: number;
    intensity: number;
    speed: number;
    randomColor: boolean;
    pointColor: Color;
    geometry?: Promise<BufferGeometry>;
}

export const defaultOptions: PointsWaveOptions = {
    pointSize: 10,
    pointsNumber: 10000,
    wobbliness: 1,
    intensity: 1,
    speed: 1,
    randomColor: true,
    pointColor: new Color(255, 80, 0),
}

export default class PointsWave {
    public readonly scene: Scene = new Scene();
    private readonly points: Points = new Points();
    public readonly options: PointsWaveOptions;
    private readonly initialOptions: PointsWaveOptions;
    public phase: number = 0;
    public cyclesLeft: number = 0;

    private onOptionChanges: Map<keyof PointsWaveOptions, () => void> = new Map([
        ['pointSize', () => this.setSizes(this.points.geometry)],
        ['pointColor', () => this.setColors(this.points.geometry)],
        ['randomColor', () => this.setColors(this.points.geometry)],
        ['pointsNumber', () => {
            this.setPositions(this.points.geometry);
            this.setSizes(this.points.geometry);
            this.setColors(this.points.geometry);
        }],
    ]);

    public constructor(options: PointsWaveOptions = defaultOptions) {
        this.initialOptions = Object.create(options);
        this.options = this.initOptionsProxy(options);
        this.buildPoints();
        this.scene.add(this.points);
    }

    public resetOptions() {
        console.log(this.options.pointSize, this.initialOptions.pointSize);
        Object.assign(this.options, this.initialOptions);
    }

    public async run(times: number = 1) {
        return new Promise<void>((resolve) => {
            this.cyclesLeft += times;
            const animate = () => {
                if (this.phase >= 2 * Math.PI) {
                    this.phase = 0;
                    this.cyclesLeft--;
                }
                if (this.cyclesLeft > 0) {
                    this.phase += this.options.speed * .02;
                    requestAnimationFrame(animate);
                } else {
                    return resolve();
                }
            }
            if (this.cyclesLeft === times) {
                animate();
            }
        });
    };

    public stop() {
        this.cyclesLeft = 0;
    }

    private initOptionsProxy(options: PointsWaveOptions): PointsWaveOptions {
        options.pointColor = new Proxy(options.pointColor, {
            get: (target: Color, prop: keyof Color, receiver) => {
                return Reflect.get(target, prop, receiver);
            },
            set: (target: Color, prop: keyof Color, receiver) => {
                const result = Reflect.set(target, prop, receiver);
                if (!options.randomColor) {
                    this.onOptionChanges.get('pointColor')();
                }
                return result;
            },
        });
        return new Proxy(options, {
            get: (target: PointsWaveOptions, prop: keyof PointsWaveOptions, receiver) => {
                return Reflect.get(target, prop, receiver);
            },
            set: (target: PointsWaveOptions, prop: keyof PointsWaveOptions, receiver) => {
                const result = Reflect.set(target, prop, receiver);
                if (this.onOptionChanges.has(prop)) {
                    this.onOptionChanges.get(prop)();
                }
                return result;
            },
        });
    }

    private async buildPoints(): Promise<void> {
        this.points.geometry = await this.initGeometry(await this.options.geometry);
        this.points.material = this.initMaterial() as ShaderMaterial;
        this.points.onBeforeRender = () => {
            (this.points.material as ShaderMaterial).uniforms.uTime.value = performance.now() * .001;
            // TODO: Move into onOptionChanges
            (this.points.material as ShaderMaterial).uniforms.uWobbliness.value = this.options.wobbliness;
            (this.points.material as ShaderMaterial).uniforms.uIntensity.value = this.options.intensity;
            // TODO: Add phase proxy
            (this.points.material as ShaderMaterial).uniforms.uPhase.value = this.phase;
        }
    }

    private async initGeometry(shape?: BufferGeometry) {
        const geometry = new BufferGeometry();
        await this.setPositions(geometry, shape);
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

        for (let i = 0; i < this.options.pointsNumber; i++) {
            const offset = i * 3;
            const point = getPoint();
            positions[offset] = point[0];
            positions[offset+1] = point[1];
            positions[offset+2] = point[2];
        }

        geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    }

    private setSizes(geometry: BufferGeometry) {
        const sizes = [];
        for (let i = 0; i < this.options.pointsNumber * 3; i++) {
            sizes.push(Math.random() * this.options.pointSize);
        }
        geometry.setAttribute('size', new Float32BufferAttribute(sizes, 1));
    }

    private setColors(geometry: BufferGeometry) {
        const colors = [];
        const color = [this.options.pointColor.r / 255, this.options.pointColor.g / 255, this.options.pointColor.b / 255];
        for (let i = 0; i < this.options.pointsNumber; i++) {
            if (this.options.randomColor) {
                colors.push(Math.random(), Math.random(), Math.random());
            } else {
                colors.push(...color);
            }
        }
        geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
    }

    private initMaterial(): ShaderMaterial {
        return new ShaderMaterial({
            uniforms: {
                uTime: {value: 0},
                uPhase: {value: 0},
                uWobbliness: {value: this.options.wobbliness},
                uIntensity: {value: this.options.intensity},
            },
            glslVersion: GLSL3,
            vertexShader,
            fragmentShader,
            depthTest: true,
            transparent: true,
            vertexColors: true
        });
    }

}
