import * as THREE from "three";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export default class FaceTracker {
  constructor({ statusEl, params }) {
    this.statusEl = statusEl;
    this.params = params;

    this.video = document.createElement("video");
    this.video.autoplay = true;
    this.video.playsInline = true;
    this.video.muted = true;
    this.video.style.position = "fixed";
    this.video.style.left = "0";
    this.video.style.top = "0";
    this.video.style.width = "1px";
    this.video.style.height = "1px";
    this.video.style.opacity = "0";
    document.body.appendChild(this.video);

    this.faceLandmarker = null;
    this.lastVideoTime = -1;

    this.mpMatrix = new THREE.Matrix4();
    this.mpPos = new THREE.Vector3();
    this.mpQuat = new THREE.Quaternion();
    this.mpScale = new THREE.Vector3();
    this.mpEuler = new THREE.Euler();
  }

  async startWebcam() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
      },
      audio: false,
    });
    this.video.srcObject = stream;
    await this.video.play();
    if (this.statusEl) this.statusEl.textContent = "Webcam: OK";
  }

  async initLandmarker() {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
    );

    this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
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

    if (this.statusEl)
      this.statusEl.textContent = "Webcam: OK | FaceLandmarker: OK";
  }

  update() {
    if (!this.faceLandmarker) return null;
    if (this.video.readyState < 2) return null;

    const now = performance.now();
    if (this.video.currentTime === this.lastVideoTime) return null;
    this.lastVideoTime = this.video.currentTime;

    const result = this.faceLandmarker.detectForVideo(this.video, now);
    const matrixData = result?.facialTransformationMatrixes?.[0];
    if (!matrixData?.data) return null;

    this.mpMatrix.fromArray(matrixData.data);
    this.mpMatrix.decompose(this.mpPos, this.mpQuat, this.mpScale);

    // Coordinate adjustment
    this.mpPos.z *= -1;
    this.mpQuat.x *= -1;
    this.mpQuat.y *= -1;

    this.mpEuler.setFromQuaternion(this.mpQuat, "YXZ");
    this.mpEuler.x *= -1;
    this.mpEuler.z *= -1;
    this.mpEuler.x += THREE.MathUtils.degToRad(this.params.pitchOffsetDeg);
    this.mpQuat.setFromEuler(this.mpEuler);

    return this.mpQuat;
  }
}
