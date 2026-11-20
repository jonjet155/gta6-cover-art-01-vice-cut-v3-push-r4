// VICE CUT — poster renderer. One photo, one huge face, one giant title.
// drawPoster(canvas, state) paints the whole one-sheet: graded photo, neon CUT
// slash, redesigned VICE CUT lockup, tagline, seal, stars and billing block.
// Pure canvas, no network, no libraries. Fonts: Bebas Neue + Caveat (OFL, local).

const POSTER_SIZES = {
  "1080x1080": { w: 1080, h: 1080, label: "1080 × 1080" },
  "1080x1350": { w: 1080, h: 1350, label: "1080 × 1350" },
  "1920x1080": { w: 1920, h: 1080, label: "1920 × 1080" },
};

const POSTER_GRADES = {
  sunset: { name: "Warm Sunset", filter: "saturate(1.28) contrast(1.08) brightness(1.05) sepia(0.16)" },
  neon: { name: "Neon Night", filter: "saturate(1.55) contrast(1.16) brightness(0.97) hue-rotate(-14deg)" },
  teal: { name: "Teal Coast", filter: "saturate(1.18) contrast(1.09) brightness(1.02) hue-rotate(16deg)" },
  mono: { name: "Ink Mono", filter: "grayscale(1) contrast(1.14) brightness(1.03)" },
};

const POSTER_STYLES = {
  fullbleed: { name: "Full-Bleed", hint: "Photo edge to edge, title over it" },
  split: { name: "Split", hint: "Photo top two thirds, solid title block" },
  duotone: { name: "Duotone", hint: "Ink mono photo, neon pink-purple wash" },
  framed: { name: "Framed", hint: "White-border one-sheet, credits outside" },
};

function gradeFilter(gradeKey) {
  const g = POSTER_GRADES[gradeKey];
  return g ? g.filter : POSTER_GRADES.sunset.filter;
}

function drawPhotoCover(ctx, photo, W, H, state, clipRect) {
  // Cover-fit the photo so the face focus point sits in the upper centre,
  // then let pan/zoom move it. Face stays huge: default zoom per sample.
  const iw = photo.naturalWidth || photo.width;
  const ih = photo.naturalHeight || photo.height;
  const base = Math.max(W / iw, H / ih);
  const scale = base * (state.zoom || 1);
  const fx = state.focusX == null ? 0.5 : state.focusX;
  const fy = state.focusY == null ? 0.38 : state.focusY;
  const anchorX = clipRect ? clipRect.x + clipRect.w * 0.5 : W * 0.5;
  const anchorY = clipRect ? clipRect.y + clipRect.h * 0.42 : H * 0.42;
  let dx = anchorX - fx * iw * scale + (state.panX || 0) * W;
  let dy = anchorY - fy * ih * scale + (state.panY || 0) * H;
  // Full-bleed guarantee: the photo must cover its whole rect — a focus point
  // left of centre must never expose a flat background bar at the edge.
  const rectX = clipRect ? clipRect.x : 0;
  const rectY = clipRect ? clipRect.y : 0;
  const rectW = clipRect ? clipRect.w : W;
  const rectH = clipRect ? clipRect.h : H;
  dx = Math.min(dx, rectX);
  dx = Math.max(dx, rectX + rectW - iw * scale);
  dy = Math.min(dy, rectY);
  dy = Math.max(dy, rectY + rectH - ih * scale);
  ctx.save();
  if (clipRect) {
    ctx.beginPath();
    ctx.rect(clipRect.x, clipRect.y, clipRect.w, clipRect.h);
    ctx.clip();
  }
  ctx.filter = gradeFilter(state.grade);
  ctx.drawImage(photo, dx, dy, iw * scale, ih * scale);
  ctx.restore();
}

