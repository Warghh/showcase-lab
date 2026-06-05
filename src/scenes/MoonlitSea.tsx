import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import type { Group, Mesh } from "three";
import { SceneFrame } from "../components/SceneFrame";

/** A low-poly ship silhouette — hull, mast, sail. Gold-rimmed against the dark. */
function Ship() {
  const group = useRef<Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    // slow bob + roll on the swell
    group.current.position.y = Math.sin(t * 0.6) * 0.08;
    group.current.rotation.z = Math.sin(t * 0.45) * 0.03;
  });
  return (
    <group ref={group} position={[0, 0.1, 0]}>
      {/* hull */}
      <mesh rotation={[0, 0, 0]} position={[0, 0, 0]}>
        <boxGeometry args={[2.2, 0.4, 0.7]} />
        <meshStandardMaterial color="#0d0b06" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* prow */}
      <mesh position={[1.25, 0.05, 0]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[0.28, 0.7, 4]} />
        <meshStandardMaterial color="#0d0b06" roughness={0.9} />
      </mesh>
      {/* mast */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 1.6, 8]} />
        <meshStandardMaterial color="#1a1304" roughness={0.8} />
      </mesh>
      {/* sail — catches the moonlight */}
      <mesh position={[0.05, 0.95, 0]} rotation={[0, 0, 0.04]}>
        <planeGeometry args={[1.1, 1.2]} />
        <meshStandardMaterial
          color="#cdbb8e"
          emissive="#e7c667"
          emissiveIntensity={0.12}
          roughness={1}
          side={2}
        />
      </mesh>
    </group>
  );
}

/** Shimmering sea — a large plane with subtle vertex drift. */
function Sea() {
  const mesh = useRef<Mesh>(null);
  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.z = state.clock.elapsedTime * 0.02;
  });
  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[60, 60, 1, 1]} />
      <meshStandardMaterial
        color="#06121a"
        emissive="#0a2230"
        emissiveIntensity={0.4}
        roughness={0.3}
        metalness={0.6}
      />
    </mesh>
  );
}

export function MoonlitSea() {
  return (
    <SceneFrame cameraPosition={[0, 1.4, 7]}>
      {/* moon — the key light, off to one side */}
      <directionalLight position={[-6, 5, 2]} intensity={1.1} color="#f0e6c8" />
      <ambientLight intensity={0.12} color="#16202a" />
      {/* gold rim from behind the ship */}
      <pointLight position={[2, 1.5, -3]} intensity={2} color="#e7c667" distance={12} />

      <Stars radius={50} depth={30} count={1800} factor={3} saturation={0} fade speed={0.5} />
      <Ship />
      <Sea />
    </SceneFrame>
  );
}
