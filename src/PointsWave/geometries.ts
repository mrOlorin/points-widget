import {
    BoxGeometry, BufferGeometry, CircleGeometry, ConeGeometry, CylinderGeometry, ParametricGeometry
} from "three";
import {loadSVG, loadText} from "../loadGeometry";
import {ParametricGeometries} from 'three/examples/jsm/geometries/ParametricGeometries';
import {InputParams} from "tweakpane/lib/api/types";

interface GeometryOption {
    text: string;
    build: (options?: any) => BufferGeometry | Promise<BufferGeometry>;
    options?: {
        value: { [paramName: string]: any };
        params: { [key: string]: InputParams }
    }
}

const geometries: Array<GeometryOption> = [
    {
        text: 'Не определена',
        build: () => null,
    },
    {
        text: 'Текст',
        build: (params) => {
            return loadText(params.text);
        },
        options: {
            value: {
                text: "Wazzuuup",
            },
            params: {
                text: {
                    label: 'Текст',
                },
            },
        },
    },
    {
        text: 'Згрузить SVG',
        build: async () => {
            return new Promise<BufferGeometry>(resolve => {
                const fileInput = document.createElement('input') as HTMLInputElement;
                fileInput.setAttribute('type', 'file');
                fileInput.click();
                fileInput.addEventListener('change', () => {
                    const fileReader = new FileReader();
                    fileReader.readAsText(fileInput.files[0]);
                    fileReader.addEventListener('loadend', async () => {
                        resolve(await loadSVG(fileReader.result as string));
                    });
                });
            });
        },
    },
    {
        text: 'Куб',
        build: (params) => new BoxGeometry(params.width, params.height, params.depth),
        options: {
            value: {
                width: .5,
                height: .5,
                depth: .5,
            },
            params: {
                width: {
                    label: 'Ширина',
                    min: 0.01,
                    max: 3,
                },
                height: {
                    label: 'Высота',
                    min: 0.01,
                    max: 3,
                },
                depth: {
                    label: 'Глубина',
                    min: 0.01,
                    max: 3,
                },
            },
        },
    },
    {
        text: 'Диск',
        build: (params) => new CircleGeometry(params.radius, params.height),
        options: {
            value: {
                radius: .3,
                height: 64,
            },
            params: {
                radius: {
                    label: 'радиус',
                    min: 0.1,
                    max: 5,
                },
                height: {
                    label: 'Количество сегментов',
                    min: 2,
                    max: 64,
                    step: 2,
                },
            },
        },
    },
    {
        text: 'Конус',
        build: (params) => new ConeGeometry(params.radius, params.height),
        options: {
            value: {
                radius: .3,
                height: .6,
            },
            params: {
                radius: {
                    label: 'Радиус',
                    min: 0.1,
                    max: 5,
                },
                height: {
                    label: 'Высота',
                    min: .1,
                    max: 3,
                },
            },
        },
    },
    {
        text: 'Цилиндр',
        build: (params) => new CylinderGeometry(params.radiusTop, params.radiusBottom, params.height, 64, 64),
        options: {
            value: {
                radiusTop: .3,
                radiusBottom: .3,
                height: .5,
            },
            params: {
                radiusTop: {
                    label: 'Верхний радиус',
                    min: 0.1,
                    max: 5,
                },
                radiusBottom: {
                    label: 'Нижний радиус',
                    min: 0.1,
                    max: 5,
                },
                height: {
                    label: 'Высота',
                    min: .1,
                    max: 3,
                },
            }
        }
    },
    {
        text: 'Бутылка Клейна',
        build: (params) => new ParametricGeometry(ParametricGeometries.klein, params.slices, params.stacks)
            .scale(params.scale, params.scale, params.scale)
            .rotateX(-90),
        options: {
            value: {
                scale: .03,
                slices: 25,
                stacks: 25,
            },
            params: {
                slices: {
                    label: 'Slices',
                    min: 1,
                    max: 50,
                    step: 1,
                },
                stacks: {
                    label: 'Stacks',
                    min: 1,
                    max: 50,
                    step: 1,
                },
                scale: {
                    label: 'Размер',
                    min: .01,
                    max: .1,
                },
            }
        }
    },

]

export default geometries;
