# Pokemon

Serverless Pokémon REST API + Vite frontend, all on Cloudflare Pages.

- **Frontend:** Vite static site, calls the REST API.
- **API:** Cloudflare Pages Functions (`functions/api/pokemons/*`).
- **Database:** MongoDB Atlas (free M0).
- **Deploy:** one command, single Cloudflare Pages project — frontend + API ship together.

## Architecture

```
Browser ──► /api/pokemons          ─► Pages Function ─► MongoDB Atlas
        ──► /api/pokemons/:name    ─► Pages Function ─► MongoDB Atlas
        ──► /api/pokemons/id/:id   ─► Pages Function ─► MongoDB Atlas
```

## Project Structure

```
.
├── package.json              # workspaces root
├── wrangler.toml             # CF Pages config (nodejs_compat)
├── .dev.vars.example         # local API env vars
├── functions/                # Cloudflare Pages Functions (REST API)
│   ├── _lib/mongo.js
│   └── api/pokemons/
│       ├── index.js          # GET /api/pokemons[?q=]
│       ├── [name].js         # GET /api/pokemons/:name
│       └── id/[pokeId].js    # GET /api/pokemons/id/:pokeId
├── pokemon-api/              # Vite frontend
├── pokemon-json/             # one-shot PokéAPI scraper (writes to file)
└── pokemon-mongo/            # local-Mongo → Atlas migration
    ├── .env.example
    └── migrate.js
```

## Setup

### 1. Install

```bash
npm install
```

### 2. Atlas

1. Create a free **M0** cluster at https://cloud.mongodb.com.
2. **Database Access** — add a user (save the password).
3. **Network Access** — add `0.0.0.0/0` (CF edge needs public reachability).
4. **Connect → Drivers** — copy the `mongodb+srv://...` string.

### 3. Migrate local data → Atlas

```bash
cp pokemon-mongo/.env.example pokemon-mongo/.env
# edit pokemon-mongo/.env: paste DB_CONNECTION_STRING from Atlas
npm run migrate
```

This reads `chaudhar007DB.pokemons` from the local `172.20.10.7:21317` Mongo and copies every document into Atlas, then creates unique indexes on `name` and `pokeId`.

### 4. Configure local API

```bash
cp .dev.vars.example .dev.vars
# edit .dev.vars: paste the same DB_CONNECTION_STRING
```

`.dev.vars` is what wrangler reads during `pages dev` (analogous to `.env`).

## Running

| Command           | What it does                                                 |
| ----------------- | ------------------------------------------------------------ |
| `npm run dev`     | Vite + Pages Functions on http://localhost:8788              |
| `npm run build`   | Build the frontend bundle                                    |
| `npm run migrate` | Local Mongo → Atlas                                          |
| `npm run fetch`   | Re-scrape PokéAPI into `pokemon-api/public/pokemons.json`    |
| `npm run deploy`  | Build + deploy to Cloudflare Pages                           |

## Deploy

One-time wrangler login + secret:

```bash
npx wrangler login
npx wrangler pages secret put DB_CONNECTION_STRING --project-name=pokemon-app
npx wrangler pages secret put DB_NAME  --project-name=pokemon-app
```

Then:

```bash
npm run deploy
```

## API

| Method | Path                          | Returns                              |
| ------ | ----------------------------- | ------------------------------------ |
| GET    | `/api/pokemons`               | All Pokémon, sorted by `pokeId`      |
| GET    | `/api/pokemons?q=pika`        | Name-substring search                |
| GET    | `/api/pokemons/:name`         | Single Pokémon by name (404 if none) |
| GET    | `/api/pokemons/id/:pokeId`    | Single Pokémon by Pokédex number     |
