/* Review-only booking routing. No fetch, tracking, contact data, or automatic navigation. */
(function (root) {
  'use strict';
  // Verified Share URLs are not activation approval. Both gates must be released separately.
  var calendars = Object.freeze({
    'little:dripping-springs': Object.freeze({ id: 'WqEFb31yftWo7HOIxyv1', approved: false, url: 'https://api.leadconnectorhq.com/widget/booking/WqEFb31yftWo7HOIxyv1' }),
    'youth:dripping-springs': Object.freeze({ id: 'lwI401IPhkVBM5TUAhYm', approved: false, url: 'https://api.leadconnectorhq.com/widget/booking/lwI401IPhkVBM5TUAhYm' }),
    'homeschool:dripping-springs': Object.freeze({ id: 'TZDZNzvBn0gcHFyfjk2l', approved: false, url: 'https://api.leadconnectorhq.com/widget/booking/TZDZNzvBn0gcHFyfjk2l' }),
    'adults:dripping-springs': Object.freeze({ id: 'GO56GPdtrVWfqhOmGK3w', approved: false, url: 'https://api.leadconnectorhq.com/widget/booking/GO56GPdtrVWfqhOmGK3w' }),
    'youth:austin': Object.freeze({ id: 'wY51xc5N1INt6jsQByeC', approved: false, url: 'https://api.leadconnectorhq.com/widget/booking/wY51xc5N1INt6jsQByeC' })
  });
  var releaseEnabled = false;

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
      href: released ? calendar.url : null,
      bookable: !!released,
      label: 'Book Your Class',
      message: released ?
        'Choose a date and time. Your class is booked only after the calendar confirms it.' :
        'Booking paused for review. This calendar is not accepting reservations yet.'
    };
  }

  function mount(document) {
    document.querySelectorAll('[data-booking-card]').forEach(function (card) {
      var key = card.getAttribute('data-booking-card').split(':');
      var link = card.querySelector('[data-booking-link]');
      var result = resolve(key[0], key[1], calendars, releaseEnabled);
      link.textContent = result.label;
      link.setAttribute('aria-disabled', String(!result.bookable));
      if (result.bookable) link.setAttribute('href', result.href);
      else link.removeAttribute('href');
      card.querySelector('[data-booking-status]').textContent = result.message;
      link.addEventListener('click', function (event) {
        if (!result.bookable) event.preventDefault();
      });
    });
  }

  if (typeof module === 'object' && module.exports) {
    module.exports = { resolve: resolve, calendars: calendars, releaseEnabled: releaseEnabled, mount: mount };
  } else if (root.document) {
    mount(root.document);
  }
})(typeof window !== 'undefined' ? window : globalThis);
