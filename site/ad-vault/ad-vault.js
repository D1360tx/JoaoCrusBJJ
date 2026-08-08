(() => {
  "use strict";

  const ROOT = "../../assets/ads-swipe/";
  const PROJECTS = {
    joao: "Joao Crus BJJ",
    "booked-out": "Booked Out",
    chalice: "Chalice Champagne",
    timepiece: "Timepiece Vault",
    icdc: "ICDC Ventures"
  };

  const creatives = [
    {
      id: "009",
      project: "joao",
      brand: "Jun Yuh / Creator College",
      title: "Storytelling Intensive",
      captured: "2026-08-07",
      image: `${ROOT}images/009-jun-yuh-storytelling-contact-sheet.jpg`,
      alt: "Chronological contact sheet from Jun Yuh's storytelling framework Reel",
      format: ["video", "landing-page"],
      audience: "small-business",
      funnel: "lead-capture",
      mediaLabel: "Reel + webinar page",
      hook: "Your story is the part competitors and AI cannot copy.",
      summary: "Turn one human moment into a recognizable tension, a belief, a demonstrated mechanism, and an invitation instead of publishing replaceable expertise alone.",
      takeaway: "Build Joao's ads and matching page modules around real moments such as Chris's schedule conflict, Kaiden learning to tap, purposeful play at age three, and one verified Carlson teaching principle. Keep each story tied to one audience and offer.",
      offer: "Free three-day live storytelling webinar",
      tags: ["video", "storytelling", "trust", "founder story", "landing page", "lead capture", "content system"],
      source: "https://www.instagram.com/reel/DbaVrU0sb0K/",
      landing: "https://creatorcollege.com/c/free-webinar",
      video: `${ROOT}video/009-jun-yuh-storytelling.mp4`,
      analysis: `${ROOT}009-jun-yuh-storytelling-framework.md`
    },
    {
      id: "008",
      project: "joao",
      brand: "Gym Launch",
      title: "The 2026 Gym Growth Playbook",
      captured: "2026-08-04",
      image: `${ROOT}images/008-gym-launch-2026-growth-playbook-contact-sheet.jpg`,
      alt: "Contact sheet of selected pages from the Gym Launch 2026 Gym Growth Playbook",
      format: ["lead-magnet", "landing-page"],
      audience: "academy-owner",
      funnel: "booking",
      mediaLabel: "135-page playbook",
      hook: "Build a connected five-gear acquisition machine.",
      summary: "Give away the strategic map, then sell diagnosis, sequencing, implementation, and accountability.",
      takeaway: "Use the playbook as a diagnostic checklist. Keep the three-door offer model, full-path measurement, and early-member touchpoints. Reject pressure-heavy sales tactics and unrealistic creative volume.",
      offer: "Free five-gear playbook → 15-minute implementation call",
      tags: ["lead magnet", "gym growth", "funnel", "nurture", "sales", "framework"],
      source: "https://drive.google.com/file/d/19qoLN7GMtNpB22P4WNonTo3TEd9JDFZd/view",
      landing: "https://meetings.hubspot.com/gymlaunch/2026",
      analysis: `${ROOT}008-gym-launch-2026-growth-playbook.md`
    },
    {
      id: "007",
      project: "joao",
      brand: "HighLevel × Neil Patel",
      title: "Ad-to-Lead Automation Playbook",
      captured: "2026-08-03",
      image: `${ROOT}images/007-highlevel-neil-patel-funnel-thumbnail.jpg`,
      alt: "Neil Patel video thumbnail presenting the exact acquisition system he would build from zero",
      format: ["video", "landing-page"],
      audience: "small-business",
      funnel: "lead-capture",
      mediaLabel: "Video funnel",
      hook: "If I had to start from zero tomorrow, here is exactly what I would build.",
      summary: "Teach the entire operating system before pitching the software: ad, focused page, source-tagged CRM, nurture, calendar, and outcome.",
      takeaway: "Keep Joao as the real teacher and route each ad to its matching program page. Preserve the native website experience, then connect source, consent, follow-up, booking, and enrollment behind it.",
      offer: "Exclusive 14-day HighLevel trial",
      tags: ["video", "crm", "lead nurture", "funnel", "authority", "system"],
      source: "https://www.facebook.com/neilkpatel/videos/2114088999504650/",
      landing: "https://www.gohighlevel.com/neil-patel-ghl",
      video: `${ROOT}video/007-highlevel-neil-patel-funnel.mp4`,
      analysis: `${ROOT}007-highlevel-neil-patel-funnel.md`
    },
    {
      id: "006",
      project: "joao",
      brand: "The BJJ Project",
      title: "Driskill Building Blocks",
      captured: "2026-08-03",
      image: `${ROOT}images/006-the-bjj-project-driskill-building-blocks-instagram-overlay.jpg`,
      alt: "Sponsored BJJ Project overlay shown inside an Instagram Reel",
      format: ["story-ad", "landing-page"],
      audience: "beginner",
      funnel: "direct-purchase",
      mediaLabel: "Reels overlay",
      hook: "If it feels complicated, you are not bad at this. You are missing the building blocks.",
      summary: "Compassionate diagnosis and a subtractive mechanism turn confusion into relief: fewer principles, learned in order, beat more disconnected moves.",
      takeaway: "Translate the absolution structure for parents: if a typical class feels too long, the child is not the problem. They need short activities, clear cues, and purposeful play.",
      offer: "$147 lifetime course with optional community trial",
      tags: ["overlay", "absolution", "simplicity", "beginner", "landing page", "mechanism"],
      landing: "https://www.thebjjproject.com/lp/driskill-building-blocks/good-jiu-jitsu-is-simple",
      analysis: `${ROOT}006-the-bjj-project-driskill-building-blocks.md`
    },
    {
      id: "005",
      project: "joao",
      brand: "Roger Gracie TV",
      title: "Purple Belt Essentials",
      captured: "2026-07-30",
      image: `${ROOT}images/005-roger-gracie-purple-belt-story-ad.jpg`,
      alt: "Roger Gracie holding a purple belt in a Purple Belt Essentials Instagram Story ad",
      format: ["story-ad", "landing-page"],
      audience: "advanced",
      funnel: "direct-purchase",
      mediaLabel: "Story ad",
      hook: "One physical object identifies the audience, aspiration, and product stage.",
      summary: "The purple belt works as instant segmentation while a detailed curriculum and simple one-time price carry the conversion argument.",
      takeaway: "Use real objects and moments as audience shorthand: a child receiving a first belt, a parent watching class, or Joao mapping positions during a private lesson.",
      offer: "$49.99 lifetime course; monthly and annual library alternatives",
      tags: ["story ad", "identity", "segmentation", "authority", "course", "offer"],
      landing: "https://rogergracietv.com/pages/roger-gracies-purple-belt-program",
      analysis: `${ROOT}005-roger-gracie-purple-belt-essentials.md`
    },
    {
      id: "004",
      project: "joao",
      brand: "BJJ Fanatics",
      title: "Arm Bar It All",
      captured: "2026-07-30",
      image: `${ROOT}images/004-bjj-fanatics-arm-bar-it-all-caption.jpg`,
      alt: "Instagram paid caption and creative for the BJJ Fanatics Arm Bar It All course",
      format: ["video", "landing-page"],
      audience: "advanced",
      funnel: "direct-purchase",
      mediaLabel: "Video + daily deal",
      hook: "Armbar anything from anywhere.",
      summary: "Package one narrow technique family as a complete system, demonstrate it with real footage, and layer an exact price reduction over the proof.",
      takeaway: "Package private coaching around one defined diagnostic problem, such as guard retention or a personal game roadmap, rather than advertising generic lessons.",
      offer: "$39.50 daily deal, anchored against $79",
      tags: ["video", "specialist", "demonstration", "daily deal", "urgency", "offer"],
      source: "https://www.instagram.com/p/DZp8TnFjJZ2/",
      landing: "https://bjjfanatics.com/products/arm-bar-it-all-by-shawn-melanson",
      video: `${ROOT}video/004-bjj-fanatics-arm-bar-it-all.mp4`,
      analysis: `${ROOT}004-bjj-fanatics-arm-bar-it-all.md`
    },
    {
      id: "003",
      project: "joao",
      brand: "Matt Arroyo",
      title: "Jiu Jitsu Jumpstart Blueprint",
      captured: "2026-07-30",
      image: `${ROOT}images/003-matt-arroyo-jumpstart-older-ad-dense-contact-sheet.jpg`,
      alt: "Contact sheet from Matt Arroyo's older-beginner Jiu Jitsu Jumpstart video ad",
      format: ["video", "landing-page"],
      audience: "beginner",
      funnel: "direct-purchase",
      mediaLabel: "Two-video portfolio",
      hook: "Here is something no one tells Jiu-Jitsu white belts.",
      summary: "Keep one mechanism stable, the hidden decision system beneath techniques, while rotating audience stories from confused white belts to older beginners.",
      takeaway: "For Joao, show what parents cannot see behind each game and what older adults need beyond athleticism: pacing, partner matching, coaching judgment, and a clear plan.",
      offer: "$139 one-time, displayed as reduced from $249",
      tags: ["video", "knowledge gap", "older beginner", "founder story", "mechanism", "ai b-roll"],
      source: "https://www.instagram.com/p/DZWeAguAC3y/",
      landing: "https://jumpstart.mattarroyo.com/",
      video: `${ROOT}video/003-matt-arroyo-jumpstart-blueprint.mp4`,
      analysis: `${ROOT}003-matt-arroyo-jumpstart-blueprint.md`
    },
    {
      id: "002",
      project: "joao",
      brand: "HPU Coaching",
      title: "White-to-Blue-Belt 90-Day System",
      captured: "2026-07-30",
      image: `${ROOT}images/002-hpu-coaching-static-ad.jpg`,
      alt: "HPU Coaching static proof ad promoting a white-to-blue-belt system",
      format: ["video", "story-ad", "landing-page"],
      audience: "beginner",
      funnel: "subscription",
      mediaLabel: "4-creative system",
      hook: "It is not a technique problem. It is a context problem.",
      summary: "Multiple hooks, proof modes, and formats all reinforce one mechanism: ordered training replaces a collection of disconnected moves.",
      takeaway: "This maps directly to Every Game Has a Job. Explain that a good children's class is not random games. Every activity connects to a clear developmental purpose.",
      offer: "$44/month standard or $125/month premium coaching",
      tags: ["video", "proof", "category education", "subscription", "system", "testimonial"],
      source: "https://www.instagram.com/p/DaxGyo0sQGM/",
      landing: "https://yourbjjgame.com/hpu-coaching",
      video: `${ROOT}video/002-hpu-coaching-white-to-blue-belt.mp4`,
      analysis: `${ROOT}002-hpu-coaching-white-to-blue-belt.md`
    },
    {
      id: "001",
      project: "joao",
      brand: "Roger Gracie TV",
      title: "White Belt Toolkit",
      captured: "2026-07-27",
      image: `${ROOT}images/001-roger-gracie-white-belt-toolkit-instagram-story.png`,
      alt: "Roger Gracie White Belt Toolkit Instagram Story ad with price and bonus",
      format: ["story-ad", "video", "landing-page"],
      audience: "beginner",
      funnel: "direct-purchase",
      mediaLabel: "Story + 15s video",
      hook: "The audience, product, price, bonus, and CTA are understood in seconds.",
      summary: "Stage-specific packaging, authority-led proof, a one-time price, and an equal-stated-value bonus create a compressed direct-response offer.",
      takeaway: "Use the pattern without copying the offer: ages 3–7, Joao's real class footage, the purposeful-play method, parent reassurance, and one clear class-match CTA.",
      offer: "$49.99 lifetime course plus stated $49.99 no-gi bonus",
      tags: ["story ad", "video", "identity", "bonus", "authority", "offer"],
      source: "https://www.instagram.com/p/DOnGX--gA0t/",
      landing: "https://rogergracietv.com/pages/roger-gracies-white-belt-toolkit",
      video: `${ROOT}video/001-roger-gracie-white-belt-toolkit-square.mp4`,
      analysis: `${ROOT}001-roger-gracie-white-belt-toolkit.md`
    }
  ];

  const state = {
    project: "joao",
    view: "newest",
    layout: "grid",
    query: "",
    format: "all",
    audience: "all",
    funnel: "all",
    saved: new Set(readSaved())
  };

  const elements = {
    grid: document.querySelector("#creative-grid"),
    search: document.querySelector("#search"),
    count: document.querySelector("#result-count"),
    kicker: document.querySelector("#results-kicker"),
    title: document.querySelector("#results-title"),
    empty: document.querySelector("#empty-state"),
    filterPanel: document.querySelector("#filter-panel"),
    filterToggle: document.querySelector("#filter-toggle"),
    format: document.querySelector("#format-filter"),
    audience: document.querySelector("#audience-filter"),
    funnel: document.querySelector("#funnel-filter"),
    dialog: document.querySelector("#creative-dialog"),
    toast: document.querySelector("#toast")
  };

  let toastTimer;
  let dialogTrigger;

  function readSaved() {
    try {
      return JSON.parse(localStorage.getItem("icdc_ad_vault_saved") || "[]");
    } catch (_) {
      return [];
    }
  }

  function writeSaved() {
    try {
      localStorage.setItem("icdc_ad_vault_saved", JSON.stringify([...state.saved]));
    } catch (_) {}
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function iconStar() {
    return '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z"></path></svg>';
  }

  function normalizedHaystack(item) {
    return [item.brand, item.title, item.hook, item.summary, item.takeaway, item.offer, ...item.tags].join(" ").toLowerCase();
  }

  function getFilteredItems() {
    let items = creatives.filter((item) => item.project === state.project);
    const query = state.query.trim().toLowerCase();
    if (query) items = items.filter((item) => normalizedHaystack(item).includes(query));
    if (state.format !== "all") items = items.filter((item) => item.format.includes(state.format));
    if (state.audience !== "all") items = items.filter((item) => item.audience === state.audience);
    if (state.funnel !== "all") items = items.filter((item) => item.funnel === state.funnel);

    if (state.view === "favorites") {
      items = items.filter((item) => state.saved.has(item.id));
    } else if (state.view === "funnels") {
      items = items.filter((item) => item.format.includes("landing-page") || item.format.includes("lead-magnet"));
    } else if (state.view === "offers") {
      items = items.filter((item) => item.offer);
    } else if (state.view === "hooks") {
      items.sort((a, b) => a.hook.length - b.hook.length);
    }

    if (state.view !== "hooks") {
      items.sort((a, b) => b.captured.localeCompare(a.captured) || b.id.localeCompare(a.id));
    }
    return items;
  }

  function renderCard(item) {
    const saved = state.saved.has(item.id);
    const tags = item.tags.slice(0, 6).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
    return `
      <article class="creative-card" data-id="${item.id}">
        <button class="favorite-button${saved ? " is-saved" : ""}" type="button" data-save="${item.id}" aria-label="${saved ? "Remove" : "Save"} ${escapeHtml(item.brand)} from favorites" aria-pressed="${saved}">
          ${iconStar()}
        </button>
        <button class="card-open" type="button" data-open="${item.id}" aria-label="Open ${escapeHtml(item.brand)} creative details">
          <div class="card-media">
            <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.alt)}" loading="lazy" width="590" height="1280">
            <span class="card-format">${escapeHtml(item.mediaLabel)}</span>
          </div>
          <div class="card-body">
            <div>
              <div class="card-topline">
                <h3 class="card-brand">${escapeHtml(item.brand)}</h3>
                <span class="card-number">${item.id}</span>
              </div>
              <p class="card-title">${escapeHtml(item.title)}</p>
            </div>
            <div>
              <span class="data-label">Hook</span>
              <p class="card-hook">${escapeHtml(item.hook)}</p>
              <p class="card-summary">${escapeHtml(item.summary)}</p>
            </div>
            <div>
              <span class="data-label">Offer</span>
              <p class="card-offer">${escapeHtml(item.offer)}</p>
              <div class="card-tags">${tags}</div>
            </div>
          </div>
        </button>
      </article>`;
  }

  function render() {
    const projectItems = creatives.filter((item) => item.project === state.project);
    const items = getFilteredItems();
    const isEmptyProject = projectItems.length === 0;

    elements.grid.innerHTML = items.map(renderCard).join("");
    elements.grid.hidden = items.length === 0;
    elements.empty.hidden = items.length !== 0;
    elements.count.textContent = String(items.length);
    elements.kicker.textContent = PROJECTS[state.project].toUpperCase();
    elements.title.lastChild.textContent = ` ${items.length === 1 ? "saved creative" : "saved creatives"}`;

    if (items.length === 0) {
      const label = elements.empty.querySelector(".eyebrow");
      const heading = elements.empty.querySelector("h2");
      const copy = elements.empty.querySelector("p:last-child");
      label.textContent = isEmptyProject ? "OPEN COLLECTION" : "NO MATCHES";
      heading.textContent = isEmptyProject ? "No swipes here yet." : "Try a wider search.";
      copy.textContent = isEmptyProject
        ? "This project is ready. Send an ad, landing page, buy box, email, or offer you want saved and analyzed."
        : "Clear a filter or search for a broader hook, format, audience, offer, or brand.";
    }

    document.querySelectorAll("[data-project]").forEach((button) => {
      const active = button.dataset.project === state.project;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    document.querySelectorAll("[data-view]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.view === state.view);
    });
    document.querySelectorAll("[data-layout]").forEach((button) => {
      const active = button.dataset.layout === state.layout;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    elements.grid.classList.toggle("is-list", state.layout === "list");
    updateUrl();
  }

  function updateUrl() {
    const url = new URL(window.location.href);
    const values = {
      project: state.project === "joao" ? "" : state.project,
      view: state.view === "newest" ? "" : state.view,
      layout: state.layout === "grid" ? "" : state.layout,
      q: state.query,
      format: state.format === "all" ? "" : state.format,
      audience: state.audience === "all" ? "" : state.audience,
      funnel: state.funnel === "all" ? "" : state.funnel
    };
    Object.entries(values).forEach(([key, value]) => value ? url.searchParams.set(key, value) : url.searchParams.delete(key));
    history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function readUrl() {
    const params = new URLSearchParams(location.search);
    if (PROJECTS[params.get("project")]) state.project = params.get("project");
    if (["newest", "hooks", "offers", "funnels", "favorites"].includes(params.get("view"))) state.view = params.get("view");
    if (["grid", "list"].includes(params.get("layout"))) state.layout = params.get("layout");
    state.query = params.get("q") || "";
    state.format = params.get("format") || "all";
    state.audience = params.get("audience") || "all";
    state.funnel = params.get("funnel") || "all";
    elements.search.value = state.query;
    elements.format.value = state.format;
    elements.audience.value = state.audience;
    elements.funnel.value = state.funnel;
  }

  function openDialog(id, trigger) {
    const item = creatives.find((creative) => creative.id === id);
    if (!item) return;
    dialogTrigger = trigger;
    document.querySelector("#dialog-media").innerHTML = `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.alt)}">`;
    document.querySelector("#dialog-meta").textContent = `${item.id} · ${item.mediaLabel} · ${item.captured}`;
    document.querySelector("#dialog-title").textContent = `${item.brand} / ${item.title}`;
    document.querySelector("#dialog-hook").textContent = item.hook;
    document.querySelector("#dialog-summary").textContent = item.summary;
    document.querySelector("#dialog-takeaway").textContent = item.takeaway;
    document.querySelector("#dialog-offer").textContent = item.offer;
    document.querySelector("#dialog-tags").innerHTML = item.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");

    const actions = [];
    if (item.landing) actions.push(`<a href="${escapeHtml(item.landing)}" target="_blank" rel="noopener noreferrer">View landing page</a>`);
    if (item.source) actions.push(`<a href="${escapeHtml(item.source)}" target="_blank" rel="noopener noreferrer">Open source</a>`);
    if (item.video) actions.push(`<a href="${escapeHtml(item.video)}" target="_blank" rel="noopener noreferrer">Watch saved video</a>`);
    actions.push(`<a href="${escapeHtml(item.analysis)}" target="_blank" rel="noopener noreferrer">Full analysis</a>`);
    document.querySelector("#dialog-actions").innerHTML = actions.join("");
    elements.dialog.showModal();
  }

  function toggleSaved(id) {
    if (state.saved.has(id)) {
      state.saved.delete(id);
      showToast("Removed from saved view");
    } else {
      state.saved.add(id);
      showToast("Saved to favorites");
    }
    writeSaved();
    render();
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.classList.add("is-visible");
    toastTimer = setTimeout(() => elements.toast.classList.remove("is-visible"), 2200);
  }

  document.addEventListener("click", (event) => {
    const project = event.target.closest("[data-project]");
    if (project) {
      state.project = project.dataset.project;
      state.view = "newest";
      state.query = "";
      elements.search.value = "";
      render();
      document.querySelector("#library").scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const view = event.target.closest("[data-view]");
    if (view) {
      state.view = view.dataset.view;
      render();
      return;
    }
    const layout = event.target.closest("[data-layout]");
    if (layout) {
      state.layout = layout.dataset.layout;
      render();
      return;
    }
    const save = event.target.closest("[data-save]");
    if (save) {
      toggleSaved(save.dataset.save);
      return;
    }
    const open = event.target.closest("[data-open]");
    if (open) openDialog(open.dataset.open, open);
  });

  elements.search.addEventListener("input", () => {
    state.query = elements.search.value;
    render();
  });
  [elements.format, elements.audience, elements.funnel].forEach((select) => {
    select.addEventListener("change", () => {
      state.format = elements.format.value;
      state.audience = elements.audience.value;
      state.funnel = elements.funnel.value;
      render();
    });
  });

  elements.filterToggle.addEventListener("click", () => {
    const opening = elements.filterPanel.hidden;
    elements.filterPanel.hidden = !opening;
    elements.filterToggle.setAttribute("aria-expanded", String(opening));
  });
  document.querySelector("#clear-filters").addEventListener("click", () => {
    state.format = state.audience = state.funnel = "all";
    elements.format.value = elements.audience.value = elements.funnel.value = "all";
    render();
  });
  document.querySelector("#share-button").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      showToast("Filtered view copied");
    } catch (_) {
      const input = document.createElement("input");
      input.value = location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
      showToast("Filtered view copied");
    }
  });

  document.querySelector(".dialog-close").addEventListener("click", () => elements.dialog.close());
  elements.dialog.addEventListener("click", (event) => {
    if (event.target === elements.dialog) elements.dialog.close();
  });
  elements.dialog.addEventListener("close", () => {
    if (dialogTrigger) dialogTrigger.focus();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "/" && !/input|textarea|select/i.test(document.activeElement.tagName)) {
      event.preventDefault();
      elements.search.focus();
    }
  });

  readUrl();
  render();
})();
