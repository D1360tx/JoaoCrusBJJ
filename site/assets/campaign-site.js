(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var b = document.body,
      t = document.querySelector(".menu"),
      n = document.querySelector(".nav");
    if (t) {
      t.onclick = function () {
        var o = b.classList.toggle("nav-open");
        t.setAttribute("aria-expanded", o);
        t.textContent = o ? "Close" : "Menu";
      };
    }
    var programMenus = document.querySelectorAll("[data-programs-menu]");
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
      b.classList.remove("nav-open");
      if (t) {
        t.setAttribute("aria-expanded", "false");
        t.textContent = "Menu";
      }
    });
    if (n) {
      n.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          b.classList.remove("nav-open");
          if (t) {
            t.setAttribute("aria-expanded", "false");
            t.textContent = "Menu";
          }
        });
      });
    }
    document.querySelectorAll(".faqbtn").forEach(function (q) {
      q.onclick = function () {
        var a = document.getElementById(q.getAttribute("aria-controls")),
          o = q.getAttribute("aria-expanded") === "true";
        q.setAttribute("aria-expanded", !o);
        a.hidden = o;
        q.querySelector("b").textContent = o ? "+" : "–";
      };
    });
    document.querySelectorAll("[data-form]").forEach(function (f) {
      f.onsubmit = function (e) {
        e.preventDefault();
        var s = f.querySelector(".status");
        s.textContent =
          "Preview complete: this form is ready to connect after Joao confirms the booking system. For now, call or text 512-644-4560.";
        s.focus();
      };
    });
    var z = document.querySelectorAll("[data-zone],.jc-calendar"),
      v = new Set();
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (es) {
          es.forEach(function (e) {
            e.isIntersecting ? v.add(e.target) : v.delete(e.target);
          });
          b.classList.toggle("engaged", v.size > 0);
        },
        { threshold: 0.08 },
      );
      z.forEach(function (e) {
        io.observe(e);
      });
    }
    document.querySelectorAll("[data-year]").forEach(function (e) {
      e.textContent = new Date().getFullYear();
    });
  });
})();
