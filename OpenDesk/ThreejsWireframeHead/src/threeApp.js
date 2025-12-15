import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default class ThreeApp {
  constructor(containerEl) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    this.trackedGroup = new THREE.Group();
    this.trackedGroup.position.set(0, -1.343, 0);
    this.scene.add(this.trackedGroup);

    // this.scene.add(new THREE.AxesHelper(1));

    // this.fallbackMesh = new THREE.Mesh(
    //   new THREE.BoxGeometry(0.5, 0.5, 0.5),
    //   new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
    // );
    // this.fallbackMesh.name = "fallback";
    // this.scene.add(this.fallbackMesh);

    this.camera = new THREE.PerspectiveCamera(50, 1, 0.01, 2000);
    this.camera.position.set(0, 0, 3);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerEl.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

    this.wireMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
    });

    this._tmpBox = new THREE.Box3();
    this._tmpSize = new THREE.Vector3();
    this._tmpCenter = new THREE.Vector3();

    this.resize = this.resize.bind(this);
    window.addEventListener("resize", this.resize);
    this.resize();
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  frameObject(object3d) {
    const box = this._tmpBox.setFromObject(object3d);
    if (box.isEmpty()) return;

    const size = box.getSize(this._tmpSize);
    const center = box.getCenter(this._tmpCenter);

    object3d.position.sub(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = THREE.MathUtils.degToRad(this.camera.fov);
    const distance = maxDim / (2 * Math.tan(fov / 2));

    this.camera.position.set(0, 0, distance * 1.4);
    this.camera.near = distance / 100;
    this.camera.far = distance * 100;
    this.camera.updateProjectionMatrix();

    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  // removeFallback() {
  //   const existingFallback = this.scene.getObjectByName("fallback");
  //   if (existingFallback) this.scene.remove(existingFallback);
  // }

  setAnimationLoop(cb) {
    this.renderer.setAnimationLoop(() => {
      this.controls.update();
      cb?.();
      this.renderer.render(this.scene, this.camera);
    });
  }
}
