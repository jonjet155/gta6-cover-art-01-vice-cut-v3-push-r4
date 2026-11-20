// VICE CUT — studio editor. Wires the poster renderer to the 3-step flow:
// 1 uploadPhoto / cropPhoto / positionPhoto, 2 pickGrade / pickPosterStyle /
// editTitle / editTagline / editBilling, 3 exportPNG. State lives in one object;
// every change re-renders the live preview through drawPoster.

const SAMPLES = [
  { id: "hero", file: "samples/hero.jpg", label: "Golden smile", focusX: 0.36, focusY: 0.30, zoom: 1.15 },
  { id: "closeup", file: "samples/closeup.jpg", label: "Sunset close-up", focusX: 0.42, focusY: 0.45, zoom: 1.0 },
  { id: "curly", file: "samples/curly.jpg", label: "Curly gold", focusX: 0.55, focusY: 0.34, zoom: 1.1 },
  { id: "blond", file: "samples/blond.jpg", label: "Blond dusk", focusX: 0.62, focusY: 0.36, zoom: 1.3 },
  { id: "shades", file: "samples/shades.jpg", label: "City shades", focusX: 0.50, focusY: 0.30, zoom: 1.15 },
  { id: "dusk", file: "samples/dusk.jpg", label: "Ember dusk", focusX: 0.60, focusY: 0.34, zoom: 1.1 },
];

const state = {
  photo: null,
  photoId: "hero",
  photoName: "hero.jpg",
  zoom: 1.15,
  panX: 0,
  panY: 0,
  focusX: 0.36,
  focusY: 0.30,
  grade: "sunset",
  style: "fullbleed",
  title: "VICE CUT",
  tagline: "Painted in Leonida.",
  billing: "A LEONIDA STORY — ONE COAST · NO RULES · COMING SOON",
  stars: true,
  badge: true,
  size: "1920x1080",
};

const canvas = document.getElementById("posterCanvas");
let renderQueued = false;

function renderPreview() {
  // One render per animation frame, however many controls moved.
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => {
    renderQueued = false;
    drawPoster(canvas, state);
  });
}

function renderPreviewNow() {
  drawPoster(canvas, state);
}

function loadSample(sampleId) {
  const sample = SAMPLES.find((s) => s.id === sampleId) || SAMPLES[0];
  const img = new Image();
  img.onload = () => {
    state.photo = img;
    state.photoId = sample.id;
    state.photoName = sample.file.split("/").pop();
    state.focusX = sample.focusX;
    state.focusY = sample.focusY;
    state.zoom = sample.zoom;
    state.panX = 0;
    state.panY = 0;
    syncCropControls();
    markActiveSample(sample.id);
    renderPreview();
  };
  img.onerror = () => {
    state.photo = null;
    renderPreview();
  };
  img.src = sample.file;
}

function uploadPhoto(file) {
  if (!file || !file.type || file.type.indexOf("image/") !== 0) return;
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    state.photo = img;
    state.photoId = "upload";
    state.photoName = file.name || "upload.jpg";
    state.focusX = 0.5;
    state.focusY = 0.38;
    state.zoom = 1.0;
    state.panX = 0;
    state.panY = 0;
    syncCropControls();
    markActiveSample(null);
    renderPreview();
    URL.revokeObjectURL(url);
  };
  img.onerror = () => URL.revokeObjectURL(url);
  img.src = url;
}

function cropPhoto(newZoom) {
  // Zoom slider: keep the face huge (1x to 3x).
  state.zoom = Math.min(3, Math.max(1, Number(newZoom) || 1));
  renderPreview();
}

function positionPhoto(dx, dy) {
  // Drag pan, in fractions of the cover size.
  state.panX += dx;
  state.panY += dy;
  state.panX = Math.max(-0.6, Math.min(0.6, state.panX));
  state.panY = Math.max(-0.6, Math.min(0.6, state.panY));
  renderPreview();
}

function fitFace() {
  // Reset to the sample's tuned face framing.
  const sample = SAMPLES.find((s) => s.id === state.photoId);
  if (sample) {
    state.focusX = sample.focusX;
    state.focusY = sample.focusY;
    state.zoom = sample.zoom;
  } else {
    state.focusX = 0.5;
    state.focusY = 0.38;
    state.zoom = 1.2;
  }
  state.panX = 0;
  state.panY = 0;
  syncCropControls();
  renderPreview();
}

function pickGrade(gradeKey) {
  if (!POSTER_GRADES[gradeKey]) return;
  state.grade = gradeKey;
  document.querySelectorAll("#gradeRow .chip").forEach((chip) => {
    chip.classList.toggle("is-active", chip.dataset.grade === gradeKey);
  });
  renderPreview();
}

function pickPosterStyle(styleKey) {
  if (!POSTER_STYLES[styleKey]) return;
  state.style = styleKey;
  document.querySelectorAll("#styleRow .chip").forEach((chip) => {
    chip.classList.toggle("is-active", chip.dataset.style === styleKey);
  });
  renderPreview();
}

function editTitle(text) {
  state.title = (text || "").trim() || "VICE CUT";
  renderPreview();
}

function editTagline(text) {
  state.tagline = text || "";
  renderPreview();
}

function editBilling(text) {
  state.billing = text || "";
  renderPreview();
}

function pickSize(sizeKey) {
  if (!POSTER_SIZES[sizeKey]) return;
  state.size = sizeKey;
  document.querySelectorAll(".size-btn").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.size === sizeKey);
  });
  const label = document.getElementById("exportSizeLabel");
  if (label) label.textContent = POSTER_SIZES[sizeKey].label;
  renderPreview();
}

