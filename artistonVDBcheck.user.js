// ==UserScript==
// @name         NicoNico → VocaDB
// @namespace    https://github.com/mn7216/Vocalost
// @description  Check if artist is on VDB
// @match        https://www.nicovideo.jp/user/*
// @namespace    https://github.com/mn7216/VocaDBstuff
// @updateURL    https://raw.githubusercontent.com/mn7216/Vocalost/main/artistonVDBcheck.user.js
// @downloadURL  https://raw.githubusercontent.com/mn7216/Vocalost/main/artistonVDBcheck.user.js
// ==/UserScript==

(() => {
  'use strict';

  /* ---------- helpers ---------- */
  const $ = s => document.querySelector(s);
  const waitFor = (s, t = 10_000) => new Promise(res => {
    const obs = new MutationObserver(() => {
      const el = $(s);
      if (el) { obs.disconnect(); res(el); }
    });
    obs.observe(document, { childList: true, subtree: true });
    setTimeout(() => { obs.disconnect(); res(null); }, t);
  });

  /* ---------- main ---------- */
  (async () => {
    const nickEl = await waitFor('h3.UserDetailsHeader-nickname');
    if (!nickEl) return;

    const artistName = nickEl.textContent.trim();
    const channelUrl = location.href.replace(/\?.*/, ''); // drop query-string

    const btn = document.createElement('button');
    btn.textContent = 'Scan on VocaDB';
    btn.style.marginLeft = '10px';
    Object.assign(btn.style, {
      padding: '6px 10px', borderRadius: '5px', border: '1px solid #999',
      background: '#fff', cursor: 'pointer'
    });
    nickEl.after(btn);

    btn.disabled = true;
    btn.textContent = 'Scanning…';

    try {
      const qs = new URLSearchParams({
        query: `${channelUrl} ${artistName}`,
        fields: 'Tags', maxResults: 5
      });
      const res = await fetch(`https://vocadb.net/api/artists?${qs}`);
      if (!res.ok) throw new Error(res.status);
      const { items = [] } = await res.json();

      btn.disabled = false;
      if (items.length) {
        btn.style.background = '#1EB980';
        btn.title = `${items.length} artist(s) found – click to open`;
        btn.onclick = () => window.open(`https://vocadb.net/Artist/Details/${items[0].id}`, '_blank');
      } else {
        btn.style.background = '#FF6859';
        btn.title = 'Not found';
        btn.onclick = () => window.open('https://vocadb.net/Artist/Create', '_blank');
      }
      btn.textContent = 'Scan on VocaDB';
    } catch (e) {
      console.error('[Nico→VocaDB] API error', e);
      btn.disabled = false;
      btn.style.background = '#FFCF44';
      btn.title = 'Network error – click to create manually';
      btn.onclick = () => window.open('https://vocadb.net/Artist/Create', '_blank');
      btn.textContent = 'Scan on VocaDB';
    }
  })();
})();