# error-vault
A personal technical knowledge system for capturing, understanding, and reusing software errors.

Error Vault is a Progressive Web App (PWA): a static site that installs to your phone's home screen and works offline.

## Run locally

Any static server works, for example:

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser.

## Install on your phone

Service workers and installation need HTTPS, so host the folder on any static host (GitHub Pages, Netlify, Cloudflare Pages, etc.) and open that URL on your phone:

- **iPhone (Safari):** Share → Add to Home Screen.
- **Android (Chrome):** menu (⋮) → Install app / Add to Home screen.

## Data

Entries are stored in the browser's localStorage on that device. Use **Export** to save a JSON backup and **Import** to restore it or move entries to another device.

## Files

- `index.html`, `styles.css`, `app.js`: the app
- `manifest.webmanifest`: install metadata
- `sw.js`: service worker for offline use (bump `CACHE_VERSION` when shipped files change)
- `icons/`: app icons