function exportPNG(sizeKey) {
  // Draw the poster at exact export pixels and download it as a PNG.
  const key = sizeKey || state.size;
  const size = POSTER_SIZES[key] || POSTER_SIZES["1920x1080"];
  const off = document.createElement("canvas");
  const savedSize = state.size;
  state.size = key;
  drawPoster(off, state);
  state.size = savedSize;
  renderPreview();
  return new Promise((resolve) => {
    off.toBlob((blob) => {
      if (!blob) { resolve(null); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const base = (state.title || "vice-cut").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "vice-cut";
      a.href = url;
      a.download = `${base}-${size.w}x${size.h}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      resolve({ blob, width: size.w, height: size.h, url });
    }, "image/png");
  });
}

function markActiveSample(sampleId) {
  document.querySelectorAll("#sampleStrip img").forEach((img) => {
    img.classList.toggle("is-active", img.dataset.sample === sampleId);
  });
}

function syncCropControls() {
  const zoom = document.getElementById("zoomRange");
  if (zoom) zoom.value = String(state.zoom);
}

function buildChips() {
  const gradeRow = document.getElementById("gradeRow");
  Object.entries(POSTER_GRADES).forEach(([key, grade]) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip" + (key === state.grade ? " is-active" : "");
    btn.dataset.grade = key;
    const swatch = {
      sunset: "linear-gradient(135deg,#ffb347,#ff2e88)",
      neon: "linear-gradient(135deg,#ff2e88,#7b2fff)",
      teal: "linear-gradient(135deg,#00c8c8,#ff7a3c)",
      mono: "linear-gradient(135deg,#eee,#333)",
    }[key] || "#888";
    btn.innerHTML = `<span class="dot" style="background:${swatch}"></span>${grade.name}`;
    btn.addEventListener("click", () => pickGrade(key));
    gradeRow.appendChild(btn);
  });
  const styleRow = document.getElementById("styleRow");
  Object.entries(POSTER_STYLES).forEach(([key, style]) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip" + (key === state.style ? " is-active" : "");
    btn.dataset.style = key;
    btn.textContent = style.name;
    btn.title = style.hint;
    btn.addEventListener("click", () => pickPosterStyle(key));
    styleRow.appendChild(btn);
  });
  const strip = document.getElementById("sampleStrip");
  SAMPLES.forEach((sample) => {
    const img = document.createElement("img");
    img.src = sample.file;
    img.alt = sample.label;
    img.title = sample.label;
    img.dataset.sample = sample.id;
    if (sample.id === state.photoId) img.classList.add("is-active");
    img.addEventListener("click", () => loadSample(sample.id));
    strip.appendChild(img);
  });
}

function wireEditor() {
  buildChips();
  const dropzone = document.getElementById("dropzone");
  const input = document.getElementById("photoInput");
  dropzone.addEventListener("click", () => input.click());
  input.addEventListener("change", () => {
    if (input.files && input.files[0]) uploadPhoto(input.files[0]);
    input.value = "";
  });
  ["dragover", "dragenter"].forEach((evt) => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.add("is-over");
    });
  });
  ["dragleave", "drop"].forEach((evt) => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.remove("is-over");
    });
  });
  dropzone.addEventListener("drop", (e) => {
    const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) uploadPhoto(file);
  });

  document.getElementById("zoomRange").addEventListener("input", (e) => cropPhoto(e.target.value));
  document.getElementById("fitBtn").addEventListener("click", fitFace);
  document.getElementById("centerBtn").addEventListener("click", () => {
    state.panX = 0;
    state.panY = 0;
    renderPreview();
  });

  // Drag the poster itself to pan the photo inside the frame.
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  canvas.addEventListener("pointerdown", (e) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const rect = canvas.getBoundingClientRect();
    positionPhoto((e.clientX - lastX) / rect.width, (e.clientY - lastY) / rect.height);
    lastX = e.clientX;
    lastY = e.clientY;
  });
  const endDrag = () => { dragging = false; };
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);
  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    cropPhoto(state.zoom * (e.deltaY < 0 ? 1.08 : 0.92));
    syncCropControls();
  }, { passive: false });

  document.getElementById("titleInput").addEventListener("input", (e) => editTitle(e.target.value));
  document.getElementById("taglineInput").addEventListener("input", (e) => editTagline(e.target.value));
  document.getElementById("billingInput").addEventListener("input", (e) => editBilling(e.target.value));
  document.getElementById("starsToggle").addEventListener("change", (e) => {
    state.stars = e.target.checked;
    renderPreview();
  });
  document.getElementById("badgeToggle").addEventListener("change", (e) => {
    state.badge = e.target.checked;
    renderPreview();
  });
  document.querySelectorAll(".size-btn").forEach((btn) => {
    btn.addEventListener("click", () => pickSize(btn.dataset.size));
  });
  document.getElementById("exportBtn").addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    await exportPNG();
    btn.disabled = false;
  });
}

// Expose the editor for shots, tests and the finalist review.
window.ViceCut = {
  state,
  SAMPLES,
  loadSample,
  uploadPhoto,
  cropPhoto,
  positionPhoto,
  fitFace,
  pickGrade,
  pickPosterStyle,
  editTitle,
  editTagline,
  editBilling,
  pickSize,
  exportPNG,
  renderPreview,
  renderPreviewNow,
};

wireEditor();
ensurePosterFonts().then(() => {
  loadSample("hero");
  renderPreview();
});
