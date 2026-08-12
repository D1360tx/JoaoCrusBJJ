(function () {
  var comparison = document.querySelector("[data-comparison]");
  var frames = Array.prototype.slice.call(document.querySelectorAll("[data-frame]"));
  var syncToggle = document.querySelector("[data-sync-scroll]");
  var syncing = false;

  function setView(view) {
    comparison.className = "comparison " + view;
    document.querySelectorAll("[data-view]").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.dataset.view === view));
    });
  }

  document.querySelectorAll("[data-view]").forEach(function (button) {
    button.addEventListener("click", function () { setView(button.dataset.view); });
  });

  function frameWindow(frame) {
    try { return frame.contentWindow; } catch (error) { return null; }
  }

  function frameDocument(frame) {
    try { return frame.contentDocument; } catch (error) { return null; }
  }

  function sectionSelector(name) {
    return { top: "main", paths: ".ff-paths", coach: ".ff-coach", form: "#find-class" }[name];
  }

  document.querySelectorAll("[data-jump]").forEach(function (button) {
    button.addEventListener("click", function () {
      var selector = sectionSelector(button.dataset.jump);
      frames.forEach(function (frame) {
        var doc = frameDocument(frame);
        var target = doc && doc.querySelector(selector);
        if (target) target.scrollIntoView({ block: "start", behavior: "smooth" });
      });
    });
  });

  function bindScroll(frame) {
    var win = frameWindow(frame);
    var doc = frameDocument(frame);
    if (!win || !doc || frame.dataset.syncBound) return;
    frame.dataset.syncBound = "true";
    win.addEventListener("scroll", function () {
      if (!syncToggle.checked || syncing) return;
      var root = doc.documentElement;
      var max = Math.max(1, root.scrollHeight - win.innerHeight);
      var ratio = win.scrollY / max;
      syncing = true;
      frames.forEach(function (other) {
        if (other === frame) return;
        var otherWin = frameWindow(other);
        var otherDoc = frameDocument(other);
        if (!otherWin || !otherDoc) return;
        var otherMax = Math.max(1, otherDoc.documentElement.scrollHeight - otherWin.innerHeight);
        otherWin.scrollTo(0, ratio * otherMax);
      });
      window.requestAnimationFrame(function () { syncing = false; });
    }, { passive: true });
  }

  frames.forEach(function (frame) {
    frame.addEventListener("load", function () { bindScroll(frame); });
    if (frame.contentDocument && frame.contentDocument.readyState === "complete") bindScroll(frame);
  });
})();
