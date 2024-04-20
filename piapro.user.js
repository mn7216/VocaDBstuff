// ==UserScript==
// @name download piapro song w/o login
// @namespace Violentmonkey Scripts
// @match https://piapro.jp/*
// @grant none
// @version 1.1
// @author MN_7216
// @description 4/20/2024, 3:34:43 PM
// @require https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/js/all.min.js
// @updateURL    https://raw.githubusercontent.com/mn7216/Vocalost/main/piapro.user.js
// @downloadURL  https://raw.githubusercontent.com/mn7216/Vocalost/main/piapro.user.js
// ==/UserScript==

(function() {
    'use strict';

    const DOWNLOAD_BUTTON_STYLE = `
        display: inline-block;
        margin-top: 10px;
        padding: 10px 20px;
        background-color: #ff0982;
        color: white;
        text-decoration: none;
        cursor: pointer;
        border-radius: 5px;
        font-weight: bold;
    `;

    function getSongUrl() {
        const scriptElement = [...document.getElementsByTagName('script')]
            .find(script => script.innerText.includes('"url":'));

        if (scriptElement) {
            const match = scriptElement.innerText.match(/"url":\s*"([^"]+)"/);
            return match ? match[1] : null;
        }

        return null;
    }

    function createDownloadButton(url) {
        const downloadButton = document.createElement('a');
        downloadButton.href = url;
        downloadButton.innerHTML = '<i class="fas fa-download"></i> Download Song';
        downloadButton.style.cssText = DOWNLOAD_BUTTON_STYLE;
        downloadButton.setAttribute('download', '');
        return downloadButton;
    }

    function insertDownloadButton(button) {
        const targetElement = document.querySelector('.contents_license');
        targetElement?.appendChild(button);
    }

    window.addEventListener('load', () => {
        const songUrl = getSongUrl();
        if (songUrl) {
            const downloadButton = createDownloadButton(songUrl);
            insertDownloadButton(downloadButton);
        }
    });
})();