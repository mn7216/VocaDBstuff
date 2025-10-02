// ==UserScript==
// @name         real report count instead of “!”
// @match        https://vocadb.net/*
// @run-at       document-start
// ==/UserScript==

(() => {
    'use strict';

    const done = new WeakSet();

    function replaceExclam() {
        const real = document.querySelector('a[href="/Admin/ViewEntryReports"] .badge.badge-small.badge-important');
        const cnt  = real?.textContent.trim();
        if (!cnt) return;

        const exclam = document.querySelector('nav.navbar-inverse .navbar-languageBar .badge.badge-small.badge-important');
        if (exclam && exclam.textContent.trim() === '!' && !done.has(exclam)) {
            exclam.textContent = cnt;
            done.add(exclam);
        }
    }

    /* ---- observer  ---- */
    const navMO = new MutationObserver(() => {
        const nav = document.querySelector('nav.navbar-inverse.navbar-fixed-top');
        if (nav) {
            replaceExclam();                                 // first hit
            new MutationObserver(replaceExclam).observe(nav, {childList:true, subtree:true});
            navMO.disconnect();                            // job done, stop looking for nav
        }
    });

    new MutationObserver((_, self) => {
        if (document.body) {
            navMO.observe(document.body, {childList:true, subtree:true});
            self.disconnect();
        }
    }).observe(document.documentElement, {childList:true});
})();