/* ===========================
   INOVAR — Script
   Fixes:
   - Burger menu reliable (open/close, backdrop click, ESC, link click, resize)
   - Theme toggle (dark/light) + persists + updates meta theme-color
   - Back to top button
   - Year
   - Gallery carousel (stable)
   - Gallery autoplay always ON
   - Gallery fullscreen lightbox
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

  // ---------- MOBILE MENU ----------
 const burger = document.getElementById("burger");
const mobileMenu = document.getElementById("mobileMenu");
const mobileMenuClose = document.getElementById("mobileMenuClose");
const menuBackdrop = document.getElementById("menuBackdrop");
const mobileMenuLinks = document.querySelectorAll(".mobile-menu-link, .mobile-menu-cta a");

let isMenuClosing = false;

function openMobileMenu() {
  if (!mobileMenu || !menuBackdrop) return;

  mobileMenu.hidden = false;
  mobileMenu.setAttribute("aria-hidden", "false");

  requestAnimationFrame(() => {
    mobileMenu.classList.add("is-open");
    menuBackdrop.hidden = false;
    menuBackdrop.classList.add("show");
    document.body.classList.add("menu-open");
    burger?.setAttribute("aria-expanded", "true");
  });
}

function closeMobileMenu() {
  if (!mobileMenu || !menuBackdrop || isMenuClosing) return;

  isMenuClosing = true;

  mobileMenu.classList.remove("is-open");
  menuBackdrop.classList.remove("show");
  document.body.classList.remove("menu-open");
  burger?.setAttribute("aria-expanded", "false");
  mobileMenu.setAttribute("aria-hidden", "true");

  setTimeout(() => {
    mobileMenu.hidden = true;
    menuBackdrop.hidden = true;
    isMenuClosing = false;
  }, 380);
}

burger?.addEventListener("click", () => {
  const isOpen = mobileMenu.classList.contains("is-open");
  if (isOpen) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
});

mobileMenuClose?.addEventListener("click", closeMobileMenu);
menuBackdrop?.addEventListener("click", closeMobileMenu);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && mobileMenu.classList.contains("is-open")) {
    closeMobileMenu();
  }
});

function scrollToSection(selector) {
  const target = document.querySelector(selector);
  const header = document.querySelector(".site-header");

  if (!target) return;

  const headerHeight = header ? header.offsetHeight : 0;
  const extraOffset = 0; // pequena folga visual
  const targetTop = target.getBoundingClientRect().top + window.pageYOffset;
  const finalTop = Math.max(targetTop - headerHeight - extraOffset, 0);

  window.scrollTo({
    top: finalTop,
    behavior: "smooth"
  });
}

mobileMenuLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    const href = link.getAttribute("href");

    if (href && href.startsWith("#")) {
      e.preventDefault();

      closeMobileMenu();

      setTimeout(() => {
        scrollToSection(href);
      }, 260);
    } else {
      closeMobileMenu();
    }
  });
});

  // ---------- BACK TO TOP ----------
// ---------- FLOATING BUTTONS ----------
const topbtn = $("#topbtn");
const backToTop = $("#backToTop");
const waFloat = $(".wa-float");

const updateFloatingButtons = () => {
  const show = window.scrollY > 210;

  topbtn?.classList.toggle("show", show);
  waFloat?.classList.toggle("show", show);
};

window.addEventListener("scroll", updateFloatingButtons, { passive: true });
updateFloatingButtons();

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


  // If this page has no gallery, stop here
  if (!stage || !thumbs || !counter) return;

  const MEDIA = [
    { type: "image", title: "WC — Detalhe", subtitle: "Linhas limpas e materiais nobres", src: "assets/work36.jpeg", thumb: "assets/work36.jpeg", tag: "" },
    { type: "image", title: "Armazém — Divisórias", subtitle: "Rigor e precisão", src: "assets/work33.jpeg", thumb: "assets/work33.jpeg", tag: "" },
    { type: "image", title: "Lobby Sala — Depois", subtitle: "Acabamento premium + iluminação", src: "assets/work8.jpeg", thumb: "assets/work8.jpeg", tag: "" },
    { type: "image", title: "Lobby Sala — Depois", subtitle: "Linhas limpas e materiais nobres", src: "assets/work12.jpeg", thumb: "assets/work12.jpeg", tag: "" },
    { type: "image", title: "WC — Simplicidade", subtitle: "Acabamento premium + iluminação", src: "assets/work24.jpeg", thumb: "assets/work24.jpeg", tag: "" },
    { type: "image", title: "Garagem — Boa execução", subtitle: "Régua e esquadro", src: "assets/work2.jpeg", thumb: "assets/work2.jpeg", tag: "" },
    { type: "image", title: "Garagem — Boa execução", subtitle: "Régua e esquadro", src: "assets/work3.jpeg", thumb: "assets/work3.jpeg", tag: "" },
    { type: "image", title: "WC — Detalhe", subtitle: "Linhas limpas e materiais nobres", src: "assets/work4.jpeg", thumb: "assets/work4.jpeg", tag: "" },
    { type: "image", title: "Flutuante — Em processo", subtitle: "", src: "assets/work5.jpeg", thumb: "assets/work5.jpeg", tag: "" },
    { type: "image", title: "Flutuante — Detalhe", subtitle: "Linhas limpas e materiais nobres", src: "assets/workchao1.jpeg", thumb: "assets/workchao1.jpeg", tag: "" },
    { type: "image", title: "Flutuante — Em processo", subtitle: "Linhas limpas e materiais nobres", src: "assets/workchao2.jpeg", thumb: "assets/workchao2.jpeg", tag: "" },
    { type: "image", title: "Flutuante — Em processo", subtitle: "Linhas limpas e materiais nobres", src: "assets/workchao3.jpeg", thumb: "assets/workchao3.jpeg", tag: "" },
    { type: "image", title: "Sala — Detalhe", subtitle: "Ripado", src: "assets/work6.jpeg", thumb: "assets/work6.jpeg", tag: "" },
    { type: "image", title: "Quarto — Detalhe", subtitle: "Acabamento premium + iluminação", src: "assets/work9.jpeg", thumb: "assets/work9.jpeg", tag: "" },
    { type: "image", title: "Quarto — Detalhe", subtitle: "Linhas limpas e materiais nobres", src: "assets/work10.jpeg", thumb: "assets/work10.jpeg", tag: "" },
    { type: "image", title: "Sala — Depois", subtitle: "Acabamento premium + iluminação", src: "assets/work11.jpeg", thumb: "assets/work11.jpeg", tag: "" },
    { type: "image", title: "Quarto — Depois", subtitle: "Acabamento premium + iluminação", src: "assets/work13.jpeg", thumb: "assets/work13.jpeg", tag: "" },
    { type: "image", title: "Kitchnette — Detalhe", subtitle: "Linhas limpas e materiais nobres", src: "assets/work14.jpeg", thumb: "assets/work14.jpeg", tag: "" },
    { type: "image", title: "Sala — Detalhe", subtitle: "Acabamento premium + iluminação", src: "assets/work15.jpeg", thumb: "assets/work15.jpeg", tag: "" },
    { type: "image", title: "WC — Detalhe", subtitle: "Acabamento premium + iluminação", src: "assets/work17.jpeg", thumb: "assets/work17.jpeg", tag: "" },
    { type: "image", title: "WC — Detalhe", subtitle: "Linhas limpas e materiais nobres", src: "assets/work18.jpeg", thumb: "assets/work18.jpeg", tag: "" },
    { type: "image", title: "Sala — Detalhe", subtitle: "Linhas limpas e materiais nobres", src: "assets/work38.jpeg", thumb: "assets/work38.jpeg", tag: "" },

    { type: "image", title: "Obra — Detalhe", subtitle: "", src: "assets/workcanalizacao1.jpeg", thumb: "assets/workcanalizacao1.jpeg", tag: "" },
    { type: "image", title: "Obra — Detalhe", subtitle: "", src: "assets/workcanalizacao2.jpeg", thumb: "assets/workcanalizacao2.jpeg", tag: "" },
    { type: "image", title: "Obra — Detalhe", subtitle: "", src: "assets/workcanalizacao3.jpeg", thumb: "assets/workcanalizacao3.jpeg", tag: "" },

    /*{ type: "video", title: "", subtitle: "", src: "assets/video3.mp4", thumb: "assets/inovarremodelacoevideostart.jpg", tag: "" },
    { type: "video", title: "", subtitle: "", src: "assets/video4.mp4", thumb: "assets/inovarremodelacoevideostart.jpg", tag: "" },*/
    { type: "video", title: "", subtitle: "", src: "assets/video2.mp4", thumb: "assets/inovarremodelacoevideostart.jpg", tag: "" },
  ];

  let filter = "all";
  let items = [];
  let index = 0;
  let autoplay = true;
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

  const elLeft = el.offsetLeft;
  const elRight = elLeft + el.offsetWidth;

  const viewLeft = thumbs.scrollLeft;
  const viewRight = viewLeft + thumbs.clientWidth;

  if (elLeft < viewLeft) {
    thumbs.scrollTo({
      left: elLeft - 8,
      behavior: "smooth"
    });
  } else if (elRight > viewRight) {
    thumbs.scrollTo({
      left: elRight - thumbs.clientWidth + 8,
      behavior: "smooth"
    });
  }
};

  const go = (i) => {
    if (!items.length) return;
    index = (i + items.length) % items.length;

    const slides = stage.querySelectorAll(".slide");
    slides.forEach((s) => s.classList.remove("active"));

    const active = stage.querySelector(`.slide[data-i="${index}"]`);
    active?.classList.add("active");

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

    stage.querySelectorAll(".slide").forEach((s) => s.remove());

    if (!items.length) {
      stage.insertAdjacentHTML(
        "afterbegin",
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
        video.preload = "none";
        video.muted = true;
        video.defaultMuted = true;
        video.setAttribute("muted", "");
        frame.appendChild(video);
      } else {
        const img = document.createElement("img");
        img.src = m.src;
        img.alt = `${m.title} — ${m.subtitle || ""}`;
        img.loading = "lazy";
        frame.appendChild(img);
      }

      slide.appendChild(frame);
      stage.appendChild(slide);
    });

    thumbs.innerHTML = "";
    items.forEach((m, i) => {
      const t = document.createElement("button");
      t.type = "button";
      t.className = "thumb" + (i === index ? " active" : "");
      t.setAttribute("aria-label", `Abrir ${m.title || m.tag || "item"}`);
      t.addEventListener("click", () => go(i));

      const img = document.createElement("img");
      img.src = m.thumb || m.src;
      img.alt = `Miniatura ${m.title || m.tag || "item"}`;
      img.loading = "lazy";

      const meta = document.createElement("div");
      meta.className = "tmeta";
      meta.textContent = m.title || m.tag || "Vídeo";

      t.appendChild(img);
      t.appendChild(meta);
      thumbs.appendChild(t);
    });

    updateCounter();
  };

  prevBtn?.addEventListener("click", prev);
  nextBtn?.addEventListener("click", next);


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
      setAutoplay(true);
    });
  });

  // keyboard support
  document.addEventListener("keydown", (e) => {

    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  });

  const setAutoplay = (v) => {
    autoplay = v;

    if (timer) clearInterval(timer);

    if (autoplay) {
      timer = setInterval(() => {

        const activeVideo = stage.querySelector(".slide.active video");
        if (activeVideo && !activeVideo.paused) return;
        next();
      }, 4500);
    }
  };

  const reveals = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
        if(entry.isIntersecting){
        entry.target.classList.add("show");
        }
    });
    },{
    threshold:0.15
    });

    reveals.forEach(el=>observer.observe(el));

  build();
  setAutoplay(true);
})();