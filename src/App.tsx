import { useEffect, useState } from "react";
import { SCENES, getScene } from "./scenes/registry";

/** Tiny hash router — no dependency. #/ = gallery, #/<slug> = scene. */
function useHashRoute(): string {
  const [hash, setHash] = useState(() => window.location.hash.slice(2));
  useEffect(() => {
    const on = () => setHash(window.location.hash.slice(2));
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return hash;
}

function Gallery() {
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "8vh 6vw" }}>
      <p
        style={{
          textTransform: "uppercase",
          letterSpacing: "0.3em",
          fontSize: 12,
          color: "var(--accent)",
          opacity: 0.8,
        }}
      >
        showcase-lab
      </p>
      <h1 className="display" style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)", margin: "0.2em 0 0.1em" }}>
        WebGL Demos
      </h1>
      <p style={{ maxWidth: "60ch", color: "var(--fg)", opacity: 0.7, lineHeight: 1.6 }}>
        A lab of self-contained scenes — gold light in velvet dark. Each one is a
        portable react-three-fiber component, built and validated end to end.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "1.4rem",
          marginTop: "3rem",
        }}
      >
        {SCENES.map((s) => {
          const card = (
            <div
              style={{
                border: "1px solid var(--line)",
                borderRadius: 10,
                padding: "1.4rem",
                background: "rgba(27,27,28,0.3)",
                opacity: s.ready ? 1 : 0.45,
                transition: "transform 0.4s var(--ease), box-shadow 0.4s var(--ease)",
                height: "100%",
              }}
            >
              <h2 className="display" style={{ fontSize: "1.3rem", margin: 0 }}>
                {s.title}
              </h2>
              <p style={{ color: "var(--fg)", opacity: 0.65, fontSize: 14, lineHeight: 1.5 }}>
                {s.blurb}
              </p>
              <span style={{ fontSize: 12, color: s.ready ? "var(--accent)" : "var(--fg)", opacity: 0.7 }}>
                {s.ready ? "Enter →" : "Building…"}
              </span>
            </div>
          );
          return s.ready ? (
            <a key={s.slug} href={`#/${s.slug}`}>
              {card}
            </a>
          ) : (
            <div key={s.slug}>{card}</div>
          );
        })}
      </div>
    </main>
  );
}

function SceneView({ slug }: { slug: string }) {
  const scene = getScene(slug);
  if (!scene || !scene.component) {
    window.location.hash = "#/";
    return null;
  }
  const Body = scene.component;
  return (
    <>
      <Body />
      <a
        href="#/"
        style={{
          position: "fixed",
          top: 24,
          left: 24,
          zIndex: 10,
          fontSize: 13,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "var(--accent)",
        }}
      >
        ← Lab
      </a>
      <div style={{ position: "fixed", bottom: 24, left: 24, zIndex: 10, pointerEvents: "none" }}>
        <h1 className="display" style={{ fontSize: "1.6rem", margin: 0 }}>
          {scene.title}
        </h1>
      </div>
    </>
  );
}

export default function App() {
  const route = useHashRoute();
  return route ? <SceneView slug={route} /> : <Gallery />;
}
