import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const app = document.querySelector("#app");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

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
      scene.add(root);
      frameObject(root);
    },
    undefined,
    (err) => {
      console.error(
        "Failed to load GLB. Expected at /public/models/gltf/LeePerrySmith/LeePerrySmith.glb",
        err
      );
    }
  );
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

renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});
