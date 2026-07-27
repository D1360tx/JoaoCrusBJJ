(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var body = document.body;
    var button = document.querySelector(".program-menu-button");
    var nav = document.querySelector(".program-global-links");
    var programMenus = document.querySelectorAll("[data-programs-menu]");

    function closePrimaryNav() {
      body.classList.remove("program-nav-open");
      if (button) {
        button.setAttribute("aria-expanded", "false");
        button.textContent = "Menu";
      }
    }

    if (button && nav) {
      button.addEventListener("click", function () {
        var open = body.classList.toggle("program-nav-open");
        button.setAttribute("aria-expanded", String(open));
        button.textContent = open ? "Close" : "Menu";
      });
      nav.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", closePrimaryNav);
      });
    }

    document.addEventListener("click", function (event) {
      programMenus.forEach(function (menu) {
        if (!menu.contains(event.target)) menu.removeAttribute("open");
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      programMenus.forEach(function (menu) {
        if (menu.open) {
          menu.removeAttribute("open");
          menu.querySelector("summary").focus();
        }
      });
      closePrimaryNav();
    });

    var hero = document.querySelector(".hero");
    var mobileCta = document.querySelector(".mobile-cta");
    if (hero && mobileCta && "IntersectionObserver" in window) {
      body.classList.add("program-hero-in-view");
      new IntersectionObserver(function (entries) {
        body.classList.toggle("program-hero-in-view", entries[0].isIntersecting);
      }, { threshold: 0.08 }).observe(hero);
    }
  });
})();
