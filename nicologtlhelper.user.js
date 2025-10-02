// ==UserScript==
// @name         VocaUtils Helper: Translation for Nicolog
// @namespace    https://github.com/mn7216/Vocalost
// @version      0.1
// @description  Make Nicolog easier to use for people less comfortable with Japanese, and without Google Translate's tendency to mess up formatting and give incorrect translations.
// @author       MN_7216
// @match        https://www.nicolog.jp/*
// @grant        none
// @updateURL   https://github.com/mn7216/VocaDBstuff/raw/main/nicologtlhelper.user.js
// @downloadURL https://github.com/mn7216/VocaDBstuff/raw/main/nicologtlhelper.user.js
// @supportURL  https://github.com/mn7216/VocaDBstuff/issues
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    const translations = {
        'ユーザー情報': 'User Info',
        'マイリスト数': 'Mylists:',
        '登録タグ': 'Tags:',
        'タグ履歴': 'History:',
        'ランキング履歴': 'Ranking History',
        'タイトル変更履歴': 'Title History',
        '動画説明変更履歴': 'Description History',
        'タイトル変更履歴': 'Title History',
        'グラフ表示': 'Graph',
        '直前の1週間においてはランキング圏内ではありませんでした。': 'This video has not been ranked within the past week.',
        '履歴はありません。': 'No history available.',
        '動画説明': 'Description: ‎ ',
        '取得日時': 'Archival Date/Time ‎ ',
        'エラー：この動画は存在しないか、削除された可能性があります。': 'Error: This video does not exist or may have been deleted.',
// The u+200E character is used cause html HATES multiple spaces and just compresses them into 1 which is annoying and looks bad so abuse this unicode character to get around it
    };

    const patternTranslations = [
    { from: /ユーザー情報：?/g, to: 'User Info: ' },
    { from: /ユーザー：?/g, to: 'User: ‎ ' },
    { from: /動画情報：?/g, to: 'Video Info' },
    { from: /全動画数：?/g, to: 'Total Number of Videos: ‎ ' },
    { from: /動画タイトル：?/g, to: 'Video Title: ‎ ' },
    { from: /投稿日時：?/g, to: 'Publish Date: ‎ ' },
    { from: /長さ：?/g, to: 'Length: ‎ ' },
    { from: /再生情報：?/g, to: 'Statistics: ‎ ' },
    { from: /再生数：?/g, to: 'Views: ‎ ' },
    { from: /マイリスト登録数：?/g, to: 'Added to Mylists: ‎ ' },
    { from: /コメント数：?/g, to: 'Comments: ‎ ' },
    { from: /(?:^|[^動画])動画説明：/g, to: 'Description: ‎ ' },
    { from: /(\d+)\s～\s(\d+)件目/g, to: 'Shown: $1 - $2' },
    { from: /動画ID：?/g, to: 'NND ID: ‎ ' },
    { from: /投稿者：?/g, to: 'Author: ‎ ' },
    { from: /(\d+)年(\d+)月(\d+)日/g, to: function(match, year, month, day) {
        const monthNames = ["January", "February", "March", "April", "May", "June",
                            "July", "August", "September", "October", "November", "December"];
        return `${monthNames[parseInt(month) - 1]} ${parseInt(day)}${getDaySuffix(day)}, ${year}`;
    }},
    { from: /(\d+)時(\d+)分(\d+)秒/g, to: '$1:$2:$3' },
    ];
// date conversion to western style
    function getDaySuffix(day) {
        const j = day % 10,
              k = day % 100;
        if (j == 1 && k != 11) {
            return "st";
        }
        if (j == 2 && k != 12) {
            return "nd";
        }
        if (j == 3 && k != 13) {
            return "rd";
        }
        return "th";
    }

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function getAllTextNodes() {
        var result = [];
        (function scanSubTree(node) {
            if (node.nodeType == 3) {
                result.push(node);
         } else {
         for (var i = 0; i < node.childNodes.length; i++) {
             scanSubTree(node.childNodes[i]);
      }
    }
  })(document.body);
  return result;
}

    function replaceTextOnPage(from, to, isRegex = false) {
        getAllTextNodes().forEach(function(node) {
            if (isRegex) {
                if (typeof to === "function") {
                    node.nodeValue = node.nodeValue.replace(from, to);
                } else {
                    node.nodeValue = node.nodeValue.replace(from, to);
                }
            } else {
                node.nodeValue = node.nodeValue.replace(new RegExp(escapeRegExp(from), 'g'), to);
            }
        });
    }

    Object.keys(translations).forEach(function(key) {
        replaceTextOnPage(key, translations[key]);
    });

    patternTranslations.forEach(function(pattern) {
        replaceTextOnPage(pattern.from, pattern.to, true);
    });
})();