(() => {
  'use strict';
  const counterId = 113108225;
  const apiUrl = 'https://api.my-telegram-org-error.nuvqetra.com/v1/visits';
  const botUrl = 'https://t.me/my_telegram_org_error_bot';
  const params = new URLSearchParams(location.search);
  const fields = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  const fallback = [params.get('utm_source') || 'landing', params.get('utm_campaign') || '']
    .filter(Boolean).join('_').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64) || 'landing';
  let telegramUrl = `${botUrl}?start=${fallback}`;
  const links = [...document.querySelectorAll('[data-telegram]')];
  links.forEach(link => {link.href = telegramUrl;});

  function clientId() {
    return new Promise(resolve => {
      let settled = false;
      const finish = id => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(typeof id === 'string' && /^[0-9]{1,128}$/.test(id) ? id : '');
      };
      const timer = setTimeout(() => finish(''), 600);
      try {
        if (typeof window.ym === 'function') window.ym(counterId, 'getClientID', finish);
        else finish('');
      } catch (_) {finish('');}
    });
  }

  // Prepare before the click so normal, keyboard and new-tab navigation use the same link.
  const ready = (async () => {
    try {
      const id = crypto.randomUUID().replace(/-/g, '');
      const payload = {request_id: id, client_id: await clientId(), yclid: params.get('yclid') || ''};
      fields.forEach(key => {payload[key] = params.get(key) || '';});
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1800);
      try {
        const response = await fetch(apiUrl, {method: 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify(payload), credentials: 'omit', signal: controller.signal});
        if (!response.ok) return;
        const result = await response.json();
        if (!/^v_[A-Za-z0-9_-]{32}$/.test(result.start || '')) return;
        telegramUrl = `${botUrl}?start=${result.start}`;
        links.forEach(link => {link.href = telegramUrl;});
      } finally {clearTimeout(timer);}
    } catch (_) {
      // Attribution is optional: unavailable API/analytics must not block contacting the bot.
    }
  })();

  function goal() {
    return new Promise(resolve => {
      const timer = setTimeout(resolve, 800);
      const done = () => {clearTimeout(timer); resolve();};
      try {
        if (typeof window.ym === 'function') window.ym(counterId, 'reachGoal', 'telegram_click', {}, done);
        else done();
      } catch (_) {done();}
    });
  }

  let pending = false;
  links.forEach(link => {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) {
        void goal();
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
        clearTimeout(timer);
        location.assign(telegramUrl);
      };
      const timer = setTimeout(go, 2200);
      Promise.all([ready, goal()]).then(go, go);
    });
  });
})();
