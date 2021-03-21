import Renderer from './Renderer';
import PointsWave, {defaultOptions} from './PointsWave/PointsWave';
import Tweakpane from 'tweakpane';
import {loadSVG} from './loadGeometry';

const renderer = new Renderer();
document.body.appendChild(renderer.domElement);

const options = defaultOptions;
options.geometry = loadSVG('./assets/donatty.svg');

const wave = new PointsWave(options);
wave.run(Infinity);

renderer.scene = wave.scene;
renderer.camera.position.set(0, 0, 1);


const tweakpane = new Tweakpane();
const settingsFolder = tweakpane.addFolder({
    title: 'Настройки',
    expanded: false,
});

settingsFolder.addInput(wave.options, 'pointsNumber', {
    label: 'Количество',
    min: 1e2,
    max: 1e5,
});
settingsFolder.addInput(wave.options, 'pointSize', {
    label: 'Размер',
    min: 1,
    max: 200,
});
settingsFolder.addInput(wave.options, 'wobbliness', {
    label: 'Wobbliness',
    min: 0,
    max: 3,
});
settingsFolder.addInput(wave.options, 'intensity', {
    label: 'Интенсивность',
    min: 0,
    max: 3,
});
const colorFolder = settingsFolder.addFolder({title: 'Цвет', expanded: false});
colorFolder.addInput(wave.options, 'randomColor', {label: 'Случайный'});
colorFolder.addInput(wave.options, 'pointColor', {label: 'Цвет'});

const cameraFolder = settingsFolder.addFolder({title: 'Камера', expanded: false});
const cameraPositionInput = cameraFolder.addInput(renderer.camera, 'position', {label: 'Координаты'});
const cameraRotationInput = cameraFolder.addInput(renderer.camera, 'rotation', {label: 'Углы Эйлера'});
const defaultCamera = renderer.camera.clone();
cameraFolder.addButton({
    title: 'Сбросить камеру',
}).on('click', async () => {
    renderer.camera.position.copy(defaultCamera.position);
    renderer.camera.rotation.copy(defaultCamera.rotation);
});

settingsFolder.addInput(wave.options, 'speed', {
    label: 'Скорость',
    min: 0,
    max: 5,
});
const phaseInput = settingsFolder.addInput(wave, 'phase', {
    label: 'Фаза',
    min: 0,
    max: Math.PI * 2,
});

settingsFolder.addButton({title: 'Стоп/Старт'}).on('click', () => {
    if (wave.cyclesLeft === 0) {
        wave.run(Infinity);
    } else {
        wave.stop();
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