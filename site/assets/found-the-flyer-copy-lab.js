(function () {
  var comparison = document.querySelector("[data-comparison]");
  var frames = Array.prototype.slice.call(document.querySelectorAll("[data-frame]"));
  var syncToggle = document.querySelector("[data-sync-scroll]");
  var syncing = false;
  var suppressUntil = 0;
  var sectionSelectors = [
    '[data-compare-section="hero"]', '.ff-hero',
    '[data-compare-section="story"]', '.ff-story',
    '[data-compare-section="paths"]', '.ff-paths',
    '[data-compare-section="coach"]', '.ff-coach',
    '[data-compare-section="process"]', '.ff-process',
    '[data-compare-section="form"]', '#find-class'
  ];

  function variantUrl(name) {
    var rawReview = window.location.hostname === "raw.githack.com";
    var files = { control: "found-the-flyer-control.html", active: "found-the-flyer-active.html" };
    var routes = { control: "/found-the-flyer-control/", active: "/found-the-flyer-active/" };
    return rawReview ? files[name] : routes[name];
  }

  function loadFrame(frame) {
    frame.removeAttribute("data-sync-bound");
    frame.src = variantUrl(frame.dataset.frame) + "?lab=" + frame.dataset.frame + "&review=" + Date.now();
  }

  frames.forEach(loadFrame);

  document.querySelectorAll("[data-review-link]").forEach(function (link) {
    link.href = variantUrl(link.dataset.reviewLink);
  });

  function setView(view) {
    comparison.className = "comparison " + view;
    document.querySelectorAll("[data-view]").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.dataset.view === view));
    });
  }

  document.querySelectorAll("[data-view]").forEach(function (button) {
    button.addEventListener("click", function () { setView(button.dataset.view); });
  });

  document.querySelectorAll("[data-reload]").forEach(function (button) {
    button.addEventListener("click", function () {
      var frame = document.querySelector('[data-frame="' + button.dataset.reload + '"]');
      if (frame) loadFrame(frame);
    });
  });

  function frameWindow(frame) {
    try { return frame.contentWindow; } catch (error) { return null; }
  }

  function frameDocument(frame) {
    try { return frame.contentDocument; } catch (error) { return null; }
  }

  function pageSections(doc) {
    var result = [];
    sectionSelectors.forEach(function (selector) {
      var element = doc.querySelector(selector);
      if (element && result.indexOf(element) === -1) result.push(element);
    });
    return result.sort(function (a, b) { return a.offsetTop - b.offsetTop; });
  }

  function sectionSelector(name) {
    return { top: ".ff-hero", paths: ".ff-paths", coach: ".ff-coach", form: "#find-class" }[name];
  }

  document.querySelectorAll("[data-jump]").forEach(function (button) {
    button.addEventListener("click", function () {
      var selector = sectionSelector(button.dataset.jump);
      frames.forEach(function (frame) {
        var doc = frameDocument(frame);
        var target = doc && doc.querySelector(selector);
        if (target) frameWindow(frame).scrollTo({ top: target.offsetTop, behavior: "smooth" });
      });
    });
  });

  function syncToSection(sourceFrame, targetFrame) {
    var sourceWin = frameWindow(sourceFrame);
    var sourceDoc = frameDocument(sourceFrame);
    var targetWin = frameWindow(targetFrame);
    var targetDoc = frameDocument(targetFrame);
    if (!sourceWin || !sourceDoc || !targetWin || !targetDoc) return;

    var sourceSections = pageSections(sourceDoc);
    var targetSections = pageSections(targetDoc);
    if (!sourceSections.length || sourceSections.length !== targetSections.length) {
      var sourceMax = Math.max(1, sourceDoc.documentElement.scrollHeight - sourceWin.innerHeight);
      var targetMax = Math.max(1, targetDoc.documentElement.scrollHeight - targetWin.innerHeight);
      targetWin.scrollTo(0, (sourceWin.scrollY / sourceMax) * targetMax);
      return;
    }

    var sourceY = sourceWin.scrollY;
    var index = sourceSections.reduce(function (current, section, i) {
      return section.offsetTop <= sourceY + 4 ? i : current;
    }, 0);
    var sourceStart = sourceSections[index].offsetTop;
    var sourceEnd = index + 1 < sourceSections.length ? sourceSections[index + 1].offsetTop : sourceDoc.documentElement.scrollHeight;
    var progress = Math.max(0, Math.min(1, (sourceY - sourceStart) / Math.max(1, sourceEnd - sourceStart)));
    var targetStart = targetSections[index].offsetTop;
    var targetEnd = index + 1 < targetSections.length ? targetSections[index + 1].offsetTop : targetDoc.documentElement.scrollHeight;
    targetWin.scrollTo(0, targetStart + progress * Math.max(0, targetEnd - targetStart));
  }

  function bindScroll(frame) {
    var win = frameWindow(frame);
    var doc = frameDocument(frame);
    if (!win || !doc || frame.dataset.syncBound) return;
    frame.dataset.syncBound = "true";
    win.addEventListener("scroll", function () {
      if (!syncToggle.checked || syncing || Date.now() < suppressUntil) return;
      syncing = true;
      suppressUntil = Date.now() + 180;
      frames.forEach(function (other) {
        if (other !== frame) syncToSection(frame, other);
      });
      window.setTimeout(function () { syncing = false; }, 140);
    }, { passive: true });
  }

  frames.forEach(function (frame) {
    frame.addEventListener("load", function () { bindScroll(frame); });
  });

  if (window.matchMedia("(min-width: 901px)").matches) syncToggle.checked = true;
  if (window.matchMedia("(max-width: 900px)").matches) setView("active");
})();
