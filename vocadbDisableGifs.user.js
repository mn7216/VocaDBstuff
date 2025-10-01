// ==UserScript==
// @name         Stop VocaDB GIFs
// @match        https://vocadb.net/*
// ==/UserScript==

(() => {
    'use strict';

    const stop = (img) => {
        if (!img.complete || img.dataset.stopped) return;
        img.dataset.stopped = true;

        const c = document.createElement('canvas');
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        c.className = img.className;
        c.style.cssText = img.style.cssText;
        c.getContext('2d').drawImage(img, 0, 0);

        if (img.parentNode) {
            img.parentNode.replaceChild(c, img);
        }
    };
    const sel = 'img[src*=".gif" i]';
    new MutationObserver(() => document.querySelectorAll(sel).forEach(stop))
        .observe(document.body, { childList: true, subtree: true });
    document.querySelectorAll(sel).forEach(img => {
        img.complete ? stop(img) : img.addEventListener('load', () => stop(img), { once: true });
    });
})();