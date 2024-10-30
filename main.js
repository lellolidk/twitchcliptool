// ==UserScript==
// @name         ClipButton Twitch zu Discord
// @namespace    http://tampermonkey.net/
// @version      2024-10-30
// @description  try to take over the world!// ==UserScript==
// @name         ClipButton für twitch
// @namespace    https://lellolidk.de/
// @version      1.0
// @description  ok
// @author       lellolidk
// @match        https://www.twitch.tv/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const clientid = "";
    const token = "";
    const discordWebhookUrl = "";

    async function createClip() {
        try {
            const broadcasterId = await getBroadcasterId();
            if (!broadcasterId) {
                console.error("couldnt get id");
                return;
            }

            const clipResponse = await fetch(`https://api.twitch.tv/helix/clips?broadcaster_id=${broadcasterId}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Client-Id": clientid,
                },
            });
            const clipData = await clipResponse.json();
            if (clipData.data && clipData.data[0]) {
                const clipUrl = `https://clips.twitch.tv/${clipData.data[0].id}`;
                sendToDiscord(clipUrl);
            } else {
                console.error("couldnt clip");
            }
        } catch (error) {
            console.error("Error whiel clipping:", error);
        }
    }

    function sendToDiscord(clipUrl) {
        fetch(discordWebhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: `${clipUrl}` }),
        }).then(response => {
            if (response.ok) {
                console.log("Clip send to discord");
            } else {
                console.error("Error while sending to discord");
            }
        });
    }

    async function getBroadcasterId() {
        const username = window.location.pathname.slice(1);
        const response = await fetch(`https://api.twitch.tv/helix/users?login=${username}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Client-Id": clientid,
            },
        });
        const data = await response.json();
        return data.data && data.data[0] ? data.data[0].id : null;
    }

    function addButton() {
        const subButton = document.querySelector('[data-a-target="subscribe-button"]');
        const giftSubButton = document.querySelector('[data-a-target="gift-button"]');
        const manageSubButton = document.querySelector('[data-a-target="manage-subreddit-button"]');
        const targetButton = subButton || giftSubButton || manageSubButton;

        if (targetButton && !document.querySelector("#clip-button")) {
            const button = document.createElement("button");
            button.id = "clip-button";
            button.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 24 24">
                    <path d="M9.25 3a.75.75 0 0 1 .75.75v2.5h4.5v-2.5a.75.75 0 0 1 1.5 0v2.5h1.5A2.75 2.75 0 0 1 20.25 9v10.25A2.75 2.75 0 0 1 17.5 22H6.5a2.75 2.75 0 0 1-2.75-2.75V9A2.75 2.75 0 0 1 6.5 6.25h1.5v-2.5a.75.75 0 0 1 .75-.75zM7 9.75a.75.75 0 0 0 0 1.5h10a.75.75 0 0 0 0-1.5H7z"/>
                </svg>`;
            button.style.cssText = `
                border: none;
                border-radius: 20%;
                width: 40px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-left: 10px;
                cursor: pointer;
            `;
            button.onclick = createClip;
            targetButton.parentNode.insertBefore(button, targetButton.nextSibling);
        }
    }

    const observer = new MutationObserver(addButton);
    observer.observe(document.body, { childList: true, subtree: true });

    addButton();
})();