# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A personal blog built with **Hexo** (v7) using the **Butterfly** theme, deployed to GitHub Pages at `tomorin1214.github.io`. Author: `lnkstain`. Language: `zh-CN`, timezone: `Asia/Shanghai`.

## Commands

```bash
npm run build      # hexo generate — build static site to public/
npm run clean      # hexo clean — wipe public/ and db.json cache
npm run server     # hexo server — local dev at http://localhost:4000
npm run deploy     # hexo deploy — build + push to GitHub Pages
```

There is no test or lint suite.

## Architecture

**Content sources** live in `source/`:
- `source/_posts/` — blog posts as Markdown with YAML frontmatter
- `source/index.md` — the custom landing page (renders at `/`)
- `source/tags/index.md` — tag listing page
- `source/categories/index.md` — category listing page
- `source/img/` — static images (avatar, favicon, banners)

**Generation flow:** Markdown → `hexo-renderer-marked` renders posts → `hexo-generator-index` builds the post list → Butterfly theme wraps everything with Pug templates + Stylus CSS → static HTML/CSS/JS in `public/`.

**Key architectural decisions:**
- The blog post index is served at `/notes/`, not `/` (`index_generator.path: notes` in `_config.yml`). The root `/` is a custom welcome page (`source/index.md`).
- The Butterfly theme lives in `themes/butterfly/` (not a submodule, checked directly into the repo).
- Butterfly requires `hexo-renderer-pug` and `hexo-renderer-stylus` — any theme template or style work must use Pug/Stylus.
- Search is local (generates `search.xml`, searches over full post content).
- Pjax navigation and instant.page preloading are enabled in the theme for perceived performance.

## Configuration

Two-tier config system:
1. **`_config.yml`** — Hexo core: site metadata, URL structure, directory layout, syntax highlighting (`highlight.js`), index generator path (`/notes/`), pagination (10 posts/page), theme selection (`butterfly`), deploy target (`gh-pages` branch), and search settings.
2. **`_config.butterfly.yml`** — Butterfly theme overrides: navigation menu, social links, brand assets, colors, visual effects (canvas-nest, click-hearts, fireworks, typewriter subtitle, dark mode, rounded corners), sidebar widgets, post footer (CC BY-NC-SA 4.0), visitor counter (busuanzi).

`_config.landscape.yml` is a leftover from the previous theme and is unused.

## Content creation

Scaffolds in `scaffolds/`:
- `scaffolds/post.md` — template for `hexo new post "Title"`
- `scaffolds/page.md` — template for `hexo new page "Title"`
- `scaffolds/draft.md` — template for `hexo new draft "Title"`

Posts use `YYYY-MM-DD-Title` permalink format.

## Deployment

Push to `main` triggers the GitHub Actions workflow in `.github/workflows/deploy.yml`: checkout → Node 20 setup → `npm install` → `hexo generate` → deploy `public/` to `gh-pages` branch via `peaceiris/actions-gh-pages@v3`. Dependabot checks npm dependencies daily.
