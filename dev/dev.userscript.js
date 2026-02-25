// ==UserScript==
// @name         [DEV] Hypeddit DownloadWallBypasser
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  DEV skeleton — loads script from local Vite HTTPS server. Do NOT install on production.
// @author       tansautn
// @match        https://hypeddit.com/*
// @match        https://pumpyoursound.com/*
// @match        https://secure.soundcloud.com/connect*
// @match        https://secure.soundcloud.com/authorize*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=hypeddit.com
// @require      https://localhost:8443/script.js
// @grant        unsafeWindow
// @grant        window.close
// ==/UserScript==

// ──────────────────────────────────────────────────────────────────────────────
// HOW TO USE (live reload trick):
//
//  1. Run `pnpm dev` in the project root → Vite starts at https://localhost:8443
//  2. First run: open https://localhost:8443 in your browser and accept the
//     self-signed certificate (one-time step per browser profile).
//  3. Install THIS file in Tampermonkey (not script.js directly).
//  4. Edit script.js in your IDE; Tampermonkey re-fetches on every page reload.
//  5. To force cache clear: Tampermonkey → Dashboard → this script → Editor →
//     "Save" or bump @version.
//
// NOTE: The @require URL points to localhost, so this skeleton works ONLY while
// `pnpm dev` is running. It is never meant to be published.
// ──────────────────────────────────────────────────────────────────────────────
