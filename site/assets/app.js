/* Joao Crus BJJ — preview interactions */
(function () {
  "use strict";

  // Year stamp
  var yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();

  // Mobile nav toggle
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
    nav.querySelectorAll(".nav__links a").forEach(function (a) {
      a.addEventListener("click", function () { nav.classList.remove("open"); });
    });
  }

  // Reveal-on-scroll
  var revs = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revs.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revs.forEach(function (el) { io.observe(el); });
  } else {
    revs.forEach(function (el) { el.classList.add("in"); });
  }

  // Nav scrolled state (theme-aware via CSS class)
  var navEl = document.querySelector(".nav__inner");
  if (navEl) {
    window.addEventListener("scroll", function () {
      navEl.classList.toggle("scrolled", window.scrollY > 40);
    }, { passive: true });
  }

  // Theme toggle (dark <-> light), persisted, injected on every page
  var saved = null;
  try { saved = localStorage.getItem("jc-theme"); } catch (e) {}
  if (saved) document.body.setAttribute("data-theme", saved);

  function tLabel() {
    return document.body.getAttribute("data-theme") === "light" ? "◐ Dark mode" : "◑ Light mode";
  }
  var toggle = document.createElement("button");
  toggle.className = "themeToggle";
  toggle.type = "button";
  toggle.setAttribute("aria-label", "Toggle light or dark theme");
  toggle.textContent = tLabel();
  toggle.addEventListener("click", function () {
    var next = document.body.getAttribute("data-theme") === "light" ? "" : "light";
    if (next) document.body.setAttribute("data-theme", next);
    else document.body.removeAttribute("data-theme");
    try { localStorage.setItem("jc-theme", next); } catch (e) {}
    toggle.textContent = tLabel();
  });
  document.body.appendChild(toggle);

  // Lead-magnet form (preview: fake submit -> success state)
  var form = document.getElementById("leadForm");
  var success = document.getElementById("success");
  if (form && success) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      form.style.display = "none";
      success.classList.add("show");
      success.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }
})();
