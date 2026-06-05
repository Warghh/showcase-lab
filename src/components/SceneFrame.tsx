import { Canvas } from "@react-three/fiber";
import { Suspense, type ReactNode } from "react";

/**
 * Shared canvas wrapper: full-viewport, velvet-dark clear colour, sensible
 * camera + fog, reduced-motion aware via the global CSS. Scenes render their
 * meshes/lights as children. Keeps every demo visually consistent.
 */
export function SceneFrame({
  children,
  cameraPosition = [0, 1.2, 6],
  fog = true,
}: {
  children: ReactNode;
  cameraPosition?: [number, number, number];
  fog?: boolean;
}) {
  return (
    <Canvas
      style={{ position: "fixed", inset: 0 }}
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: cameraPosition, fov: 50, near: 0.1, far: 100 }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor("#040404", 1);
        if (fog) {
          scene.fog = (scene.fog ?? null) as never;
        }
      }}
    >
      <Suspense fallback={null}>{children}</Suspense>
    </Canvas>
  );
}
