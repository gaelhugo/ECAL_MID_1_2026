import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default class ModelLoader {
  constructor({ wireMaterial }) {
    this.wireMaterial = wireMaterial;
    this.loader = new GLTFLoader();
  }

  load(path, { onLoaded, onError } = {}) {
    this.loader.load(
      path,
      (gltf) => {
        const root = gltf.scene;
        root.traverse((obj) => {
          if (obj.isMesh) {
            obj.material = this.wireMaterial;
          }
        });
        onLoaded?.(root);
      },
      undefined,
      (err) => {
        onError?.(err);
      }
    );
  }
}
