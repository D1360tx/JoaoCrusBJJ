(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var b = document.body,
      t = document.querySelector(".menu"),
      n = document.querySelector(".nav"),
      h = document.querySelector(".header");

    function analyticsValue(value) {
      return String(value || "not_set")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "") || "not_set";
    }

    function analyticsContext(element) {
      if (!element) return "unknown";
      if (element.closest(".booking-dialog")) return "booking_dialog";
      if (element.closest(".mobile")) return "mobile_sticky";
      if (element.closest(".footer")) return "footer";
      if (element.closest(".header, .alert")) return "header";
      return "page_content";
    }

    function pushAnalytics(eventName, parameters) {
      if (!window.joaoConsentState ||
          (window.joaoConsentState.analytics_storage !== "granted" &&
           window.joaoConsentState.ad_storage !== "granted")) {
        if (parameters && typeof parameters.eventCallback === "function") {
          window.setTimeout(parameters.eventCallback, 0);
        }
        return false;
      }
      window.dataLayer = window.dataLayer || [];
      var payload = { event: eventName };
      Object.keys(parameters || {}).forEach(function (key) {
        if (parameters[key] !== undefined && parameters[key] !== null && parameters[key] !== "") {
          payload[key] = parameters[key];
        }
      });
      window.dataLayer.push(payload);
      return true;
    }

    function routeAcceptedLead(sourceEventName, parameters) {
      parameters = parameters || {};
      var consent = window.joaoConsentState || {};
      var analyticsGranted = consent.analytics_storage === "granted";
      var advertisingGranted = consent.ad_storage === "granted" && consent.ad_user_data === "granted";
      var callback = parameters && typeof parameters.eventCallback === "function"
        ? parameters.eventCallback
        : null;
      var clean = {};
      Object.keys(parameters || {}).forEach(function (key) {
        if (key !== "eventCallback" && key !== "eventTimeout" && key !== "meta_event_id" &&
            parameters[key] !== undefined && parameters[key] !== null && parameters[key] !== "") {
          clean[key] = parameters[key];
        }
      });

      if (analyticsGranted || advertisingGranted) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(Object.assign({ event: sourceEventName + "_routed" }, clean, {
          meta_event_id: parameters.meta_event_id
        }));
      }

      if (analyticsGranted) {
        var gaParameters = {
          form_name: clean.form_name,
          lead_type: clean.lead_type,
          program: clean.lead_program,
          location: clean.lead_location,
          event_callback: callback,
          event_timeout: parameters.eventTimeout || 1500
        };
        var ga4Command = typeof window.gtag === "function"
          ? window.gtag
          : function () { window.dataLayer.push(arguments); };
        ga4Command("event", sourceEventName === "lead_submit_success" ? "generate_lead" : sourceEventName, gaParameters);
      } else if (callback) {
        window.setTimeout(callback, 0);
      }

      if (advertisingGranted && typeof window.fbq === "function" && /^lead_[A-Za-z0-9-]{8,100}$/.test(parameters.meta_event_id || "")) {
        window.fbq("track", "Lead", {
          content_name: clean.form_name || "website_lead",
          content_category: clean.lead_type || "website_lead"
        }, { eventID: parameters.meta_event_id });
      }
      return analyticsGranted || advertisingGranted;
    }

    function formAnalyticsName(form) {
      if (form.matches("[data-booking-form]")) return "booking_dialog";
      if (form.dataset.formId) return analyticsValue(form.dataset.formId);
      return analyticsValue(location.pathname.replace(/^\/+|\/+$/g, "") || "home") + "_lead_form";
    }

    function leadType(form, data) {
      if (form.dataset.leadType) return analyticsValue(form.dataset.leadType);
      if (/private/i.test(data.program || "")) return "private_coaching";
      if (/team|corporate/i.test(data.program || "")) return "team_corporate";
      return "class_inquiry";
    }

    function leadAnalyticsParameters(form, data) {
      return {
        form_name: formAnalyticsName(form),
        form_context: form.matches("[data-booking-form]") ? "booking_dialog" : "page_form",
        lead_type: leadType(form, data),
        lead_program: analyticsValue(data.program),
        lead_location: analyticsValue(data.location),
        submission_page: location.pathname,
      };
    }

    function currentAttribution() {
      var attribution = window.joaoAttribution || {};
      return {
        first: attribution.first_touch || {},
        latest: attribution.last_touch || {},
      };
    }

    function currentMetaContext() {
      var attribution = window.joaoAttribution || {};
      return window.JoaoAttribution && typeof window.JoaoAttribution.metaContext === "function"
        ? window.JoaoAttribution.metaContext(window, attribution)
        : { ad_storage: "denied", ad_user_data: "denied" };
    }

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

    function alignHashTarget() {
      if (!window.location.hash) return;
      var target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
      if (target) target.scrollIntoView({ block: "start", behavior: "instant" });
    }

    if (window.location.hash) {
      window.addEventListener("load", alignHashTarget, { once: true });
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () {
          window.requestAnimationFrame(alignHashTarget);
        });
      }
    }

    var bookingDialog = document.createElement("dialog");
    bookingDialog.className = "booking-dialog";
    bookingDialog.setAttribute("aria-labelledby", "booking-title");
    bookingDialog.innerHTML =
      '<div class="booking-shell">' +
      '<header class="booking-top"><div><span class="booking-kicker">Plan a first class</span><h2 id="booking-title">FIND THE RIGHT <span class="booking-keep">FIRST CLASS.</span></h2></div><button class="booking-close" type="button" aria-label="Close first class request">Close</button></header>' +
      '<p class="booking-intro">Tell us who wants to train. We will contact you to match the right program, location, and class time. No payment is required.</p>' +
      '<form class="booking-form" data-booking-form data-form-id="booking_popup" data-lead-type="class_inquiry">' +
      '<div class="fields">' +
      '<div class="field"><label for="booking-name">Your name</label><input id="booking-name" name="name" type="text" autocomplete="name" required></div>' +
      '<div class="field"><label for="booking-phone">Mobile number</label><input id="booking-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" required></div>' +
      '<div class="field"><label for="booking-email">Email</label><input id="booking-email" name="email" type="email" autocomplete="email" required></div>' +
      '<div class="field"><label for="booking-program">Who wants to train?</label><select id="booking-program" name="program" required><option value="">Choose a program</option><option>Little Champions 3–7</option><option>Youth 8–12</option><option>Teens 13–17</option><option>Adults</option><option>Jiu-Jitsu After 60</option><option>Private Coaching</option><option>Team / Corporate</option><option>Not sure yet</option></select></div>' +
      '<div class="field"><label for="booking-location">Preferred location</label><select id="booking-location" name="location" required><option value="">Choose a location</option><option>Dripping Springs</option><option>Austin</option><option>Not sure yet</option></select></div>' +
      '<div class="field website-field" aria-hidden="true"><label for="booking-website">Leave this blank</label><input id="booking-website" name="website" type="text" tabindex="-1" autocomplete="off"></div>' +
      '<div class="field full check booking-consent"><input id="booking-consent" name="consent" type="checkbox" required><label for="booking-consent">Joao Crus BJJ may email or call me about this request. Automated texts are not enabled from this form.</label></div>' +
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
      var page = location.pathname.replace(/\/+$/, "").split("/").pop() || "index";
      var programs = {
        "little-champions": "Little Champions 3–7",
        "little-champions.html": "Little Champions 3–7",
        "toddlers-campaign-purposeful-play.html": "Little Champions 3–7",
        "youth-bjj": "Youth 8–12",
        "youth.html": "Youth 8–12",
        "youth-campaign-ages-8-12.html": "Youth 8–12",
        teens: "Teens 13–17",
        "teens-campaign-ages-13-17.html": "Teens 13–17",
        "adults-program": "Adults",
        "adults.html": "Adults",
        "jiu-jitsu-after-60": "Jiu-Jitsu After 60",
        "jiu-jitsu-after-60.html": "Jiu-Jitsu After 60",
        "private-bjj-lessons": "Private Coaching",
        "private-coaching.html": "Private Coaching",
        "team-building": "Team / Corporate",
        "teams.html": "Team / Corporate",
      };
      bookingProgram.value = programs[page] || "";
      bookingLocation.value = page === "austin-brazilian-jiu-jitsu" || page === "austin.html" ? "Austin" : "";
    }

    function openBooking(trigger) {
      if (typeof bookingDialog.showModal !== "function") {
        pushAnalytics("booking_start", {
          form_name: "contact_page",
          link_context: analyticsContext(trigger),
          submission_page: location.pathname,
        });
        window.location.href = trigger && trigger.href ? trigger.href : "contact.html";
        return;
      }
      lastBookingTrigger = trigger || document.activeElement;
      setNav(false);
      contextualBookingDefaults();
      bookingDialog.showModal();
      b.classList.add("booking-open");
      pushAnalytics("booking_start", {
        form_name: "booking_dialog",
        link_context: analyticsContext(trigger),
        lead_program: analyticsValue(bookingProgram.value),
        lead_location: analyticsValue(bookingLocation.value),
        submission_page: location.pathname,
      });
      requestAnimationFrame(function () {
        bookingDialog.querySelector("#booking-name").focus();
      });
    }

    function closeBooking() {
      if (bookingDialog.open) bookingDialog.close();
    }

    document.querySelectorAll('a[href$="contact.html"], a[href$="/contact/"]').forEach(function (link) {
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
    function postLead(data) {
      var controller = new AbortController();
      var timeout = window.setTimeout(function () { controller.abort(); }, 35000);
      return fetch("/api/lead.php", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(data),
        signal: controller.signal,
      }).then(function (response) {
        return response.text().then(function (text) {
          var body = {};
          try {
            body = text ? JSON.parse(text) : {};
          } catch (error) {
            body = {};
          }
          if (!response.ok || body.accepted !== true || body.contact_accepted !== true || body.opportunity_accepted !== true || body.request_id !== data.request_id || body.meta_event_id !== "lead_" + data.request_id) {
            throw new Error(body.error || "Unable to send your request.");
          }
          return body;
        });
      }).finally(function () {
        window.clearTimeout(timeout);
      });
    }

    function submitLeadForm(form, event) {
      event.preventDefault();
      var status = form.querySelector(".status"),
        submit = form.querySelector('[type="submit"]'),
        formData = new FormData(form),
        data = Object.fromEntries(formData.entries());
      if (formData.has("availability")) {
        data.availability = formData.getAll("availability").join(", ");
      }
      data.consent = Boolean(form.querySelector('[name="consent"]:checked'));
      data.form_id = form.dataset.formId || "website_form";
      data.request_id = form.dataset.requestId || (window.crypto && typeof window.crypto.randomUUID === "function"
        ? window.crypto.randomUUID()
        : "lead-" + Date.now() + "-" + Math.random().toString(16).slice(2));
      form.dataset.requestId = data.request_id;
      data.page = window.location.pathname;
      data.lead_type = leadType(form, data);
      data.attribution = currentAttribution();
      data.meta = currentMetaContext();
      status.textContent = "Sending your request…";
      submit.disabled = true;
      postLead(data)
        .then(function (acceptance) {
          var redirected = false;
          function redirectAfterSuccess() {
            if (redirected) return;
            redirected = true;
            window.location.href = form.dataset.successUrl || "/thank-you/";
          }
          var parameters = leadAnalyticsParameters(form, data);
          parameters.meta_event_id = acceptance.meta_event_id;
          parameters.eventCallback = redirectAfterSuccess;
          parameters.eventTimeout = 1500;
          if (data.lead_type === "guide") {
            routeAcceptedLead("guide_request_success", parameters);
          } else {
            routeAcceptedLead("lead_submit_success", parameters);
          }
          window.setTimeout(redirectAfterSuccess, 1700);
        })
        .catch(function (error) {
          var parameters = leadAnalyticsParameters(form, data);
          parameters.error_type = "submission_failed";
          pushAnalytics("lead_submit_error", parameters);
          status.textContent = error.message + " You can also call or text 512-644-4560.";
          status.focus();
          submit.disabled = false;
        });
    }

    bookingForm.addEventListener("submit", function (event) {
      submitLeadForm(bookingForm, event);
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
        submitLeadForm(f, e);
      };
    });
    document.addEventListener("click", function (event) {
      var link = event.target.closest("a[href]");
      if (!link) return;
      var href = link.getAttribute("href") || "";
      var common = {
        link_context: analyticsContext(link),
        page_path: location.pathname,
      };
      if (/^tel:/i.test(href)) {
        pushAnalytics("click_to_call", common);
        return;
      }
      if (/^mailto:/i.test(href)) {
        pushAnalytics("click_to_email", common);
        return;
      }
      if (/maps\.google\.com|google\.com\/maps|maps\.app\.goo\.gl/i.test(href)) {
        common.location_name = /1112|lamar|austin/i.test(href) ? "austin" : "dripping_springs";
        pushAnalytics("get_directions", common);
        return;
      }
      if (/(?:^|\/)(?:contact\.html|contact\/?)(?:[?#].*)?$/i.test(href) && !bookingDialog.open) {
        common.form_name = "contact_page";
        pushAnalytics("booking_start", common);
      }
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
