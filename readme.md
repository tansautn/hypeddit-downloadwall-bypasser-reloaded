# Hypeddit Bypasser
**Automates the download process on `Hypeddit` and `PumpYourSound`.**

[![Install Latest](https://img.shields.io/badge/Install-Latest%20Release-brightgreen)](https://github.com/tansautn/hypeddit-downloadwall-bypasser-reloaded/releases/latest/download/muzikDwlBypass3r.user.js)

## Current project state


- It seem fan2000 does not maintained his repo anymore (upstream of this repo, then i **created PR for years but it is not merged yet**)
- **So, I'd keep maintain this script here**. Checkout  [Releases](../../releases) for stable, tested script

## Changelog
_What's changes impact to script behavior most will be listed_
- `20251215`: Fixed `merged misstake` code syntax, correct statement blocks. Last tested working on hypp (a song only require SC fangate was picked for testing)
  
## Description:
This user script, named Hypeddit DownloadWallBypasser 2k24, is designed to bypass download gates on Hypeddit tracks. It automates the process of navigating through fangates that require interactions with various social media platforms like SoundCloud and Spotify, allowing users to download tracks without fulfilling these requirements manually.

## Mandatory:
To use this script effectively, users must ensure the following:
- **Soundcloud and Spotify accounts**: Users must be logged into their SoundCloud and Spotify accounts before running the script to bypass the fangates successfully.

## Usage:
This script can be used on Hypeddit's website to bypass download gates encountered when attempting to download tracks. It targets specific URLs related to Hypeddit tracks and SoundCloud login pages, ensuring seamless navigation through the download process.

## Installation:
1. Install [Tampermonkey](https://www.tampermonkey.net/) for your browser.
2. Click **[Install Latest Release](https://github.com/tansautn/hypeddit-downloadwall-bypasser-reloaded/releases/latest/download/muzikDwlBypass3r.user.js)** — Tampermonkey will prompt you to install.
3. Visit a Hypeddit track page and let the script run.

> The install link always points to the latest stable release via GitHub's `releases/latest/download/` redirect.
> Updates are detected automatically through the `@updateURL` header.

## FAQ

Q: Can't pass the email validation step
A: Please setup another email with a *valid* domain. That domain could be anything, it just needs to exists.

Q: I don't want to end up with accounts full of spam (Spotify, Soundcloud). Is there a workaround?
A: You could create "dummy"-accounts for the services. That way it doesn't matter that it reposts, comments, follows or even creates playlists.

## Configuration:
The script utilizes the `hypedditSettings` object to customize certain parameters. Users can configure these settings according to their preferences:
- `email`: Set your email address.
- `name`: Set your name.
- `comment`: Set the comment to be posted (e.g., "Nice one bruva!").
- `auto_close`: Set to `true` if you want the window to close automatically after a certain timeout.
- `auto_close_timeout_in_ms`: Set the timeout duration in milliseconds for the window to close automatically.

### Configuring `hypedditSettings`:
```javascript
window.hypedditSettings = {
    email: 'your_email@example.com',
    name: 'Your Name',
    comment: 'Your standard comment',
    auto_close: true,
    auto_close_timeout_in_ms: 5000
};
```

## Disclaimer
This script relays  heavily on HTML-elements like divs, classes and ids. When the webbuilder changes the page it could break this script. So please be aware of that. Some elements of the script are borrowed. But mostly is created from ground up with vanilla JS. I kind of got inspired by a snippet that was created by Zuko which provided a [userscript](https://gist.github.com/tansautn/d6abfbfcff5d7eb44fdb83f5abc89383) that would autoclick the Soundcloud part.

## Versions

| Version | Date | Notes |
|---|---|---|
| 2.1.2 | 2025-12-15 | Fixed merged mistake, statement blocks |

## Contributing / Development

Want to contribute or test changes locally? See **[development.md](./development.md)** for the full setup guide:

- Local HTTPS dev server via Vite (`pnpm dev`)
- Live reload trick via Tampermonkey `@require`
- ESLint with full GM/Tampermonkey globals
- CI release flow


