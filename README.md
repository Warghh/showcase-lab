# showcase-lab

A lab of self-contained **WebGL / react-three-fiber** scenes — *gold light in
velvet dark*. Each demo is a portable scene that can later be lifted into
warghh.com (same design language, same stack: React 19 + R3F + three.js).

The point: a gallery of genuinely impressive, validated front-end work — the
proof of what our coding + validation pipeline can produce.

## Stack

Vite + React + TypeScript + `@react-three/fiber` + `@react-three/drei` +
`three` + `gsap`. Playwright for end-to-end validation.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build (must pass)
npm run test:e2e   # Playwright — must pass
```

## The design language (non-negotiable)

Mirrors warghh.com. Full reference: `warghh-app/DESIGN.md`. The essentials:

- **Gold light in velvet dark.** Background velvet-black `#040404`. Gold
  `#e7c667` used as *light* (glow, edges, rim, key text) — never as big fills.
- **Maritime / ship / deep-water atmosphere.** Moonlit sea you dive beneath.
  Pirate-ship, underwater descent, god-rays, caustics, particles.
- **Motion:** ease-out only, house curve `cubic-bezier(0.22, 1, 0.36, 1)`. No
  bounce, no spring on layout. Everything honours `prefers-reduced-motion`.
- **Typography:** Cinzel for display (`.display`), Inter for body. Tokens live
  in `src/index.css` — use the CSS vars, never raw hex.

## How to add a scene (the pattern)

1. Create `src/scenes/<Name>.tsx`. Export a component that renders inside
   `<SceneFrame>` (shared canvas: velvet clear colour, camera, fog). See
   `src/scenes/MoonlitSea.tsx` as the reference.
2. Register it in `src/scenes/registry.ts` — add a `SceneMeta` with `slug`,
   `title`, `blurb`, `component`, and `ready: true` once it passes validation.
3. Add a Playwright test in `e2e/<slug>.spec.ts` following `e2e/smoke.spec.ts`.

Scenes are **pure components** — no global state, no network. Keep them
portable so they drop straight into a Next.js page later.

## The validation bar (every scene must clear it)

A scene is only `ready: true` when its Playwright test proves:

1. Route `#/<slug>` loads, the `<canvas>` is visible with non-zero dimensions.
2. A real WebGL context exists (`getContext('webgl2'|'webgl')` is non-null).
3. **Zero** console errors / page errors.
4. A screenshot is captured to `e2e/__screenshots__/<slug>.png` as evidence
   (and is not a black void).
5. `npm run build` passes (TypeScript clean).

### Headless WebGL — required launch flags

Headless Chromium has no GPU; three.js needs software GL or the context is
null (`Cannot read properties of null (reading 'precision')`). `playwright.config.ts`
launches Chromium with `--enable-unsafe-swiftshader --use-gl=angle
--use-angle=swiftshader --ignore-gpu-blocklist`. Keep these. The droplet
validator uses the same flags.

## Commit discipline

Conventional commits, one scene per commit where possible. **Always commit AND
push** your scene file(s) + registry change + test — output that isn't pushed
doesn't count.
