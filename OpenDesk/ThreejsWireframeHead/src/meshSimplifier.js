import { SimplifyModifier } from "three/examples/jsm/modifiers/SimplifyModifier.js";

export default class MeshSimplifier {
  constructor({ getQuality }) {
    this.getQuality = getQuality;
    this.root = null;
    this.modifier = new SimplifyModifier();
  }

  setRoot(root) {
    this.root = root;
  }

  apply() {
    if (!this.root) return;

    const quality = this.getQuality?.() ?? 1;

    this.root.traverse((obj) => {
      if (!obj.isMesh) return;
      if (!obj.geometry) return;

      if (!obj.userData.originalGeometry) {
        obj.userData.originalGeometry = obj.geometry.clone();
      }

      const sourceGeom = obj.userData.originalGeometry.clone();
      const posAttr = sourceGeom.attributes?.position;
      if (!posAttr) return;

      const vertexCount = posAttr.count;
      const removeCount = Math.max(0, Math.floor(vertexCount * (1 - quality)));

      try {
        const simplified =
          removeCount > 0
            ? this.modifier.modify(sourceGeom, removeCount)
            : sourceGeom;
        simplified.computeVertexNormals();
        obj.geometry.dispose();
        obj.geometry = simplified;
      } catch (e) {
        console.warn(
          "Mesh simplification failed for a mesh; leaving original geometry.",
          e
        );
        obj.geometry.dispose();
        obj.geometry = sourceGeom;
      }
    });
  }
}
