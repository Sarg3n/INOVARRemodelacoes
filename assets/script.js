/* ===========================
   INOVAR — Script
   Fixes:
   - Burger menu reliable (open/close, backdrop click, ESC, link click, resize)
   - Theme toggle (dark/light) + persists + updates meta theme-color
   - Back to top button
   - Year
   - Gallery carousel (stable)
   =========================== */

(() => {
  const $ = (q, root = document) => root.querySelector(q);
  const $$ = (q, root = document) => Array.from(root.querySelectorAll(q));

  // ---------- THEME ----------
  const themeToggle = $("#themeToggle");
  const themeIcon = $("#themeIcon");
  const metaTheme = $('meta[name="theme-color"]');

  const setMetaThemeColor = (theme) => {
    const dark = "#0E171D";
    const light = "#F6F8FA";
    if (metaTheme) metaTheme.setAttribute("content", theme === "light" ? light : dark);
  };

  const applyTheme = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    if (themeIcon) themeIcon.textContent = theme === "light" ? "🌙" : "☀️";
    setMetaThemeColor(theme);
  };

  const initTheme = () => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return applyTheme(saved);

    const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)")?.matches;
    applyTheme(prefersLight ? "light" : "dark");
  };

  themeToggle?.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    applyTheme(current === "dark" ? "light" : "dark");
  });

  initTheme();

  // ---------- MOBILE MENU (FIXED) ----------
  const burger = $("#burger");
  const mobileMenu = $("#mobileMenu");
  const backdrop = $("#menuBackdrop");

  const lockScroll = (locked) => {
    document.documentElement.style.overflow = locked ? "hidden" : "";
  };

  const isMenuOpen = () => mobileMenu && !mobileMenu.hasAttribute("hidden");

  const openMenu = () => {
    if (!burger || !mobileMenu) return;

    // force clean state
    mobileMenu.removeAttribute("hidden");
    burger.setAttribute("aria-expanded", "true");
    document.body.classList.add("menu-open");

    if (backdrop) {
      backdrop.hidden = false;
      requestAnimationFrame(() => backdrop.classList.add("show"));
    }

    lockScroll(true);

    // focus first link (helps mobile accessibility)
    const firstLink = mobileMenu.querySelector("a");
    firstLink?.focus?.();
  };

  const closeMenu = () => {
    if (!burger || !mobileMenu) return;

    mobileMenu.setAttribute("hidden", "");
    burger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");

    if (backdrop) {
      backdrop.classList.remove("show");
      setTimeout(() => { backdrop.hidden = true; }, 180);
    }

    lockScroll(false);
  };

  // ensure starts closed (prevents “always active”)
  if (burger) burger.setAttribute("aria-expanded", "false");
  if (mobileMenu) mobileMenu.setAttribute("hidden", "");
  if (backdrop) backdrop.hidden = true;

  burger?.addEventListener("click", (e) => {
    e.preventDefault();
    isMenuOpen() ? closeMenu() : openMenu();
  });

  // close by clicking backdrop
  backdrop?.addEventListener("click", closeMenu);

  // close when clicking a link
  mobileMenu?.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (a) closeMenu();
  });

  // close on ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isMenuOpen()) closeMenu();
  });

  // close on resize to desktop
  window.addEventListener("resize", () => {
    if (window.innerWidth > 980 && isMenuOpen()) closeMenu();
  });

  // close on hashchange (extra safety)
  window.addEventListener("hashchange", () => {
    if (isMenuOpen()) closeMenu();
  });

  // ---------- BACK TO TOP ----------
  const topbtn = $("#topbtn");
  const backToTop = $("#backToTop");

  const updateTopBtn = () => {
    const show = window.scrollY > 700;
    topbtn?.classList.toggle("show", show);
  };

  window.addEventListener("scroll", updateTopBtn, { passive: true });
  updateTopBtn();

  backToTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // ---------- YEAR ----------
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  // ---------- FORM HINT ----------
  const form = $("#quoteForm");
  const hint = $("#formHint");
  form?.addEventListener("submit", () => {
    if (!hint) return;
    hint.textContent = "A enviar… se for a primeira vez, confirma o email do FormSubmit.";
  });

  // ---------- GALLERY / CAROUSEL ----------
  const stage = $("#stage");
  const thumbs = $("#thumbs");
  const counter = $("#counter");
  const prevBtn = $("#prevBtn");
  const nextBtn = $("#nextBtn");
  const tabs = $$(".tab");
  const autoplayBtn = $("#autoplayBtn");

  // If this page has no gallery, stop here
  if (!stage || !thumbs || !counter) return;

  // Replace with your files (ensure paths are correct inside /assets)
  const MEDIA = [
    { type: "image", title: "Sala — After", subtitle: "Acabamento premium + iluminação", src: "assets/work7.jpeg", thumb: "assets/work7.jpeg", tag: "After" },
    { type: "image", title: "Cozinha — Detalhe", subtitle: "Linhas limpas e materiais nobres", src: "assets/work11.jpeg", thumb: "assets/work11.jpeg", tag: "Detalhe" },
    { type: "video", title: "", subtitle: "", src: "assets/video1.mp4", thumb: "assets/work2.jpeg", tag: "Vídeo" },
  ];

  let filter = "all";
  let items = [];
  let index = 0;
  let autoplay = false;
  let timer = null;

  const escapeHtml = (str) =>
    String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const filteredItems = () => {
    if (filter === "all") return [...MEDIA];
    return MEDIA.filter((m) => m.type === filter);
  };

  const updateCounter = () => {
    counter.textContent = items.length ? `${index + 1} / ${items.length}` : "0 / 0";
  };

  const ensureThumbVisible = (i) => {
    const el = thumbs.querySelectorAll(".thumb")[i];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const parentRect = thumbs.getBoundingClientRect();
    const offLeft = rect.left < parentRect.left;
    const offRight = rect.right > parentRect.right;
    if (offLeft || offRight) el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  const go = (i) => {
    if (!items.length) return;
    index = (i + items.length) % items.length;

    const slides = stage.querySelectorAll(".slide");
    slides.forEach((s) => s.classList.remove("active"));

    const active = stage.querySelector(`.slide[data-i="${index}"]`);
    active?.classList.add("active");

    // pause other videos
    slides.forEach((s, si) => {
      if (si !== index) {
        const v = s.querySelector("video");
        if (v && !v.paused) v.pause();
      }
    });

    thumbs.querySelectorAll(".thumb").forEach((t, ti) => t.classList.toggle("active", ti === index));
    updateCounter();
    ensureThumbVisible(index);
  };

  const next = () => go(index + 1);
  const prev = () => go(index - 1);

  const build = () => {
    items = filteredItems();

    // remove existing slides
    stage.querySelectorAll(".slide").forEach((s) => s.remove());

    if (!items.length) {
      stage.insertAdjacentHTML("afterbegin",
        `<div class="slide active" data-i="0" style="position:absolute; inset:0; display:grid; place-items:center; padding:18px;">
           <div style="color: var(--muted); text-align:center;">Sem itens para mostrar neste filtro.</div>
         </div>`
      );
      thumbs.innerHTML = "";
      index = 0;
      updateCounter();
      return;
    }

    index = Math.max(0, Math.min(index, items.length - 1));

    items.forEach((m, i) => {
      const slide = document.createElement("div");
      slide.className = "slide" + (i === index ? " active" : "");
      slide.dataset.i = String(i);

      const frame = document.createElement("div");
      frame.className = "frame";

      if (m.type === "video") {
        const video = document.createElement("video");
        video.src = m.src;
        video.controls = true;
        video.playsInline = true;
        video.preload = "metadata";
        frame.appendChild(video);
      } else {
        const img = document.createElement("img");
        img.src = m.src;
        img.alt = `${m.title} — ${m.subtitle || ""}`;
        img.loading = "lazy";
        frame.appendChild(img);
      }

      const shade = document.createElement("div");
      shade.className = "shade";
      frame.appendChild(shade);

      const meta = document.createElement("div");
      meta.className = "meta";
      meta.innerHTML = `
        <div>
          <strong>${escapeHtml(m.title)}</strong>
          <span>${escapeHtml(m.subtitle || "")}</span>
        </div>
        <div class="tag">${escapeHtml(m.tag || (m.type === "video" ? "Vídeo" : "Imagem"))}</div>
      `;
      frame.appendChild(meta);

      slide.appendChild(frame);
      stage.appendChild(slide);
    });

    thumbs.innerHTML = "";
    items.forEach((m, i) => {
      const t = document.createElement("button");
      t.type = "button";
      t.className = "thumb" + (i === index ? " active" : "");
      t.setAttribute("aria-label", `Abrir ${m.title}`);
      t.addEventListener("click", () => go(i));

      const img = document.createElement("img");
      img.src = m.thumb || m.src;
      img.alt = `Miniatura ${m.title}`;
      img.loading = "lazy";

      const meta = document.createElement("div");
      meta.className = "tmeta";
      meta.textContent = m.title;

      t.appendChild(img);
      t.appendChild(meta);
      thumbs.appendChild(t);
    });

    updateCounter();
  };

  prevBtn?.addEventListener("click", prev);
  nextBtn?.addEventListener("click", next);

// swipe (pointer)
let startX = 0;
let dx = 0;

stage.addEventListener("pointerdown", (e) => {
  // ✅ If the user is clicking the nav arrows, don't start swipe capture
  if (e.target.closest(".nav-btn")) return;

  startX = e.clientX;
  dx = 0;
  stage.setPointerCapture(e.pointerId);
});

stage.addEventListener("pointermove", (e) => {
  dx = e.clientX - startX;
});

stage.addEventListener("pointerup", (e) => {
  // ✅ Ignore swipe end if it started on arrows
  if (e.target.closest(".nav-btn")) return;

  if (Math.abs(dx) > 45) dx < 0 ? next() : prev();
});

  // tabs
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      filter = tab.getAttribute("data-type") || "all";
      index = 0;
      build();
    });
  });

  // autoplay
  const setAutoplay = (v) => {
    autoplay = v;
    autoplayBtn?.setAttribute("aria-pressed", String(autoplay));
    if (autoplayBtn) autoplayBtn.textContent = autoplay ? "Auto: ON" : "Auto";

    if (timer) clearInterval(timer);
    if (autoplay) {
      timer = setInterval(() => {
        const activeVideo = stage.querySelector(".slide.active video");
        if (activeVideo && !activeVideo.paused) return;
        next();
      }, 4500);
    }
  };

  autoplayBtn?.addEventListener("click", () => setAutoplay(!autoplay));

  build();
})();