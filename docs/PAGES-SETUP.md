# Static site (GitHub Pages)

This folder is a **static landing** for **Cloude Code ToolBox**. No build step—plain HTML + CSS.

**Note:** This file is named **`PAGES-SETUP.md`** (not `README.md`) so GitHub Pages never treats it as the site homepage. The live site entry is **`index.html`**.

## Preview locally

From the **monorepo root**:

```bash
npm run serve:site
```

From **`packages/cloude-code-toolbox/`** (extension folder):

```bash
npm run serve:site
```

Either way opens **http://localhost:5173** (same script; the extension package serves **`../../docs`**).

Alternatively from the repo root:

```bash
npx --yes serve docs -l 5173
```

Alternatively:

```bash
cd docs && python3 -m http.server 8080
```

Open **http://localhost:8080**.

**Screenshots:** `docs/index.html` loads gallery images from **`raw.githubusercontent.com`** (same as [Github-Copilot-ToolBox](https://github.com/amitchorasiya/Github-Copilot-ToolBox)). After you push new captures to **`main`** under the monorepo root `screenshots/`, the site picks them up automatically (refresh cache with the `?v=` query on each URL when you change files).

## Publish on GitHub Pages

1. Repo **Settings** → **Pages**.
2. **Build and deployment** → Source: **Deploy from a branch**.
3. Branch: **`main`** → folder **`/docs`** (not **`/` (root)**) → Save.

**Important:** If the folder is **`/` (root)**`, GitHub turns your **repo `README.md`** into the site home — you get plain, unstyled text. The **designed** site lives in **`docs/index.html`**, so the source **must** be **`/docs`**.

This folder includes **`.nojekyll`** so GitHub does not run Jekyll on your static files.

The default GitHub URL (before custom domain) is:

`https://<user>.github.io/Cloude-Code-ToolBox/`

## Custom domain: `copilottoolbox.layai.co`

See **`docs/CNAME`** if present. DNS: CNAME **`copilottoolbox`** → **`amitchorasiya.github.io`**. Update the hostname and **`docs/CNAME`** if you point a new domain at this site; the canonical GitHub Pages URL is still valid without a custom domain.

Full steps: [GitHub Pages custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).

## If the custom domain still shows a plain README

1. Confirm Pages **folder** is **`/docs`**, not **`/`**.
2. Open **`https://copilottoolbox.layai.co/index.html`** — if that shows the styled site, wait a few minutes and hard-refresh `/` (CDN cache).
3. Safari: **Develop → Empty Caches** (enable Develop menu first), or try a private window.