function applyGradeWash(ctx, W, H, gradeKey, styleKey) {
  // Warm / neon colour wash + vignette, so every grade reads as Leonida dusk.
  const wash = ctx.createLinearGradient(0, 0, W, H);
  if (gradeKey === "neon") {
    wash.addColorStop(0, "rgba(255,46,136,0.16)");
    wash.addColorStop(0.55, "rgba(123,47,255,0.08)");
    wash.addColorStop(1, "rgba(20,8,60,0.22)");
  } else if (gradeKey === "teal") {
    wash.addColorStop(0, "rgba(0,190,190,0.12)");
    wash.addColorStop(0.6, "rgba(255,120,60,0.10)");
    wash.addColorStop(1, "rgba(10,30,50,0.20)");
  } else if (gradeKey === "mono") {
    wash.addColorStop(0, "rgba(255,255,255,0.05)");
    wash.addColorStop(1, "rgba(0,0,0,0.18)");
  } else {
    wash.addColorStop(0, "rgba(255,150,40,0.14)");
    wash.addColorStop(0.55, "rgba(255,80,120,0.07)");
    wash.addColorStop(1, "rgba(60,10,60,0.20)");
  }
  ctx.save();
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, W, H);
  if (styleKey === "duotone") {
    const duo = ctx.createLinearGradient(0, 0, W, H);
    duo.addColorStop(0, "#ff2e88");
    duo.addColorStop(1, "#7b2fff");
    ctx.globalCompositeOperation = "color";
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = duo;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }
  const vig = ctx.createRadialGradient(
    W / 2, H * 0.42, Math.min(W, H) * 0.42,
    W / 2, H * 0.5, Math.max(W, H) * 0.75,
  );
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(10,2,24,0.42)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function drawNeonSlash(ctx, W, H, y, angle) {
  // The CUT: one thin neon diagonal slashing the full width of the poster.
  const band = Math.max(4, H * 0.011);
  const grad = ctx.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0, "#ff2e88");
  grad.addColorStop(0.5, "#e14dff");
  grad.addColorStop(1, "#7b2fff");
  ctx.save();
  ctx.translate(0, y);
  ctx.rotate(angle);
  ctx.shadowColor = "#ff2e88";
  ctx.shadowBlur = H * 0.02;
  ctx.fillStyle = grad;
  ctx.fillRect(-W * 0.1, -band / 2, W * 1.2, band);
  ctx.restore();
}

function drawTitleLockup(ctx, W, H, state, baselineY, fontSize) {
  // Redesigned lockup: VICE solid white, CUT neon pink->purple gradient,
  // split by a diagonal slash at ~30 degrees. Thick dark outline + neon glow.
  const title = (state.title || "VICE CUT").toUpperCase();
  const parts = title.split(/\s+/).filter(Boolean);
  const first = parts[0] || "VICE";
  const rest = parts.slice(1).join(" ") || "CUT";
  ctx.save();
  ctx.textBaseline = "alphabetic";
  let size = fontSize;
  const gap = size * 0.42;
  const slashW = size * 0.13;
  const measure = (s) => {
    ctx.font = `${size}px "Bebas Neue", sans-serif`;
    return ctx.measureText(s).width;
  };
  let total = measure(first) + gap + slashW + gap + measure(rest);
  const maxW = W * 0.94;
  if (total > maxW) {
    size = Math.floor((size * maxW) / total);
    total = measure(first) + size * 0.42 + size * 0.16 + size * 0.42 + measure(rest);
  }
  const g2 = size * 0.42;
  const sw = size * 0.16;
  let x = (W - total) / 2;
  const y = baselineY;
  const grad = ctx.createLinearGradient(x, 0, x + total, 0);
  grad.addColorStop(0, "#ff2e88");
  grad.addColorStop(1, "#7b2fff");
  ctx.font = `${size}px "Bebas Neue", sans-serif`;
  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(3, size * 0.055);
  ctx.strokeStyle = "#160722";
  ctx.shadowColor = "rgba(255,46,136,0.85)";
  ctx.shadowBlur = size * 0.10;
  // Word one: solid white.
  ctx.fillStyle = "#ffffff";
  ctx.strokeText(first, x, y);
  ctx.fillText(first, x, y);
  x += measure(first) + g2;
  // The slash between the words: a leaning neon bar, part of the logo.
  ctx.save();
  ctx.translate(x + sw / 2, y - size * 0.52);
  ctx.rotate(0.52);
  ctx.shadowColor = "#e14dff";
  ctx.shadowBlur = size * 0.12;
  ctx.fillStyle = grad;
  ctx.fillRect(-sw / 2, -size * 0.58, sw, size * 1.16);
  ctx.restore();
  x += sw + g2;
  // Word two: neon gradient.
  ctx.fillStyle = grad;
  ctx.strokeText(rest, x, y);
  ctx.fillText(rest, x, y);
  ctx.restore();
  return size;
}

