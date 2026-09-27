(() => {
  'use strict';
  const counterId = 113108225;
  const params = new URLSearchParams(location.search);
  // Short campaign alias; full visit-to-payment attribution is configured separately.
  const payload = [params.get('utm_source') || 'landing', params.get('utm_campaign') || '']
    .filter(Boolean).join('_').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64) || 'landing';
  const telegramUrl = `https://t.me/my_telegram_org_error_bot?start=${payload}`;

  document.querySelectorAll('[data-telegram]').forEach(link => {
    link.href = telegramUrl;
    let pending = false;
    link.addEventListener('click', event => {
      // Preserve browser conventions for opening a link in a new tab.
      const separateTab = event.ctrlKey || event.metaKey || event.shiftKey || event.altKey;
      if (separateTab || event.button !== 0) {
        try {
          if (typeof window.ym === 'function') window.ym(counterId, 'reachGoal', 'telegram_click');
        } catch (_) {}
        return;
      }
      event.preventDefault();
      if (pending) return;
      pending = true;
      let navigated = false;
      const go = () => {
        if (navigated) return;
        navigated = true;
        pending = false;
        location.assign(telegramUrl);
      };
      const timeout = setTimeout(go, 800);
      try {
        if (typeof window.ym === 'function') {
          window.ym(counterId, 'reachGoal', 'telegram_click', {}, () => {
            clearTimeout(timeout);
            go();
          });
        } else {
          clearTimeout(timeout);
          go();
        }
      } catch (_) {
        clearTimeout(timeout);
        go();
      }
    });
  });
})();
