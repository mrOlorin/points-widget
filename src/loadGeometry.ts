import {BufferGeometry, Font, Matrix4, ShapeGeometry, TextGeometry, Vector3} from 'three';
import {SVGLoader} from 'three/examples/jsm/loaders/SVGLoader';
import {BufferGeometryUtils} from 'three/examples/jsm/utils/BufferGeometryUtils';
import * as fontJSONData from 'three/examples/fonts/droid/droid_sans_regular.typeface.json';

const loadSVG = async (svgText: string): Promise<BufferGeometry> => {
    const loader = new SVGLoader();
    const data = loader.parse(svgText);
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

const loadText = async (text: string): Promise<BufferGeometry> => {
    const geometry = new TextGeometry(text, {
        font: new Font(fontJSONData),
    })
    normalize(geometry);
    return geometry;
}

const normalize = (geometry: BufferGeometry) => {
    geometry.computeBoundingBox();
    const bb = geometry.boundingBox;
    const size = Math.max(bb.max.x - bb.min.x, bb.max.y - bb.min.y);
    const scale = 1 / size;
    geometry.scale(scale, scale, scale);
    geometry.computeBoundingBox();

    const translate = new Vector3();
    if (bb.min.x >= 0) {
        translate.x = -bb.min.x - bb.max.x * .5;
    }
    if (bb.max.x <= 0) {
        translate.x = -bb.max.x - bb.min.x * .5;
    }
    if (bb.min.y >= 0) {
        translate.y = -bb.min.y - bb.max.y * .5;
    }
    if (bb.max.y <= 0) {
        translate.y = -bb.max.y - bb.min.y * .5;
    }
    if (bb.min.z >= 0) {
        translate.z = -bb.min.z - bb.max.z * .5;
    }
    if (bb.max.z <= 0) {
        translate.z = -bb.max.z - bb.min.z * .5;
    }
    geometry.translate(translate.x, translate.y, translate.z);
}

export {loadSVG, loadText};
