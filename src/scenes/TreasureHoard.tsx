import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { SceneFrame } from "../components/SceneFrame";

type Piece = {
  pos: [number, number, number];
  rot: [number, number, number];
  scale: number;
  kind: "coin" | "gem" | "bar";
};

/** A mound of gold pieces — coins, gems, bars — settled in the dark. */
function Hoard() {
  const pieces = useMemo<Piece[]>(() => {
    const out: Piece[] = [];
    const n = 220;
    for (let i = 0; i < n; i++) {
      // pile into a rough mound: radius falls off with height
      const a = Math.random() * Math.PI * 2;
      const r = Math.pow(Math.random(), 0.6) * 2.6;
      const h = Math.max(0, (1 - r / 2.8)) * 1.3 * Math.random();
      const kindRoll = Math.random();
      out.push({
        pos: [Math.cos(a) * r, h - 0.6, Math.sin(a) * r],
        rot: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
        scale: 0.12 + Math.random() * 0.12,
        kind: kindRoll > 0.86 ? "gem" : kindRoll > 0.72 ? "bar" : "coin",
      });
    }
    return out;
  }, []);

  const gold = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#caa436", metalness: 0.95, roughness: 0.22, emissive: "#3a2c08", emissiveIntensity: 0.4 }),
    []
  );
  const gem = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#8a1f2b", metalness: 0.3, roughness: 0.1, emissive: "#2a0a10", emissiveIntensity: 0.6 }),
    []
  );

  return (
    <group>
      {pieces.map((p, i) =>
        p.kind === "gem" ? (
          <mesh key={i} position={p.pos} rotation={p.rot} scale={p.scale} material={gem}>
            <octahedronGeometry args={[1, 0]} />
          </mesh>
        ) : p.kind === "bar" ? (
          <mesh key={i} position={p.pos} rotation={p.rot} scale={[p.scale * 2, p.scale, p.scale * 1.2]} material={gold}>
            <boxGeometry args={[1, 0.6, 0.5]} />
          </mesh>
        ) : (
          <mesh key={i} position={p.pos} rotation={[Math.PI / 2 + p.rot[0] * 0.1, 0, 0]} scale={p.scale} material={gold}>
            <cylinderGeometry args={[1, 1, 0.18, 16]} />
          </mesh>
        )
      )}
    </group>
  );
}

/** A single warm key light that sweeps slightly, raking glints across the metal. */
function KeyLight() {
  const ref = useRef<THREE.PointLight>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const t = s.clock.elapsedTime;
    ref.current.position.set(Math.cos(t * 0.3) * 3, 3.2, Math.sin(t * 0.3) * 3);
  });
  return <pointLight ref={ref} intensity={26} color="#ffdca0" distance={16} decay={1.4} />;
}

export function TreasureHoard() {
  return (
    <SceneFrame cameraPosition={[0, 1.6, 5]} fog={false}>
      <fogExp2 attach="fog" args={["#040301", 0.12]} />
      <ambientLight intensity={0.06} color="#241a08" />
      <KeyLight />
      {/* faint cool fill so the shadow side isn't pure black */}
      <pointLight position={[-4, 1, -3]} intensity={2} color="#22304a" distance={12} />
      <Hoard />
      {/* the floor the hoard sits on */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.62, 0]}>
        <circleGeometry args={[6, 48]} />
        <meshStandardMaterial color="#0a0803" roughness={0.9} metalness={0.1} />
      </mesh>
      <OrbitControls autoRotate autoRotateSpeed={0.6} enablePan={false} enableZoom={false} target={[0, 0, 0]} />
    </SceneFrame>
  );
}
