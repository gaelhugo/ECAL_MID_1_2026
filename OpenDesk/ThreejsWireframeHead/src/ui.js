import GUI from "lil-gui";

export function createStatusOverlay() {
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
  return statusEl;
}

export function createGui(params, onParamsChanged) {
  const gui = new GUI({ title: "Face Mapping" });
  gui.add(params, "pitchOffsetDeg", -90, 90, 0.1).name("Pitch Offset (deg)");
  gui.add(params, "yOffset", -2, 2, 0.001).name("Y Offset");
  gui
    .add(params, "meshQuality", 0.05, 1, 0.01)
    .name("Mesh Quality")
    .onChange(() => onParamsChanged?.());
  return gui;
}