function drawTagline(ctx, W, H, state, y, size) {
  const text = state.tagline || "";
  if (!text) return;
  ctx.save();
  ctx.font = `700 ${size}px "Caveat", cursive`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0,0,0,0.75)";
  ctx.shadowBlur = size * 0.25;
  ctx.fillStyle = "#fff7ea";
  ctx.fillText(text, W / 2, y);
  ctx.restore();
}

function drawStars(ctx, W, H, y, size) {
  ctx.save();
  ctx.translate(W / 2, y);
  ctx.fillStyle = "#ffc44d";
  ctx.shadowColor = "rgba(255,196,77,0.9)";
  ctx.shadowBlur = size * 0.3;
  const step = size * 1.5;
  for (let i = -2; i <= 2; i++) {
    drawStar(ctx, i * step, 0, size * 0.62, size * 0.26);
  }
  ctx.restore();
}

function drawStar(ctx, cx, cy, outer, inner) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function drawSeal(ctx, W, H, cx, cy, radius) {
  // Round stamp: ORIGINAL COVER ART around the rim, VC monogram in the middle.
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = "rgba(255,244,220,0.95)";
  ctx.fillStyle = "rgba(20,8,40,0.42)";
  ctx.lineWidth = Math.max(2, radius * 0.05);
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.78, 0, Math.PI * 2);
  ctx.stroke();
  const ring = "ORIGINAL COVER ART \u2022 EST. 2026 \u2022 ";
  ctx.fillStyle = "#fff4dc";
  ctx.font = `${Math.max(9, radius * 0.17)}px "Bebas Neue", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < ring.length; i++) {
    const a = (i / ring.length) * Math.PI * 2 - Math.PI / 2;
    ctx.save();
    ctx.rotate(a);
    ctx.translate(0, -radius * 0.89);
    ctx.fillText(ring[i], 0, 0);
    ctx.restore();
  }
  ctx.font = `${radius * 0.62}px "Bebas Neue", sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.fillText("VC", 0, radius * 0.04);
  ctx.restore();
}

function drawBillingBlock(ctx, W, H, state, y, color) {
  const text = (state.billing || "").toUpperCase();
  if (!text) return;
  ctx.save();
  ctx.font = `${Math.max(10, H * 0.016)}px "Bebas Neue", sans-serif`;
  try { ctx.letterSpacing = `${Math.max(1, H * 0.002)}px`; } catch (e) { /* older canvas */ }
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.fillText(text, W / 2, y);
  ctx.restore();
}

function drawVolMark(ctx, W, H, x, y, size) {
  ctx.save();
  ctx.font = `${size}px "Bebas Neue", sans-serif`;
  try { ctx.letterSpacing = `${size * 0.14}px`; } catch (e) { /* older canvas */ }
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = size * 0.2;
  ctx.fillText("VOL. 06", x, y);
  ctx.fillStyle = "#ff2e88";
  ctx.fillRect(x, y + size * 0.62, size * 2.1, Math.max(2, size * 0.09));
  ctx.restore();
}

function posterLayout(W, H, styleKey) {
  // Where each poster part sits, per style. Title never covers the face:
  // the face lives in the top ~55%, the title in the bottom third.
  if (styleKey === "split") {
    return {
      photoRect: { x: 0, y: 0, w: W, h: H * 0.66 },
      blockRect: { x: 0, y: H * 0.66, w: W, h: H * 0.34 },
      titleY: H * 0.845, titleSize: H * 0.185,
      taglineY: H * 0.915, taglineSize: H * 0.042,
      starsY: H * 0.688, starsSize: H * 0.024,
      billingY: H * 0.968, billingColor: "rgba(255,255,255,0.75)",
      slashY: H * 0.755, slashAngle: -0.06,
    };
  }
  if (styleKey === "framed") {
    const m = Math.round(W * 0.035);
    return {
      photoRect: { x: m, y: m, w: W - m * 2, h: H * 0.8 },
      frameRect: { x: 0, y: 0, w: W, h: H },
      titleY: H * 0.76, titleSize: H * 0.20,
      taglineY: H * 0.835, taglineSize: H * 0.042,
      starsY: H * 0.888, starsSize: H * 0.024,
      billingY: H * 0.945, billingColor: "rgba(20,8,40,0.85)",
      slashY: H * 0.685, slashAngle: -0.06,
    };
  }
  return {
    photoRect: { x: 0, y: 0, w: W, h: H },
    blockRect: null,
    titleY: H * 0.87, titleSize: H * 0.24,
    taglineY: H * 0.925, taglineSize: H * 0.046,
    starsY: H * 0.675, starsSize: H * 0.026,
    billingY: H * 0.972, billingColor: "rgba(255,255,255,0.8)",
    slashY: H * 0.79, slashAngle: -0.07,
  };
}

