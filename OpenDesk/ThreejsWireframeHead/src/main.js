import "./style.css";
import { createGui, createStatusOverlay } from "./ui.js";
import ThreeApp from "./threeApp.js";
import ModelLoader from "./modelLoader.js";
import MeshSimplifier from "./meshSimplifier.js";
import FaceTracker from "./faceTracker.js";

const params = {
  pitchOffsetDeg: 12.6,
  yOffset: -1.343,
  meshQuality: 1,
};

const statusEl = createStatusOverlay();

const appEl = document.querySelector("#app");
const threeApp = new ThreeApp(appEl);

let faceModelRoot = null;

const meshSimplifier = new MeshSimplifier({
  getQuality: () => params.meshQuality,
});

createGui(params, () => {
  meshSimplifier.apply();
});

const modelLoader = new ModelLoader({ wireMaterial: threeApp.wireMaterial });
modelLoader.load("new.glb", {
  onLoaded: (root) => {
    threeApp.trackedGroup.add(root);
    faceModelRoot = root;
    meshSimplifier.setRoot(faceModelRoot);
    threeApp.frameObject(threeApp.trackedGroup);
    meshSimplifier.apply();
    // threeApp.removeFallback();
    statusEl.textContent = "Model: OK | " + statusEl.textContent;
  },
  onError: (err) => {
    console.error(
      "Failed to load GLB. With your current code, Vite expects it at: OpenDesk/ThreejsWireframeHead/public/LeePerrySmith.glb",
      err
    );
    statusEl.textContent = "Model: FAILED (check console)";
  },
});

const faceTracker = new FaceTracker({ statusEl, params });
Promise.all([faceTracker.startWebcam(), faceTracker.initLandmarker()]).catch(
  (err) => {
    console.error(
      "Failed to initialize webcam / MediaPipe FaceLandmarker",
      err
    );
    statusEl.textContent = "Webcam/FaceLandmarker init FAILED (check console)";
  }
);

threeApp.setAnimationLoop(() => {
  if (!faceModelRoot) return;
  const q = faceTracker.update();
  if (!q) return;

  threeApp.trackedGroup.quaternion.copy(q);
  threeApp.trackedGroup.position.y = params.yOffset;
});
