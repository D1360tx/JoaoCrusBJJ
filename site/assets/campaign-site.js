(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var b = document.body,
      t = document.querySelector(".menu"),
      n = document.querySelector(".nav"),
      h = document.querySelector(".header");

    function updateNavOffset() {
      if (!n || !h || !b.classList.contains("nav-open")) return;
      n.style.setProperty("--nav-top", Math.max(0, h.getBoundingClientRect().bottom) + "px");
    }

    function setNav(open) {
      b.classList.toggle("nav-open", open);
      if (t) {
        t.setAttribute("aria-expanded", String(open));
        t.textContent = open ? "Close" : "Menu";
      }
      if (open) requestAnimationFrame(updateNavOffset);
    }

    if (t) {
      t.onclick = function () {
        setNav(!b.classList.contains("nav-open"));
      };
    }
    if (window.visualViewport) window.visualViewport.addEventListener("resize", updateNavOffset);
    window.addEventListener("resize", updateNavOffset);

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
      setNav(false);
    });
    if (n) {
      n.querySelectorAll("a").forEach(function (x) {
        x.addEventListener("click", function (event) {
          var samePageTarget = x.hash && x.pathname === window.location.pathname
            ? document.querySelector(x.hash)
            : null;
          if (samePageTarget) {
            event.preventDefault();
            setNav(false);
            window.history.pushState(null, "", x.hash);
            window.requestAnimationFrame(function () {
              samePageTarget.scrollIntoView({ block: "start" });
            });
            return;
          }
          setNav(false);
        });
      });
    }

    var bookingDialog = document.createElement("dialog");
    bookingDialog.className = "booking-dialog";
    bookingDialog.setAttribute("aria-labelledby", "booking-title");
    bookingDialog.innerHTML =
      '<div class="booking-shell">' +
      '<header class="booking-top"><div><span class="booking-kicker">Plan a first class</span><h2 id="booking-title">FIND THE RIGHT <span class="booking-keep">FIRST CLASS.</span></h2></div><button class="booking-close" type="button" aria-label="Close first class request">Close</button></header>' +
      '<p class="booking-intro">Tell us who wants to train. We will text you to match the right program, location, and class time. No payment is required.</p>' +
      '<form class="booking-form" data-booking-form>' +
      '<div class="fields">' +
      '<div class="field"><label for="booking-name">Your name</label><input id="booking-name" name="name" type="text" autocomplete="name" required></div>' +
      '<div class="field"><label for="booking-phone">Mobile number</label><input id="booking-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" required></div>' +
      '<div class="field"><label for="booking-program">Who wants to train?</label><select id="booking-program" name="program" required><option value="">Choose a program</option><option>Little Champions 3–7</option><option>Youth 8–12</option><option>Teens 13–17</option><option>Adults</option><option>Private Coaching</option><option>Team / Corporate</option><option>Not sure yet</option></select></div>' +
      '<div class="field"><label for="booking-location">Preferred location</label><select id="booking-location" name="location" required><option value="">Choose a location</option><option>Dripping Springs</option><option>Austin</option><option>Not sure yet</option></select></div>' +
      '<div class="field full check booking-consent"><input id="booking-consent" name="consent" type="checkbox" required><label for="booking-consent">Joao Crus BJJ may call or text me about this request.</label></div>' +
      '<div class="field full"><button class="btn booking-submit" type="submit">Request my first class →</button><p class="booking-assurance">Takes about 30 seconds. We will only use your information to help with this request.</p><p class="status" tabindex="-1" aria-live="polite"></p></div>' +
      '</div></form>' +
      '<div class="booking-direct">Prefer to talk now? <a href="tel:+151****4560">Call or text 512&#8209;644&#8209;4560</a></div>' +
      '</div>';
    document.body.appendChild(bookingDialog);

    var bookingForm = bookingDialog.querySelector("[data-booking-form]"),
      bookingClose = bookingDialog.querySelector(".booking-close"),
      bookingProgram = bookingDialog.querySelector("#booking-program"),
      bookingLocation = bookingDialog.querySelector("#booking-location"),
      lastBookingTrigger = null;

    function contextualBookingDefaults() {
      var page = location.pathname.split("/").pop();
      var programs = {
        "little-champions.html": "Little Champions 3–7",
        "toddlers-campaign-purposeful-play.html": "Little Champions 3–7",
        "youth.html": "Youth 8–12",
        "youth-campaign-ages-8-12.html": "Youth 8–12",
        "teens-campaign-ages-13-17.html": "Teens 13–17",
        "adults.html": "Adults",
        "private-coaching.html": "Private Coaching",
        "teams.html": "Team / Corporate",
      };
      bookingProgram.value = programs[page] || "";
      bookingLocation.value = page === "austin.html" ? "Austin" : "";
    }

    function openBooking(trigger) {
      if (typeof bookingDialog.showModal !== "function") {
        window.location.href = trigger && trigger.href ? trigger.href : "contact.html";
        return;
      }
      lastBookingTrigger = trigger || document.activeElement;
      setNav(false);
      contextualBookingDefaults();
      bookingDialog.showModal();
      b.classList.add("booking-open");
      requestAnimationFrame(function () {
        bookingDialog.querySelector("#booking-name").focus();
      });
    }

    function closeBooking() {
      if (bookingDialog.open) bookingDialog.close();
    }

    document.querySelectorAll('a[href$="contact.html"]').forEach(function (link) {
      if (!/(plan|first class|request|ask about)/i.test(link.textContent)) return;
      link.setAttribute("aria-haspopup", "dialog");
      link.addEventListener("click", function (event) {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        openBooking(link);
      });
    });
    bookingClose.addEventListener("click", closeBooking);
    bookingDialog.addEventListener("click", function (event) {
      if (event.target === bookingDialog) closeBooking();
    });
    bookingDialog.addEventListener("close", function () {
      b.classList.remove("booking-open");
      if (lastBookingTrigger && document.contains(lastBookingTrigger)) lastBookingTrigger.focus();
    });
    bookingDialog.addEventListener("cancel", function () {
      b.classList.remove("booking-open");
    });
    bookingForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var status = bookingForm.querySelector(".status");
      status.textContent =
        "Preview complete: this request form is ready to connect after Joao confirms the booking system. For now, call or text 512-644-4560.";
      status.focus();
    });

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
