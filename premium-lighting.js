import * as T from 'three';
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js';

const skyURL = new URL('./premium-sky.hdr', import.meta.url);
const reflectionsURL = new URL('./premium-reflections.webp', import.meta.url);
const skyRotation = Math.PI;

export async function loadSky(scene) {
    // The half-turn puts the photographed sun in the south-west, matching the key light.
    const sky = await new RGBELoader().loadAsync(skyURL.href);
    sky.mapping = T.EquirectangularReflectionMapping;
    scene.background = sky;
    scene.backgroundRotation.y = skyRotation;
    scene.backgroundIntensity = .83;
    return sky;
}

export async function loadReflectionAtlas() {
    const image = await new T.ImageLoader().loadAsync(reflectionsURL.href);
    const size = image.width / 6;
    if (!Number.isInteger(size) || image.height !== size * 2) {
        throw new Error('Invalid façade reflection atlas');
    }
    // Rows are the street and court. Columns follow Three.js cube face order ±X, ±Y, ±Z.
    return [0, 1].map(row => {
        const faces = Array.from({length: 6}, (_, col) => {
            const face = document.createElement('canvas');
            face.width = face.height = size;
            face.getContext('2d').drawImage(image, size * col, size * row, size, size, 0, 0, size, size);
            return face;
        });
        const cube = new T.CubeTexture(faces);
        cube.colorSpace = T.SRGBColorSpace;
        cube.needsUpdate = true;
        return cube;
    });
}

export function configureWindowReflections(streetMaterials, courtMaterials, atlas, sky) {
    for (const [i, materials] of [streetMaterials, courtMaterials].entries()) {
        for (const mat of materials) {
            mat.envMap = atlas?.[i] ?? sky;
            mat.envMapRotation.y = atlas ? 0 : skyRotation;
            mat.needsUpdate = true;
        }
    }
}
