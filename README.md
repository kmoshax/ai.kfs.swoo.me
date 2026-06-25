# KFS AI — Results

Captcha-free grade and cumulative-GPA lookup for the **Faculty of Artificial
Intelligence, Kafr El-Sheikh University**. Students enter only their National
ID; the two upstream ASP.NET captchas are solved once and shared, so nobody has
to type one. Live at [ai.kfs.swoo.me](https://ai.kfs.swoo.me).

## How it works

The university exposes results across two ASP.NET WebForms pages, each guarded
by a per-session captcha. The captcha is fixed for the lifetime of an ASP.NET
session, so a single solved session can be replayed for every student. We solve
one captcha per page, store the `(cookies, viewstate, captcha)` tuple as a
shared **seed**, and reuse it. A keep-alive loop pings both seeds so their
sessions never time out; if a seed dies, a single one-time captcha revives it
for everyone.

Results are cached (MongoDB when `MONGODB_URI` is set, otherwise an on-disk JSON
file) because the university caps how many times each student may view a result.

## Project structure

```
src/
  app/         Next.js routes (thin: layout, pages, API handler)
  components/  UI primitives (components/ui)
  config/      Fonts and site metadata
  features/    Feature modules — UI + hooks + client (logic lives in hooks)
    lookup/
  lib/         Cross-cutting helpers (cn)
  server/      Server-only domain logic
    kfs/
      scraper/ ASP.NET session handling and HTML parsing
      cache/   MongoDB / disk caches and the shared seed pool
      gpa/     Credit-hour and grade-point GPA computation
      service/ Orchestration: lookup, re-seed, keep-alive
  styles/      Global stylesheet, split into design-system partials
  types/       Shared domain and API types
```

Conventions: no file exceeds 50 lines, every module re-exports through a barrel
`index.ts`, and React components hold no business logic — it lives in hooks.

## Getting started

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `bun dev` — start the dev server
- `bun build` — production build
- `bun lint` — Biome check
- `bun format` — Biome format

## License

Licensed under the **GNU Affero General Public License v3.0 or later**
([AGPL-3.0-or-later](./LICENSE)). You may use, study, and modify this code, but
any modified version you run — including over a network as a hosted service —
must make its complete source available under the same license. It cannot be
turned into a closed-source product.
