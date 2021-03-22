import Renderer from './Renderer';
import PointsWave, {defaultOptions} from './PointsWave/PointsWave';
import {PointsWaveUI} from "./PointsWave/PointsWaveUI";

const renderer = new Renderer();
document.body.appendChild(renderer.domElement);

const wave = new PointsWave(defaultOptions);

renderer.scene = wave.scene;
renderer.camera.position.set(0, 0, 1);

const ui = new PointsWaveUI(wave, renderer);
ui.show();

wave.run(Infinity);





