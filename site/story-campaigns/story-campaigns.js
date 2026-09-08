(() => {
  "use strict";

  const campaignIds = new Set(["private", "tap", "play", "lineage"]);
  const tabs = [...document.querySelectorAll("[data-campaign]")];
  const panels = [...document.querySelectorAll("[data-campaign-panel]")];

  function activateCampaign(id, options = {}) {
    if (!campaignIds.has(id)) return;

    tabs.forEach((tab) => {
      const active = tab.dataset.campaign === id;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });

    panels.forEach((panel) => {
      const active = panel.dataset.campaignPanel === id;
      panel.classList.toggle("is-active", active);
      panel.hidden = !active;
    });

    if (options.updateUrl !== false) {
      history.replaceState(null, "", `#${id}`);
    }

    if (options.focusPanel) {
      document.querySelector("#campaign-stage")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateCampaign(tab.dataset.campaign, { focusPanel: true }));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = tabs.length - 1;
      const nextTab = tabs[nextIndex];
      activateCampaign(nextTab.dataset.campaign);
      nextTab.focus();
    });
  });

  document.querySelectorAll("[data-preview-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const status = form.querySelector(".form-status");
      status.hidden = false;
      status.textContent = "Preview only. No lead was sent. The final form will be connected after the CRM acceptance test.";
    });
  });

  window.addEventListener("hashchange", () => {
    const nextId = location.hash.slice(1);
    if (campaignIds.has(nextId)) activateCampaign(nextId, { updateUrl: false });
  });

  const initialId = location.hash.slice(1);
  if (campaignIds.has(initialId)) activateCampaign(initialId, { updateUrl: false });
})();
