import type { ComponentType } from "react";
import { MoonlitSea } from "./MoonlitSea";
import { DeepDescent } from "./DeepDescent";
import { PirateGalleon } from "./PirateGalleon";
import { ParallaxVoyage } from "./ParallaxVoyage";
import { TreasureHoard } from "./TreasureHoard";
import { DeepCreature } from "./DeepCreature";
import { ShaderOcean } from "./ShaderOcean";
import { ParticleFlow } from "./ParticleFlow";
// import { StormSea } from "./StormSea";

export type SceneMeta = {
  /** url slug, kebab-case */
  slug: string;
  /** display title (Cinzel) */
  title: string;
  /** one-line description for the gallery */
  blurb: string;
  /** the R3F/canvas component, or null while a scene is still being built */
  component: ComponentType | null;
  /** true once a scene is finished and passes its Playwright check */
  ready: boolean;
};

/**
 * The lab's scene list. Each demo is one entry.
 * A coder adds a scene by: creating src/scenes/<Name>.tsx that default-or-named
 * exports a component rendering inside <SceneFrame>, then registering it here
 * with ready:true. The gallery and router pick it up automatically.
 */
export const SCENES: SceneMeta[] = [
  {
    slug: "moonlit-sea",
    title: "Moonlit Sea",
    blurb: "A ship adrift on a shimmering night sea. The reference scene.",
    component: MoonlitSea,
    ready: true,
  },
  {
    slug: "deep-descent",
    title: "Deep Descent",
    blurb: "The dive beneath — god-rays, marine snow, the light dying into the deep.",
    component: DeepDescent,
    ready: true,
  },
  {
    slug: "pirate-galleon",
    title: "Pirate Galleon",
    blurb: "A tall ship under sail on a moonlit sea, sails bellied to the wind.",
    component: PirateGalleon,
    ready: true,
  },
  {
    slug: "parallax-voyage",
    title: "Parallax Voyage",
    blurb: "Scroll from the moonlit surface down into the deep — layered parallax.",
    component: ParallaxVoyage,
    ready: true,
  },
  {
    slug: "treasure-hoard",
    title: "Treasure Hoard",
    blurb: "A mound of gold in the dark, a single warm light raking the glints.",
    component: TreasureHoard,
    ready: true,
  },
  {
    slug: "deep-creature",
    title: "The Deep Creature",
    blurb: "A bioluminescent jellyfish pulsing in the black, lit by its own glow.",
    component: DeepCreature,
    ready: true,
  },
  {
    slug: "shader-ocean",
    title: "Shader Ocean",
    blurb: "Gerstner waves rolling in velvet dark, gilded with a warm maritime sheen.",
    component: ShaderOcean,
    ready: true,
  },
  {
    slug: "particle-flow",
    title: "Particle Flow Field",
    blurb: "5000+ points drifting through a curl-noise vector field — gold and pale-blue motes streaming.",
    component: ParticleFlow,
    ready: true,
  },
  // {
  //   slug: "storm-sea",
  //   title: "Storm at Sea",
  //   blurb: "A galleon battered by tempest: lightning-split skies, driving rain, gold lantern light against the gloom.",
  //   component: StormSea,
  //   ready: true,
  // },
];

export function getScene(slug: string): SceneMeta | undefined {
  return SCENES.find((s) => s.slug === slug);
}
