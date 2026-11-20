// VICE CUT — shot mode. Reads ?shot=cover / ?shot=editor and the poster params,
// applies them to the live editor, then sets window.__shotReady once painted.
// Params: layout (alias of style), grade, style, title, tagline, billing, size,
// stars (1/0), badge (1/0), photo (sample id).

(function applyShotParams() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get("shot") || "";
  if (shot === "cover") {
    document.body.classList.add("shot-cover");
  }
  const api = window.ViceCut;
  if (!api) return;

  const styleKey = params.get("style") || params.get("layout");
  if (styleKey) api.pickPosterStyle(styleKey);
  const gradeKey = params.get("grade");
  if (gradeKey) api.pickGrade(gradeKey);
  const title = params.get("title");
  if (title != null) {
    const input = document.getElementById("titleInput");
    if (input) input.value = title;
    api.editTitle(title);
  }
  const tagline = params.get("tagline");
  if (tagline != null) {
    const input = document.getElementById("taglineInput");
    if (input) input.value = tagline;
    api.editTagline(tagline);
  }
  const billing = params.get("billing");
  if (billing != null) {
    const input = document.getElementById("billingInput");
    if (input) input.value = billing;
    api.editBilling(billing);
  }
  const size = params.get("size");
  if (size) api.pickSize(size);
  if (params.get("stars") === "0") {
    api.state.stars = false;
    const toggle = document.getElementById("starsToggle");
    if (toggle) toggle.checked = false;
  }
  if (params.get("stars") === "1") {
    api.state.stars = true;
    const toggle = document.getElementById("starsToggle");
    if (toggle) toggle.checked = true;
  }
  if (params.get("badge") === "0") {
    api.state.badge = false;
    const toggle = document.getElementById("badgeToggle");
    if (toggle) toggle.checked = false;
  }
  if (params.get("badge") === "1") {
    api.state.badge = true;
    const toggle = document.getElementById("badgeToggle");
    if (toggle) toggle.checked = true;
  }
  const photo = params.get("photo");
  if (photo && api.SAMPLES.some((s) => s.id === photo)) {
    api.loadSample(photo);
  }
  // Wait until the hero photo is actually painted (fonts + image load are
  // async) before declaring the shot ready — a blank canvas must never count.
  const started = Date.now();
  const waitForPaint = () => {
    const painted = api.state.photo != null;
    if (painted || Date.now() - started > 8000) {
      api.renderPreviewNow();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.__shotReady = true;
        });
      });
      return;
    }
    setTimeout(waitForPaint, 60);
  };
  waitForPaint();
})();
