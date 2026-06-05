import type { ComponentType } from "react";
import { MoonlitSea } from "./MoonlitSea";

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
];

export function getScene(slug: string): SceneMeta | undefined {
  return SCENES.find((s) => s.slug === slug);
}
