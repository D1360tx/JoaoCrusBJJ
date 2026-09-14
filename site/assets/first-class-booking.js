/* Review-only booking routing. No fetch, tracking, contact data, or automatic navigation. */
(function (root) {
  'use strict';
  // Calendar IDs were read from HighLevel. URLs and release approvals must be
  // read back independently; an ID, click, or thank-you view is not a booking.
  var calendars = Object.freeze({
    'little:dripping-springs': Object.freeze({ id: 'WqEFb31yftWo7HOIxyv1', approved: false, url: '' }),
    'youth:dripping-springs': Object.freeze({ id: 'lwI401IPhkVBM5TUAhYm', approved: false, url: '' }),
    'homeschool:dripping-springs': Object.freeze({ id: 'TZDZNzvBn0gcHFyfjk2l', approved: false, url: '' }),
    'adults:dripping-springs': Object.freeze({ id: 'GO56GPdtrVWfqhOmGK3w', approved: false, url: '' })
  });
  var releaseEnabled = false;
  var fallback = 'mailto:joaocrusbjj@gmail.com';

  function validBookingURL(value, id) {
    try {
      var url = new URL(value);
      return url.origin === 'https://api.leadconnectorhq.com' &&
        url.pathname === '/widget/booking/' + id && !url.search && !url.hash &&
        !url.username && !url.password;
    } catch (_) { return false; }
  }

  function resolve(program, location, registry, enabled) {
    var key = program + ':' + location;
    var routes = registry || calendars;
    var calendar = Object.prototype.hasOwnProperty.call(routes, key) ? routes[key] : null;
    var released = enabled === true && calendar && calendar.approved === true &&
      /^[A-Za-z0-9]{20}$/.test(calendar.id) && validBookingURL(calendar.url, calendar.id);
    return {
      href: released ? calendar.url : fallback,
      bookable: !!released,
      label: released ? 'Choose a first-class time' : 'Ask Joao about your first class',
      message: released ?
        'Choose an available time on HighLevel. Your place is booked only after the calendar confirms it.' :
        'Online booking is not open for this selection. Joao will personally call to help you choose the right class. You can also email him below.'
    };
  }

  function mount(document) {
    var chooser = document.querySelector('[data-first-class-chooser]');
    if (!chooser) return;
    var program = chooser.querySelector('[data-booking-program]');
    var location = chooser.querySelector('[data-booking-location]');
    var link = chooser.querySelector('[data-booking-link]');
    var status = chooser.querySelector('[data-booking-status]');
    function update() {
      var result = resolve(program.value, location.value, calendars, releaseEnabled);
      link.href = result.href;
      link.textContent = result.label;
      status.textContent = result.message;
    }
    program.addEventListener('change', update);
    location.addEventListener('change', update);
    update();
  }

  if (typeof module === 'object' && module.exports) {
    module.exports = { resolve: resolve, calendars: calendars, releaseEnabled: releaseEnabled, mount: mount };
  } else if (root.document) {
    mount(root.document);
  }
})(typeof window !== 'undefined' ? window : globalThis);