function drawPoster(canvas, state) {
  const size = POSTER_SIZES[state.size] || POSTER_SIZES["1920x1080"];
  const W = size.w;
  const H = size.h;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  const styleKey = POSTER_STYLES[state.style] ? state.style : "fullbleed";
  const layout = posterLayout(W, H, styleKey);
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#14092a";
  ctx.fillRect(0, 0, W, H);

  if (styleKey === "framed") {
    ctx.fillStyle = "#f6f1e6";
    ctx.fillRect(0, 0, W, H);
  }
  if (styleKey === "split" && layout.blockRect) {
    ctx.fillStyle = "#14092a";
    ctx.fillRect(layout.blockRect.x, layout.blockRect.y, layout.blockRect.w, layout.blockRect.h);
  }

  // Photo + grade, clipped to its rect.
  if (state.photo) {
    const rect = styleKey === "fullbleed" || styleKey === "duotone"
      ? null
      : layout.photoRect;
    if (styleKey === "duotone") {
      const saved = state.grade;
      state.grade = "mono";
      drawPhotoCover(ctx, state.photo, W, H, state, null);
      state.grade = saved;
    } else {
      drawPhotoCover(ctx, state.photo, W, H, state, rect);
    }
    applyGradeWash(ctx, W, H, styleKey === "duotone" ? "mono" : state.grade, styleKey);
    if (styleKey === "split") {
      // Soft shade so the photo meets the title block cleanly.
      const shade = ctx.createLinearGradient(0, H * 0.55, 0, H * 0.67);
      shade.addColorStop(0, "rgba(20,9,42,0)");
      shade.addColorStop(1, "rgba(20,9,42,0.85)");
      ctx.fillStyle = shade;
      ctx.fillRect(0, H * 0.55, W, H * 0.12);
    }
  }

  // Bottom-third legibility shade on the full-bleed styles.
  if ((styleKey === "fullbleed" || styleKey === "duotone") && state.photo) {
    const shade = ctx.createLinearGradient(0, H * 0.58, 0, H);
    shade.addColorStop(0, "rgba(12,4,26,0)");
    shade.addColorStop(0.55, "rgba(12,4,26,0.55)");
    shade.addColorStop(1, "rgba(12,4,26,0.82)");
    ctx.fillStyle = shade;
    ctx.fillRect(0, H * 0.58, W, H * 0.42);
  }

  if (styleKey === "split" && layout.blockRect) {
    const edge = ctx.createLinearGradient(0, 0, W, 0);
    edge.addColorStop(0, "#ff2e88");
    edge.addColorStop(1, "#7b2fff");
    ctx.fillStyle = edge;
    ctx.fillRect(0, layout.blockRect.y - Math.max(3, H * 0.004), W, Math.max(3, H * 0.008));
  }

  // Furniture: VOL mark top-left, seal top-right.
  const pad = Math.round(W * 0.032);
  drawVolMark(ctx, W, H, pad, pad + H * 0.022, Math.max(14, H * 0.026));
  if (state.badge !== false) {
    drawSeal(ctx, W, H, W - pad - H * 0.052, pad + H * 0.052, H * 0.052);
  }

  // The CUT slash, then stars, title lockup, tagline, billing.
  drawNeonSlash(ctx, W, H, layout.slashY, layout.slashAngle);
  if (state.stars !== false) {
    drawStars(ctx, W, H, layout.starsY, layout.starsSize);
  }
  drawTitleLockup(ctx, W, H, state, layout.titleY, layout.titleSize);
  drawTagline(ctx, W, H, state, layout.taglineY, layout.taglineSize);
  drawBillingBlock(ctx, W, H, state, layout.billingY, layout.billingColor);
  return canvas;
}

async function ensurePosterFonts() {
  // Wait for the local OFL fonts so canvas lettering uses them, not a fallback.
  try {
    await Promise.all([
      document.fonts.load('400 100px "Bebas Neue"'),
      document.fonts.load('700 60px "Caveat"'),
    ]);
    await document.fonts.ready;
  } catch (e) { /* canvas falls back; lettering still draws */ }
}
