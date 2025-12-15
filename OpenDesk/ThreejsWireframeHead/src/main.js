import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import GUI from "lil-gui";

const app = document.querySelector("#app");

const statusEl = document.createElement("div");
statusEl.style.position = "fixed";
statusEl.style.left = "12px";
statusEl.style.top = "12px";
statusEl.style.fontFamily = "system-ui, sans-serif";
statusEl.style.fontSize = "12px";
statusEl.style.color = "#fff";
statusEl.style.background = "rgba(0,0,0,0.5)";
statusEl.style.padding = "8px 10px";
statusEl.style.borderRadius = "6px";
statusEl.style.zIndex = "10";
statusEl.textContent = "Starting…";
document.body.appendChild(statusEl);

const params = {
  pitchOffsetDeg: 0,
  yOffset: 0,
};

const gui = new GUI({ title: "Face Mapping" });
gui.add(params, "pitchOffsetDeg", -90, 90, 0.1).name("Pitch Offset (deg)");
gui.add(params, "yOffset", -2, 2, 0.001).name("Y Offset");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const trackedGroup = new THREE.Group();
scene.add(trackedGroup);

scene.add(new THREE.AxesHelper(1));

const fallbackMesh = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 0.5, 0.5),
  new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
);
fallbackMesh.name = "fallback";
scene.add(fallbackMesh);

const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 2000);
camera.position.set(0, 0, 3);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
app.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const wireMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  wireframe: true,
});

let faceModelRoot = null;

const video = document.createElement("video");
video.autoplay = true;
video.playsInline = true;
video.muted = true;
video.style.position = "fixed";
video.style.left = "0";
video.style.top = "0";
video.style.width = "1px";
video.style.height = "1px";
video.style.opacity = "0";
document.body.appendChild(video);

let faceLandmarker = null;
let lastVideoTime = -1;

async function startWebcam() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: "user",
    },
    audio: false,
  });
  video.srcObject = stream;
  await video.play();
  statusEl.textContent = "Webcam: OK";
}

async function initFaceLandmarker() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
  );

  faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numFaces: 1,
    outputFaceBlendshapes: false,
    outputFacialTransformationMatrixes: true,
  });

  statusEl.textContent = "Webcam: OK | FaceLandmarker: OK";
}

function frameObject(object3d) {
  const box = new THREE.Box3().setFromObject(object3d);
  if (box.isEmpty()) return;

  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  object3d.position.sub(center);

  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = THREE.MathUtils.degToRad(camera.fov);
  const distance = maxDim / (2 * Math.tan(fov / 2));

  camera.position.set(0, 0, distance * 1.4);
  camera.near = distance / 100;
  camera.far = distance * 100;
  camera.updateProjectionMatrix();

  controls.target.set(0, 0, 0);
  controls.update();
}

function loadLeePerrySmith() {
  const loader = new GLTFLoader();
  loader.load(
    "LeePerrySmith.glb",
    (gltf) => {
      const root = gltf.scene;
      root.traverse((obj) => {
        if (obj.isMesh) {
          obj.material = wireMaterial;
        }
      });
      trackedGroup.add(root);
      faceModelRoot = root;
      frameObject(trackedGroup);

      const existingFallback = scene.getObjectByName("fallback");
      if (existingFallback) scene.remove(existingFallback);
      statusEl.textContent = "Model: OK | " + statusEl.textContent;
    },
    undefined,
    (err) => {
      console.error(
        "Failed to load GLB. With your current code, Vite expects it at: OpenDesk/ThreejsWireframeHead/public/LeePerrySmith.glb",
        err
      );
      statusEl.textContent = "Model: FAILED (check console)";
    }
  );
}

const mpMatrix = new THREE.Matrix4();
const mpPos = new THREE.Vector3();
const mpQuat = new THREE.Quaternion();
const mpScale = new THREE.Vector3();
const mpEuler = new THREE.Euler();

function applyFaceTransform() {
  if (!faceLandmarker) return;
  if (!faceModelRoot) return;
  if (video.readyState < 2) return;

  const now = performance.now();
  if (video.currentTime === lastVideoTime) return;
  lastVideoTime = video.currentTime;

  const result = faceLandmarker.detectForVideo(video, now);
  const matrixData = result?.facialTransformationMatrixes?.[0];
  if (!matrixData?.data) return;

  // MediaPipe provides a 4x4 matrix (column-major) in camera space.
  // We convert it to Three.js and apply it to a parent group.
  mpMatrix.fromArray(matrixData.data);
  mpMatrix.decompose(mpPos, mpQuat, mpScale);

  // Empirical coordinate adjustment: MediaPipe camera space differs from Three.
  // Negating Z usually aligns the forward axis.
  mpPos.z *= -1;
  mpQuat.x *= -1;
  mpQuat.y *= -1;

  // Pitch (looking up/down) is inverted for your setup.
  // Fix it explicitly by flipping the Euler X angle and recomposing a quaternion.
  mpEuler.setFromQuaternion(mpQuat, "YXZ");
  mpEuler.x *= -1;
  mpEuler.z *= -1;
  mpEuler.x += THREE.MathUtils.degToRad(params.pitchOffsetDeg);
  mpQuat.setFromEuler(mpEuler);

  // Keep position/scale stable for now (prevents the model from flying away / scaling to ~0).
  // Only apply rotation, which is usually what you want for a first “face mapped to model” step.
  trackedGroup.quaternion.copy(mpQuat);
  trackedGroup.position.y = params.yOffset;
}

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}

window.addEventListener("resize", resize);
resize();
loadLeePerrySmith();

Promise.all([startWebcam(), initFaceLandmarker()]).catch((err) => {
  console.error("Failed to initialize webcam / MediaPipe FaceLandmarker", err);
  statusEl.textContent = "Webcam/FaceLandmarker init FAILED (check console)";
});

renderer.setAnimationLoop(() => {
  controls.update();
  applyFaceTransform();
  renderer.render(scene, camera);
});
