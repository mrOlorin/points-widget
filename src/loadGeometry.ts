import {BufferGeometry, Matrix4, ShapeGeometry, Vector3} from 'three';
import {SVGLoader} from 'three/examples/jsm/loaders/SVGLoader';
import {BufferGeometryUtils} from 'three/examples/jsm/utils/BufferGeometryUtils';

const loadGeometry = async (resourceUrl: string): Promise<BufferGeometry> => {
    return loadSVG(resourceUrl);
}

const loadSVG = async (resourceUrl: string): Promise<BufferGeometry> => {
    const loader = new SVGLoader();
    loader.setCrossOrigin('anonymous');
    const data = await loader.loadAsync(resourceUrl);
    const paths = data.paths;
    const geometries: Array<ShapeGeometry> = [];

    for (let i = 0; i < paths.length; i++) {
        const shapes = paths[i].toShapes(true);
        for (let j = 0, len = shapes.length; j < len; j++) {
            const shapeGeometry = new ShapeGeometry(shapes[j]);
            geometries.push(shapeGeometry);
        }
    }

    const geometry = BufferGeometryUtils.mergeBufferGeometries(geometries);

    // geometry.applyMatrix4(new Matrix4().makeScale(-1, 1, 1));
    geometry.applyMatrix4(new Matrix4().makeScale(1, -1, 1));
    // geometry.applyMatrix4(new Matrix4().makeScale(1, 1, -1));

    normalize(geometry);
    return geometry.toNonIndexed();
}

const normalize = (geometry: BufferGeometry) => {
    geometry.computeBoundingBox();
    const size = Math.max(geometry.boundingBox.max.x - geometry.boundingBox.min.x, geometry.boundingBox.max.y - geometry.boundingBox.min.y);
    const scale = 1 / size;
    geometry.scale(scale, scale, scale);
    geometry.computeBoundingBox();

    const translate = new Vector3();
    if (geometry.boundingBox.min.x >= 0) {
        translate.x = -geometry.boundingBox.min.x - geometry.boundingBox.max.x * .5;
    }
    if (geometry.boundingBox.max.x <= 0) {
        translate.x = -geometry.boundingBox.max.x - geometry.boundingBox.min.x * .5;
    }
    if (geometry.boundingBox.min.y >= 0) {
        translate.y = -geometry.boundingBox.min.y - geometry.boundingBox.max.y * .5;
    }
    if (geometry.boundingBox.max.y <= 0) {
        translate.y = -geometry.boundingBox.max.y - geometry.boundingBox.min.y * .5;
    }
    if (geometry.boundingBox.min.z >= 0) {
        translate.z = -geometry.boundingBox.min.z - geometry.boundingBox.max.z * .5;
    }
    if (geometry.boundingBox.max.z <= 0) {
        translate.z = -geometry.boundingBox.max.z - geometry.boundingBox.min.z * .5;
    }
    geometry.translate(translate.x, translate.y, translate.z);
}

export {loadGeometry, loadSVG};
