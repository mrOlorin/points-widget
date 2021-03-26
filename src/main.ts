import Renderer from './Renderer';
import PointsWave, {defaultSettings} from './PointsWave/PointsWave';
import {PointsWaveUI} from "./PointsWave/PointsWaveUI";
import geometries from "./PointsWave/geometries";

const renderer = new Renderer();
document.body.appendChild(renderer.domElement);
renderer.camera.position.set(0, 0, 1);

(async () => {
    const shape = geometries.find(g => g.name === "Текст");
    defaultSettings.shape = {
        geometry: await shape.build(shape.options.value),
        settings: shape.options.value,
    }

    const wave = new PointsWave(defaultSettings);
    renderer.scene = wave.scene;
    const ui = new PointsWaveUI(wave, renderer);
    ui.show();
    wave.run(Infinity);
})();
