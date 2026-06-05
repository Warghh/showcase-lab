import { useEffect, useRef } from "react";

/**
 * Scroll-driven parallax voyage: setting sail → into the night → the dive →
 * the deep. Fixed background layers translate at different rates as you scroll;
 * captions scroll normally over them. DOM/CSS parallax (no WebGL needed here).
 * Reduced-motion: layers hold still, captions still readable.
 */
export function ParallaxVoyage() {
  const skyRef = useRef<HTMLDivElement>(null);
  const moonRef = useRef<HTMLDivElement>(null);
  const seaRef = useRef<HTMLDivElement>(null);
  const shipRef = useRef<HTMLDivElement>(null);
  const deepRef = useRef<HTMLDivElement>(null);
  const raysRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.body.scrollHeight - window.innerHeight;
        const p = max > 0 ? window.scrollY / max : 0; // 0..1
        if (skyRef.current) skyRef.current.style.transform = `translateY(${p * -40}px)`;
        if (moonRef.current) {
          moonRef.current.style.transform = `translateY(${p * 120}px) scale(${1 - p * 0.3})`;
          moonRef.current.style.opacity = `${Math.max(0, 1 - p * 1.6)}`;
        }
        if (seaRef.current) seaRef.current.style.transform = `translateY(${p * 220}px)`;
        if (shipRef.current) {
          shipRef.current.style.transform = `translateY(${p * 320}px) rotate(${p * 8}deg)`;
          shipRef.current.style.opacity = `${Math.max(0, 1 - p * 2)}`;
        }
        // the deep rises and takes over in the back half
        if (deepRef.current) deepRef.current.style.opacity = `${Math.min(1, Math.max(0, (p - 0.4) * 2.2))}`;
        if (raysRef.current) raysRef.current.style.opacity = `${Math.min(0.7, Math.max(0, (p - 0.5) * 1.8))}`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const layer: React.CSSProperties = { position: "fixed", inset: 0, pointerEvents: "none", willChange: "transform, opacity" };

  return (
    <div style={{ position: "relative" }}>
      {/* fixed parallax layers */}
      <div ref={skyRef} style={{ ...layer, background: "radial-gradient(120% 80% at 70% 0%, #0a1420 0%, #040404 60%)" }} />
      <div ref={raysRef} style={{ ...layer, opacity: 0, background: "linear-gradient(180deg, rgba(231,198,103,0.12) 0%, transparent 45%)" }} />
      <div
        ref={moonRef}
        style={{
          position: "fixed",
          pointerEvents: "none",
          willChange: "transform, opacity",
          top: "10%",
          right: "14%",
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: "radial-gradient(circle, #f5edcf 0%, #f5edcf 60%, rgba(245,237,207,0.15) 70%, transparent 75%)",
          boxShadow: "0 0 120px 40px rgba(231,198,103,0.25)",
        }}
      />
      {/* sea */}
      <div
        ref={seaRef}
        style={{
          ...layer,
          top: "62%",
          background: "linear-gradient(180deg, #06121c 0%, #04101a 30%, #020a12 100%)",
          boxShadow: "0 -20px 60px 0 rgba(8,32,44,0.6)",
        }}
      />
      {/* the deep takes over */}
      <div ref={deepRef} style={{ ...layer, opacity: 0, background: "radial-gradient(120% 100% at 50% 120%, #02151d 0%, #010509 70%)" }} />
      {/* ship silhouette */}
      <div ref={shipRef} style={{ ...layer, display: "grid", placeItems: "center", top: "44%" }}>
        <svg width="320" height="160" viewBox="0 0 320 160" aria-hidden="true">
          <g fill="#0a0803" stroke="#e7c667" strokeWidth="1" strokeOpacity="0.35">
            <path d="M60 110 L260 110 L235 140 L85 140 Z" />
            <rect x="150" y="40" width="5" height="72" />
            <path d="M152 48 C 120 56 118 96 120 104 L152 104 Z" fill="#cdbb8e" fillOpacity="0.85" />
            <path d="M155 48 C 188 56 190 96 188 104 L155 104 Z" fill="#cdbb8e" fillOpacity="0.85" />
          </g>
        </svg>
      </div>

      {/* scrolling caption sections */}
      <div style={{ position: "relative", zIndex: 5 }}>
        {[
          { kicker: "I", title: "Set Sail", body: "A ship on a moonlit sea. The night is calm, the gold path waits." },
          { kicker: "II", title: "Into the Night", body: "The moon climbs, the water darkens. The horizon gives way." },
          { kicker: "III", title: "The Dive", body: "Down past the surface light. The world tilts and goes quiet." },
          { kicker: "IV", title: "The Deep", body: "Only the dark, and a far-off glow. You have arrived somewhere old." },
        ].map((s, i) => (
          <section
            key={i}
            style={{
              minHeight: "100vh",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "0 8vw",
              maxWidth: 640,
            }}
          >
            <span style={{ textTransform: "uppercase", letterSpacing: "0.4em", fontSize: 12, color: "var(--accent)" }}>
              {s.kicker}
            </span>
            <h2 className="display" style={{ fontSize: "clamp(2rem, 6vw, 3.6rem)", margin: "0.2em 0" }}>
              {s.title}
            </h2>
            <p style={{ color: "var(--fg)", opacity: 0.75, lineHeight: 1.6, maxWidth: "42ch" }}>{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
