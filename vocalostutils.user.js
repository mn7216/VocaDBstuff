// ==UserScript==
// @name         Vocalost Utils for NicoNico
// @namespace    https://github.com/mn7216/Vocalost
// @version      2.0
// @author       MN_7216 
// @match        https://www.nicovideo.jp/watch/*
// @match        https://www.nicovideo.jp/user/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/mn7216/Vocalost/main/vocalostutils.user.js
// @downloadURL  https://raw.githubusercontent.com/mn7216/Vocalost/main/vocalostutils.user.js
// @supportURL   https://github.com/mn7216/Vocalost/issues
// ==/UserScript==

(() => {
  'use strict';

  /* ---------- CONFIG ---------- */
  const CFG = {
    video: {
      Archives: [
        ['Nicolog',  id => `https://www.nicolog.jp/watch/${id}`],
        ['Hatena',   id => `https://b.hatena.ne.jp/entry/www.nicovideo.jp/watch/${id}`],
        ['Nicopedia',id => `https://dic.nicovideo.jp/t/v/${id}`],
        ['VocaDB',   id => `https://vocadb.net/Search?searchType=Song&filter=${encodeURIComponent('https://www.nicovideo.jp/watch/'+id)}`],
        ['Archive',  url=> `https://web.archive.org/web/*/${url}`],
        ['Thumb S',  nId=> `https://nicovideo.cdn.nimg.jp/thumbnails/${nId}/${nId}`],
        ['Thumb M',  nId=> `https://nicovideo.cdn.nimg.jp/thumbnails/${nId}/${nId}.M`],
        ['Thumb L',  nId=> `https://nicovideo.cdn.nimg.jp/thumbnails/${nId}/${nId}.L`],
      ],
      Search: [
        ['Google',  id => `https://www.google.com/search?q="${id}"`],
        ['Bing',    id => `https://www.bing.com/search?q="${id}"`],
        ['NND',     id => `https://www.nicovideo.jp/search/${id}`],
        ['Openlist',id => `https://www.nicovideo.jp/openlist/${id}`],
        ['YouTube', id => `https://www.youtube.com/results?search_query="${id}"`],
        ['Sogou',   id => `https://www.sogou.com/web?query="${id}"`],
        ['Yandex',  id => `https://yandex.com/search/?text=${id}`],
      ]
    },
    user: {
      User: [
        ['Nicolog',  id => `https://www.nicolog.jp/user/${id}`],
        ['PFP 1', nId => `https://secure-dcdn.cdn.nimg.jp/nicoaccount/usericon/${nId.slice(0,3)}/${nId}.jpg`],
        ['PFP 2', nId => `https://secure-dcdn.cdn.nimg.jp/nicoaccount/usericon/${nId.slice(0,4)}/${nId}.jpg`],
        ['PFP 3', nId => `https://secure-dcdn.cdn.nimg.jp/nicoaccount/usericon/${nId.slice(0,2)}/${nId}.jpg`],
        ['Archive', url=> `https://web.archive.org/web/*/${url}`],
      ]
    }
  };

  const ICON = new Map([
    [/google/i,'🔍'], [/bing|yandex/i,'🔎'], [/nnd/i,'🎵'], [/openlist/i,'📋'],
    [/youtube/i,'▶️'], [/archive/i,'📚'], [/thumb/i,'🖼️'], [/nicolog/i,'📝'],
    [/pfp/i,'👤'], [/hatena/i,'💬'], [/nicopedia/i,'📖'], [/vocadb/i,'🎤']
  ]);

  /* ---------- HELPERS ---------- */
  const $ = (s, p = document) => p.querySelector(s);
  const on = (el, ev, fn) => el.addEventListener(ev, fn);

  function parsePage() {
    const url  = location.href.split('?')[0];
    const type = url.includes('/user/') ? 'user' : url.includes('/watch/') ? 'video' : null;
    if (!type) return null;
    const id   = url.split('/').pop();
    return { type, baseId: id, numId: id.replace(/\D/g,''), cleanUrl: url };
  }

  function makeIcon(text) {
    for (const [re, ic] of ICON) if (re.test(text)) return ic;
    return '🔗';
  }

  /* ---------- UI ---------- */
  function injectCSS() {
    const s = document.createElement('style');
    s.textContent = `
    .vcl-btn{position:fixed;top:50%;right:0;transform:translateY(-50%);z-index:10000;
             padding:12px 14px;background:linear-gradient(135deg,#3a7bd5,#00d2ff);
             color:#fff;border-radius:8px 0 0 8px;cursor:pointer;box-shadow:0 4px 10px rgba(0,0,0,.2);
             transition:all .3s ease;border:none;overflow:hidden}
    .vcl-btn:hover{transform:translateY(-50%) translateX(-5px);box-shadow:0 6px 15px rgba(0,0,0,.25)}
    .vcl-box{display:none;position:fixed;top:50%;right:50px;transform:translateY(-50%);z-index:10001;
            background:#fff;border-radius:12px;padding:20px;width:320px;max-height:80vh;overflow-y:auto;
            box-shadow:0 10px 25px rgba(0,0,0,.15);font-family:-apple-system,BlinkMacSystemFont,Roboto,sans-serif}
    .vcl-box.show{display:block;animation:fadeIn .3s}
    .vcl-head{text-align:center;margin-bottom:15px;padding-bottom:10px;border-bottom:1px solid #eaeaea}
    .vcl-logo{font-size:20px;font-weight:bold;background:linear-gradient(135deg,#3a7bd5,#00d2ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
    .vcl-sub{font-size:12px;color:#888}
    .vcl-tabs{display:flex;justify-content:center;gap:10px;margin-bottom:15px}
    .vcl-tab{background:#f8f9fa;color:#555;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:600;font-size:14px;transition:all .2s}
    .vcl-tab.active{background:#3a7bd5;color:#fff;box-shadow:0 4px 8px rgba(58,123,213,.3)}
    .vcl-links{display:flex;flex-direction:column;gap:10px}
    .vcl-link{width:100%;padding:12px 15px;text-align:left;background:#f8f9fa;border:1px solid #eaeaea;border-left:4px solid #3a7bd5;border-radius:8px;cursor:pointer;transition:all .2s;display:flex;align-items:center;font-size:14px}
    .vcl-link:hover{transform:translateY(-2px);box-shadow:0 5px 15px rgba(0,0,0,.1);border-left-width:8px}
    .vcl-ico{margin-right:12px;font-size:18px}
    @keyframes fadeIn{from{opacity:0;transform:translateY(-50%) translateX(20px)}to{opacity:1;transform:translateY(-50%) translateX(0)}}
    `;
    document.head.appendChild(s);
  }

  function buildUI(page) {
    const cfg = CFG[page.type];

    const btn = document.createElement('button');
    btn.className = 'vcl-btn';
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>';

    const box = document.createElement('div');
    box.className = 'vcl-box';
    box.innerHTML = `
      <div class="vcl-head"><div class="vcl-logo">Vocalost</div><div class="vcl-sub">NicoNico Utilities</div></div>
      <div class="vcl-tabs"></div><div class="vcl-links"></div>`;

    const tabs = $('.vcl-tabs', box);
    const links= $('.vcl-links',box);

    Object.keys(cfg).forEach((name, idx) => {
      const tab = document.createElement('button');
      tab.className = 'vcl-tab';
      tab.textContent = name;
      on(tab, 'click', () => {
        document.querySelectorAll('.vcl-tab').forEach(t=>t.classList.remove('active'));
        tab.classList.add('active');
        renderLinks(cfg[name], page);
      });
      tabs.appendChild(tab);
      if (!idx) tab.click();
    });

    on(btn, 'click', e => { e.stopPropagation(); box.classList.toggle('show'); });
    on(document, 'click', e => {
      if (!btn.contains(e.target) && !box.contains(e.target)) box.classList.remove('show');
    });

    document.body.append(btn, box);

    function renderLinks(items, p) {
      links.innerHTML = '';
      items.forEach(([text, fn], i) => {
        const a = document.createElement('button');
        a.className = 'vcl-link';
        a.innerHTML = `<span class="vcl-ico">${makeIcon(text)}</span><span>${text}</span>`;
        const url = fn(p.type==='video'? p.baseId : p.numId, p.cleanUrl);
        on(a, 'click', () => window.open(url, '_blank'));
        links.appendChild(a);
      });
    }
  }

  /* ---------- BOOT ---------- */
  const page = parsePage();
  if (page) { injectCSS(); buildUI(page); }
})();