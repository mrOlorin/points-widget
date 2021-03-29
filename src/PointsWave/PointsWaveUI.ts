import Tweakpane from "tweakpane";
import PointsWave from "./PointsWave";
import Renderer from "../Renderer";
import geometries from "./geometries";

export class PointsWaveUI {
    private tweakpane = new Tweakpane();

    public constructor(private pointsWave: PointsWave, private renderer: Renderer) {
        renderer.domElement.addEventListener('dblclick', () => this.tweakpane.hidden = !this.tweakpane.hidden);

        const settingsFolder = this.tweakpane.addFolder({title: 'Настройки', expanded: true});

        const geometryFolder = settingsFolder.addFolder({title: 'Геометрия', expanded: true});

        const geometry = {i: 0, options: geometries};
        const geometryOptions = geometry.options.map((option, i) => ({value: i, text: option.name}));
        let shapeOptions: Array<any> = [];
        geometryFolder.addInput(geometry, 'i', {label: 'Выбрать', options: geometryOptions})
            .on('change', async (i: number) => {
                const options = geometry.options[i].options;
                const setShape = async () => pointsWave.settings.shape = {
                    geometry: await geometry.options[i].build(options?.value),
                    settings: options?.value
                };
                await setShape();
                shapeOptions.forEach(i => i.dispose());
                if (options?.params) {
                    for (const param of Object.keys(options.params)) {
                        const input = geometryFolder.addInput(options.value, param, options.params[param])
                            .on('change', async (newValue) => {
                                options.value[param] = newValue;
                                await setShape();
                            });
                        shapeOptions.push(input);
                    }
                }
            });

        settingsFolder.addInput(pointsWave.settings, 'pointsNumber', {label: 'Количество', min: 1e2, max: 1e5, step: 1});
        settingsFolder.addInput(pointsWave.settings, 'pointSize', {label: 'Размер', min: 1, max: 200});
        settingsFolder.addInput(pointsWave.settings, 'intensity', {label: 'Интенсивность', min: 0, max: 3});

        const colorFolder = settingsFolder.addFolder({title: 'Цвет', expanded: false});
        colorFolder.addInput(pointsWave.settings, 'randomColor', {label: 'Случайный'});
        // noinspection SillyAssignmentJS
        const sillyAssignment = () => pointsWave.settings.pointColor = pointsWave.settings.pointColor;
        colorFolder.addInput(pointsWave.settings, 'pointColor', {label: 'Цвет'})
            .on('change', sillyAssignment);

        const cameraFolder = settingsFolder.addFolder({title: 'Камера', expanded: false});
        const cameraPositionInput = cameraFolder.addInput(this.renderer.camera, 'position', {label: 'Координаты'});
        const cameraRotationInput = cameraFolder.addInput(this.renderer.camera, 'rotation', {label: 'Углы Эйлера'});
        const defaultCamera = this.renderer.camera.clone();
        cameraFolder.addButton({title: 'Сбросить камеру'})
            .on('click', async () => {
                this.renderer.camera.position.copy(defaultCamera.position);
                this.renderer.camera.rotation.copy(defaultCamera.rotation);
            });

        settingsFolder.addInput(pointsWave.settings, 'speed', {label: 'Скорость', min: 0, max: 5});
        const phaseInput = settingsFolder.addInput(pointsWave, 'phase', {label: 'Фаза', min: 0, max: Math.PI});

        settingsFolder.addButton({title: 'Стоп/Старт'}).on('click', () => {
            if (pointsWave.stepsLeft === 0) {
                pointsWave.run(Infinity);
            } else {
                pointsWave.stop();
            }
        });

        const updateInputs = () => {
            requestAnimationFrame(() => {
                cameraPositionInput.refresh();
                cameraRotationInput.refresh();
                phaseInput.refresh();
                updateInputs();
            });
        }
        updateInputs();

    }

    public show() {
        this.tweakpane.hidden = false;
    }

    public hide() {
        this.tweakpane.hidden = true;
    }
}
