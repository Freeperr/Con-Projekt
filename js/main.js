// CON—PROJEKT — geteiltes Verhalten für alle Seiten
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    document.body.classList.add("is-loaded");
    injectGrain();
    setYear();
    initNav();
    initPageTransitions();
    initReveal();
    initCursor();
    initHoverPreview();
    initBackToTop();
    initBaSliders();
    initKontaktForm();
  }

  function injectGrain() {
    if (document.querySelector(".grain-overlay")) return;
    var g = document.createElement("div");
    g.className = "grain-overlay";
    document.body.appendChild(g);
  }

  function setYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---- Vollbild-Navigation ---- */
  function initNav() {
    var toggle = document.querySelector(".menu-toggle");
    var overlay = document.getElementById("navOverlay");
    if (!toggle || !overlay) return;

    function close() {
      overlay.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
    function open() {
      overlay.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    }
    toggle.addEventListener("click", function () {
      var isOpen = overlay.classList.contains("is-open");
      isOpen ? close() : open();
    });
    overlay.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", close);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  /* ---- Sanfte Seitenübergänge ---- */
  function initPageTransitions() {
    document.querySelectorAll('a[href]').forEach(function (link) {
      var href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (link.target === "_blank") return;
      var url;
      try { url = new URL(href, window.location.href); } catch (e) { return; }
      if (url.origin !== window.location.origin) return;

      link.addEventListener("click", function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        document.body.classList.add("is-leaving");
        document.body.classList.remove("is-loaded");
        setTimeout(function () { window.location.href = href; }, 260);
      });
    });
  }

  /* ---- Scroll-Reveal ---- */
  function initReveal() {
    var targets = document.querySelectorAll("[data-reveal]");
    if (!targets.length) return;
    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (t) { t.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    targets.forEach(function (t) { io.observe(t); });
  }

  /* ---- Eigener Cursor für Objekt-Bilder ---- */
  function initCursor() {
    var zones = document.querySelectorAll(".cursor-zone");
    if (!zones.length || window.matchMedia("(max-width: 900px)").matches) return;

    var dot = document.createElement("div");
    dot.className = "cursor-dot";
    dot.textContent = "Ansehen";
    document.body.appendChild(dot);

    var raf = null, mx = 0, my = 0;
    function move() {
      dot.style.transform = "translate(" + mx + "px," + my + "px) scale(1)";
      raf = null;
    }

    zones.forEach(function (zone) {
      zone.addEventListener("mouseenter", function () { dot.classList.add("is-active"); });
      zone.addEventListener("mouseleave", function () { dot.classList.remove("is-active"); });
      zone.addEventListener("mousemove", function (e) {
        mx = e.clientX; my = e.clientY;
        if (!raf) raf = requestAnimationFrame(move);
      });
    });
  }

  /* ---- Bild-Vorschau bei Hover in der Objekte-Liste ---- */
  function initHoverPreview() {
    var rows = document.querySelectorAll(".objekt-row[data-image]");
    if (!rows.length) return;

    var preview = document.createElement("div");
    preview.className = "hover-preview";
    preview.innerHTML = '<div class="placeholder-img">[Bild folgt]</div>';
    document.body.appendChild(preview);
    var inner = preview.querySelector(".placeholder-img");

    var raf = null, mx = 0, my = 0;
    function move() {
      preview.style.left = mx + "px";
      preview.style.top = my + "px";
      raf = null;
    }

    rows.forEach(function (row) {
      row.addEventListener("mouseenter", function () {
        inner.className = "placeholder-img " + (row.getAttribute("data-image") || "ph-stone");
        preview.classList.add("is-active");
      });
      row.addEventListener("mouseleave", function () { preview.classList.remove("is-active"); });
      row.addEventListener("mousemove", function (e) {
        mx = e.clientX; my = e.clientY;
        if (!raf) raf = requestAnimationFrame(move);
      });
    });
  }

  function initBackToTop() {
    var btn = document.querySelector(".to-top");
    if (!btn) return;
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---- Vorher/Nachher-Slider ---- */
  function initBaSliders() {
    document.querySelectorAll("[data-ba-slider]").forEach(setupSlider);
  }

  function setupSlider(root) {
    var before = root.querySelector(".ba-before");
    var handle = root.querySelector(".ba-handle");
    var labelBefore = root.querySelector(".ba-label-before");
    var labelAfter = root.querySelector(".ba-label-after");
    var dragging = false;

    function setPosition(percent) {
      percent = Math.max(0, Math.min(100, percent));
      before.style.clipPath = "inset(0 " + (100 - percent) + "% 0 0)";
      handle.style.left = percent + "%";
      if (labelBefore) labelBefore.style.opacity = percent < 10 ? "0" : "1";
      if (labelAfter) labelAfter.style.opacity = percent > 90 ? "0" : "1";
    }

    function percentFromEvent(e) {
      var rect = root.getBoundingClientRect();
      var x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      return (x / rect.width) * 100;
    }

    root.addEventListener("pointerdown", function (e) {
      dragging = true;
      root.setPointerCapture(e.pointerId);
      setPosition(percentFromEvent(e));
    });
    root.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      setPosition(percentFromEvent(e));
    });
    root.addEventListener("pointerup", function () { dragging = false; });
    root.addEventListener("pointercancel", function () { dragging = false; });

    setPosition(50);
  }

  /* ---- Kontaktformular (statisch, kein Backend angebunden) ---- */
  function initKontaktForm() {
    var form = document.querySelector(".kontakt-form form");
    if (!form) return;
    var successNote = form.querySelector(".form-note-success");
    var errorNote = form.querySelector(".form-note-error");
    var submitBtn = form.querySelector("button[type=submit]");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (successNote) successNote.classList.remove("is-visible");
      if (errorNote) errorNote.classList.remove("is-visible");
      if (submitBtn) submitBtn.disabled = true;

      var data = {
        name: form.name.value,
        email: form.email.value,
        objekt: form.objekt.value,
      };

      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then(function (res) { return res.json().then(function (body) { return { ok: res.ok, body: body }; }); })
        .then(function (result) {
          if (result.ok && result.body.ok) {
            if (successNote) successNote.classList.add("is-visible");
            form.reset();
          } else {
            if (errorNote) errorNote.classList.add("is-visible");
          }
        })
        .catch(function () {
          if (errorNote) errorNote.classList.add("is-visible");
        })
        .finally(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }
})();
