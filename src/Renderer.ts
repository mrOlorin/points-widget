import {PerspectiveCamera, Scene, WebGLRenderer} from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {CSS3DRenderer} from 'three/examples/jsm/renderers/CSS3DRenderer';

export default class Renderer {
    private tanFOV: number;
    public readonly domElement: HTMLElement;
    public readonly webGLRenderer: WebGLRenderer;
    public readonly css3DRenderer: CSS3DRenderer;
    public camera: PerspectiveCamera;
    public controls: OrbitControls;
    public scene: Scene;

    public constructor() {
        this.webGLRenderer = Renderer.initWebGLRenderer();
        this.css3DRenderer = Renderer.initCSS3DRenderer();
        this.domElement = Renderer.initDOMElement(this.webGLRenderer, this.css3DRenderer);
        this.initCamera();
        window.addEventListener('resize', this.onWindowResize, false);
        this.onWindowResize();
        this.initRenderLoop();
    }

    private animate() {
        if (this.scene) {
            this.webGLRenderer.render(this.scene, this.camera);
            this.css3DRenderer.render(this.scene as Scene, this.camera);
        }
        this.controls.update();
    }

    private initRenderLoop() {
        const render = () => {
            this.animate();
            requestAnimationFrame(render);
        }
        render();
    }

    private onWindowResize = () => {
        const targetWindowHeight = 1080;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.fov = (360 / Math.PI) * Math.atan(this.tanFOV * (window.innerHeight / targetWindowHeight));
        this.camera.updateProjectionMatrix();
        this.webGLRenderer.setSize(window.innerWidth, window.innerHeight);
        this.css3DRenderer.setSize(window.innerWidth, window.innerHeight);
    }

    private initCamera() {
        this.camera = new PerspectiveCamera();
        this.camera.far = 1e9;
        this.camera.near = 1e-9;
        this.tanFOV = Math.tan((Math.PI / 180) * this.camera.fov / 2);

        this.controls = new OrbitControls(this.camera, this.css3DRenderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = .1;
    }

    private static initDOMElement(webGLRenderer: WebGLRenderer, css3DRenderer: CSS3DRenderer): HTMLElement {
        const domElement = document.createElement('div');
        const webglContainer = document.createElement('div');
        const cssContainer = document.createElement('div');
        webglContainer.appendChild(webGLRenderer.domElement);
        cssContainer.appendChild(css3DRenderer.domElement);
        domElement.appendChild(webglContainer);
        domElement.appendChild(cssContainer);
        return domElement;
    }

    private static initWebGLRenderer(): WebGLRenderer {
        const webGLRenderer = new WebGLRenderer({
            alpha: true,
            antialias: true,
            logarithmicDepthBuffer: true,
        });
        webGLRenderer.setClearColor(0x000000, 0);
        webGLRenderer.setPixelRatio(window.devicePixelRatio);

        webGLRenderer.domElement.style.position = 'absolute';
        webGLRenderer.domElement.style.top = '0';
        webGLRenderer.domElement.style.bottom = '0';
        webGLRenderer.domElement.style.left = '0';
        return webGLRenderer;

    }

    private static initCSS3DRenderer(): CSS3DRenderer {
        const css3DRenderer = new CSS3DRenderer();
        css3DRenderer.setSize(window.innerWidth, window.innerHeight);
        css3DRenderer.domElement.style.position = 'absolute';
        css3DRenderer.domElement.style.top = '0';
        css3DRenderer.domElement.style.bottom = '0';
        css3DRenderer.domElement.style.left = '0';
        return css3DRenderer;
    }

}
