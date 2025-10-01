// ==UserScript==
// @name         VocaDB Teto April Fools CSS Remover
// @description  Removes the TetoDB April Fools CSS link tag from VocaDB.
// @match        https://vocadb.net/*
// @run-at       document-end
// ==/UserScript==
//only relevant if there is the forced april fools css - you may want to use this to remove it since the teto css removes features like the username highlighting based on rank
(() => {
    'use strict';
    const FILE = 'tetoDb-Cs0Glcf5.css';
    const kill = link =>
        link.href && link.href.endsWith(FILE) && link.remove();
    document.querySelectorAll('link[rel="stylesheet"]').forEach(kill);

    new MutationObserver(() =>
        document.querySelectorAll('link[rel="stylesheet"]').forEach(kill)
    ).observe(document, { childList: true, subtree: true });
})();