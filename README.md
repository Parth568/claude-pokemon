# Pokemon

A serverless Pokémon search frontend built with [Vite](https://vitejs.dev/), backed by a static `pokemons.json` file. Type a name, get autocomplete suggestions, click or press Search to view stats, types, abilities, and official artwork — all client-side, no backend.

## Architecture

```
Browser ──fetch("/pokemons.json")──▶ Vite (static)
       ──fetch("...github.com/sprites")──▶ Pokémon images
```

- **No backend, no database** — `pokemons.json` (151 entries, ~52 KB) is served as a static asset.
- Search and lookup happen in-memory in the browser.

## Project Structure

```
.
├── package.json              # workspaces root + scripts
├── pokemon-api/              # Vite frontend
│   ├── index.html
│   ├── script.js             # fetch + in-memory search
│   ├── style.css
│   ├── vite.config.js
│   └── public/
│       └── pokemons.json     # served at GET /pokemons.json
└── pokemon-json/             # one-shot PokéAPI scraper
    └── script.js             # writes ../pokemon-api/public/pokemons.json
```

The repo uses **npm workspaces**, so a single `npm install` at the root installs everything.

## Setup

```bash
npm install
```

## Available Scripts

Run all of these from the repo root.

| Command         | What it does                                              |
| --------------- | --------------------------------------------------------- |
| `npm run dev`   | Start the Vite dev server at http://localhost:5173        |
| `npm run build` | Build the production bundle into `pokemon-api/dist/`      |
| `npm run preview` | Serve the built bundle locally (http://localhost:4173)  |
| `npm run fetch` | Re-scrape PokéAPI and overwrite `pokemons.json`           |
| `npm run deploy` | Deploy `dist/` to Cloudflare Pages via Wrangler          |

## Deploying to Cloudflare Pages

```bash
npx wrangler login    # one-time, opens browser
npm run build
npm run deploy
```

On the first deploy Wrangler asks to create the project — say yes, and it returns a live URL like `https://pokemon-app.pages.dev`.

## Refreshing the data

```bash
npm run fetch
```

This re-fetches the first 151 Pokémon from [PokéAPI](https://pokeapi.co/) and writes them straight into `pokemon-api/public/pokemons.json`. Adjust the `LIMIT` constant in `pokemon-json/script.js` to fetch more.
