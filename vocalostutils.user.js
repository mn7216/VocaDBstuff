// ==UserScript==
// @name         Vocalost Utils for NicoNico
// @namespace    https://github.com/mn7216/Vocalost
// @version      1.2
// @description  Make identifying, searching for, and archiving lost songs easier.
// @author       MN_7216
// @match        https://www.nicovideo.jp/watch/*
// @match        https://www.nicovideo.jp/user/*
// @grant        none
// @require      https://raw.githubusercontent.com/mn7216/Vocalost/main/vocaranks/database.js
// @updateURL    https://raw.githubusercontent.com/mn7216/Vocalost/main/vocalostutils.js
// @downloadURL  https://raw.githubusercontent.com/mn7216/Vocalost/main/vocalostutils.js
// @supportURL   https://github.com/mn7216/Vocalost/issues
// ==/UserScript==

(function() {
    'use strict';

    const pageUrl = window.location.href;
    const isUserPage = pageUrl.includes('/user/');
    let baseId = getPageBaseId(pageUrl);
    const numericId = extractNumericId(baseId);

    let tabsContent = generateTabsContent(isUserPage, baseId, numericId, pageUrl);

    const [menuButton, menuContent] = createMenuComponents();
    setupMenuInteraction(menuButton, menuContent);
    fillMenuWithTabs(menuContent, tabsContent);

    document.body.appendChild(menuButton);
    document.body.appendChild(menuContent);

    // -- Utility Functions -- //
    // 1. Get sm/nm link
    function getPageBaseId(url) {
        let id = url.split('/').pop();
        if (id.includes('?')) {
            id = id.split('?')[0];
        }
        return id;
    }
    // 2. Only get the numbers after sm/nm (which some sites use instead of the sm/nm)
    function extractNumericId(id) {
        return id.replace(/\D/g, '');
    }
    // 3. define the main features
    function generateTabsContent(isUserPage, baseId, numericId, pageUrl) {
        const databaseMatch = database.find(entry => entry.id === baseId);

        if (isUserPage) {
            return {
                'User': [
                    { text: 'Nicolog', url: `https://www.nicolog.jp/user/${baseId}` },
                    { text: 'PFP 1', url: `https://secure-dcdn.cdn.nimg.jp/nicoaccount/usericon/${substringForUserIcon(numericId, 3)}/${numericId}.jpg` },
                    { text: 'PFP 2', url: `https://secure-dcdn.cdn.nimg.jp/nicoaccount/usericon/${substringForUserIcon(numericId, 4)}/${numericId}.jpg` },
                    { text: 'PFP 3', url: `https://secure-dcdn.cdn.nimg.jp/nicoaccount/usericon/${substringForUserIcon(numericId, 2)}/${numericId}.jpg` }, // pfp can be stored with 2, 3, or 4 digits of the user's id (possibly more/less)
                    { text: 'Archive.org', url: `https://web.archive.org/web/*/${pageUrl}` }
                ]
            };
        } else {
            return {
                'Archives': generateArchiveLinks(baseId, numericId, pageUrl),
                'Search': [
                    { text: 'Google', url: `https://www.google.com/search?q="${baseId}"` },
                    { text: 'Bing', url: `https://www.bing.com/search?q="${baseId}"` },
                    { text: 'NND', url: `https://www.nicovideo.jp/search/${baseId}` },
                    { text: 'Openlists', url: `https://www.nicovideo.jp/openlist/${baseId}` },
                    { text: 'Youtube', url: `https://www.youtube.com/results?search_query="${baseId}"` },
                    { text: 'Sogou', url: `https://www.sogou.com/web?query="${baseId}"` },
                    { text: 'Yandex', url: `https://yandex.com/search/?text=+${baseId}` },
                ],
                'Database': databaseMatch ? [
                    { text: `Title: ${databaseMatch.title}` },
                    { text: `Availability: ${databaseMatch.availability}`, url: `https://www.nicolog.jp/watch/${databaseMatch.id}` },
                    { text: `Vocarank: ${databaseMatch.vocarank}`, url: `https://www.nicovideo.jp/watch/${getVocarankId(databaseMatch.vocarank)}` }
                ] : [{ text: 'No match found in the database' }]
            };
        }
    }
    // - Main video functions - //
    function generateArchiveLinks(baseId, numericId, pageUrl) {
        return [
            { text: 'Nicolog', url: `https://www.nicolog.jp/watch/${baseId}` },
            { text: 'Hatena', url: `https://b.hatena.ne.jp/entry/www.nicovideo.jp/watch/${baseId}` },
            { text: 'Nicopedia', url: `https://dic.nicovideo.jp/t/v/${baseId}` },
            { text: 'VocaDB', url: `https://vocadb.net/Search?searchType=Song&filter=https%3A%2F%2Fwww.nicovideo.jp%2Fwatch%2F${baseId}` },
            { text: 'Archive.org', url: `https://web.archive.org/web/*/${getCleanUrl(pageUrl)}` },
            { text: 'Small Thumbnail', url: `http://tn-skr4.smilevideo.jp/smile?i=${numericId}` },
            { text: 'Large Thumbnail', url: `http://tn.smilevideo.jp/smile?i=${numericId}.L` },
        ];
    }
    // get rid of annoying NND tracking information
    function getCleanUrl(pageUrl) {
        return pageUrl.split('?')[0];
    }

    function substringForUserIcon(id, length) {
        return id.substr(0, length);
    }

    // Get the video ID of the main video in the vocarank
    function getVocarankId(vocarank) {
        const mainVideo = database.find(entry => entry.vocarank === vocarank && entry.availability === 'Main Video');
        return mainVideo ? mainVideo.id : '';
    }

    // -- UI Functions -- //

    function createMenuComponents() {
        const menuButton = document.createElement('div');
        const menuContent = document.createElement('div');
        return [menuButton, menuContent];
    }

    function setupMenuInteraction(button, content) {
        stylizeMenuButton(button);
        button.onclick = () => toggleMenuContent(content);
    }

    function stylizeMenuButton(button) {
        button.innerHTML = '☰';
        button.setAttribute('style', 'position: fixed; top: 50%; right: 0; transform: translateY(-50%); z-index: 10000; cursor: pointer; padding: 10px; background-color: #333; color: white; font-size: 1.5em; border-radius: 5px 0 0 5px;');
        button.addEventListener('mouseenter', () => button.style.backgroundColor = '#555');
        button.addEventListener('mouseleave', () => button.style.backgroundColor = '#333');
    }

    function toggleMenuContent(content) {
        content.style.display = content.style.display === 'none' ? 'block' : 'none';
    }

    function fillMenuWithTabs(content, tabs) {
        configureMenuContentStyle(content);
        const tabsContainer = document.createElement('div');
        const tabContent = document.createElement('div');

        setupTabsContainer(tabsContainer, tabs, tabContent);
        content.appendChild(tabsContainer);
        content.appendChild(tabContent);

        if (Object.keys(tabs).length > 0) {
            selectFirstTab(tabContent, tabs);
        }
    }

    function configureMenuContentStyle(content) {
        content.setAttribute('style', 'display: none; position: fixed; top: 50%; right: 40px; transform: translateY(-50%); z-index: 10001; background-color: #FFF; border: 1px solid #CCC; border-radius: 5px; padding: 20px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); max-width: 300px;');
    }

    function setupTabsContainer(container, tabs, contentDisplay) {
        container.style.display = 'flex';
        container.style.flexWrap = 'wrap';
        container.style.justifyContent = 'center';
        container.style.padding = '10px';

        Object.keys(tabs).forEach((tabName, index) => {
            const tabButton = createTabButton(tabName);
            tabButton.onclick = () => activateTab(tabButton, tabs[tabName], contentDisplay);

            if (index === 0) tabButton.onclick();

            container.appendChild(tabButton);
        });
    }

    function createTabButton(name) {
        const button = document.createElement('button');
        button.textContent = name;
        button.className = 'menu-tab-button';
        button.setAttribute('style', 'background-color: #f2f2f2; color: black; border: none; padding: 10px 20px; margin: 0 5px 10px 0; border-radius: 5px; cursor: pointer;');
        button.addEventListener('mouseenter', () => button.style.backgroundColor = '#ddd');
        button.addEventListener('mouseleave', () => button.style.backgroundColor = '#f2f2f2');
        return button;
    }

    function activateTab(button, items, container) {
        document.querySelectorAll('.menu-tab-button').forEach(btn => btn.style.backgroundColor = '#f2f2f2');
        button.style.backgroundColor = '#ddd';
        updateTabContent(container, items);
    }

    function updateTabContent(container, items) {
        container.innerHTML = '';
        items.forEach(item => {
            const button = document.createElement('button');
            button.setAttribute('style', `
                width: 100%;
                padding: 10px;
                margin: 10px 0;
                text-align: center;
                background-color: #f0f0f0;
                background-image: linear-gradient(rgba(255, 255, 255, 0.5) 2px, transparent 2px),
                                  linear-gradient(90deg, rgba(255, 255, 255, 0.5) 2px, transparent 2px),
                                  linear-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(255, 255, 255, 0.3) 1px, transparent 1px);
                background-size: 20px 20px, 20px 20px, 10px 10px, 10px 10px;
                background-position: -2px -2px, -2px -2px, -1px -1px, -1px -1px;
                color: #333;
                border: 1px solid #ccc;
                border-radius: 5px;
                cursor: pointer;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                transition: transform 0.1s ease, box-shadow 0.1s ease;
             `);

            if (item.text.startsWith('Title:') || item.text.startsWith('Availability:') || item.text.startsWith('Vocarank:')) {
                button.style.backgroundColor = '#c0f0c0';
                button.style.color = '#006600';
            }

            button.addEventListener('mouseover', () => {
                button.style.transform = 'scale(1.03)';
                button.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
            });

            button.addEventListener('mouseout', () => {
                button.style.transform = 'scale(1)';
                button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
            });

            if (item.url) {
                button.addEventListener('click', () => { window.open(item.url, '_blank'); });
            }
            button.textContent = item.text;
            container.appendChild(button);
        });
    }

    function selectFirstTab(content, tabs) {
        const firstTabName = Object.keys(tabs)[0];
        updateTabContent(content, tabs[firstTabName]);
    }

})();