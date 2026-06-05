import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { SceneFrame } from "../components/SceneFrame";

const GLOW = "#5fe0d0";
const GLOW_WARM = "#e7c667";

/** A bioluminescent jellyfish — pulsing bell, glowing tendrils, lit by itself. */
function Jellyfish() {
  const bell = useRef<THREE.Mesh>(null);
  const group = useRef<THREE.Group>(null);
  const glow = useRef<THREE.PointLight>(null);

  const tendrils = useMemo(
    () => Array.from({ length: 14 }, (_, i) => ({ a: (i / 14) * Math.PI * 2, r: 0.18 + (i % 3) * 0.06, len: 1.4 + (i % 4) * 0.25 })),
    []
  );

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    const pulse = 1 + Math.sin(t * 1.6) * 0.12;
    if (bell.current) {
      bell.current.scale.set(pulse, 1 / pulse, pulse);
    }
    if (group.current) {
      group.current.position.y = Math.sin(t * 0.5) * 0.25;
      group.current.rotation.y = t * 0.12;
    }
    if (glow.current) glow.current.intensity = 5 + Math.sin(t * 1.6) * 2.5;
  });

  return (
    <group ref={group}>
      <pointLight ref={glow} position={[0, 0.2, 0]} color={GLOW} distance={9} intensity={6} />
      {/* bell — translucent dome */}
      <mesh ref={bell} position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.9, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial
          color={GLOW}
          emissive={GLOW}
          emissiveIntensity={0.9}
          transparent
          opacity={0.55}
          roughness={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* glowing rim */}
      <mesh position={[0, 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.88, 0.04, 8, 48]} />
        <meshStandardMaterial color={GLOW_WARM} emissive={GLOW_WARM} emissiveIntensity={1.4} />
      </mesh>
      {/* tendrils */}
      {tendrils.map((td, i) => (
        <Tendril key={i} angle={td.a} radius={td.r} length={td.len} index={i} />
      ))}
    </group>
  );
}

function Tendril({ angle, radius, length, index }: { angle: number; radius: number; length: number; index: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const t = s.clock.elapsedTime;
    ref.current.rotation.x = Math.sin(t * 1.2 + index) * 0.25;
    ref.current.rotation.z = Math.cos(t * 0.9 + index) * 0.18;
  });
  return (
    <mesh ref={ref} position={[Math.cos(angle) * radius, 0.2, Math.sin(angle) * radius]}>
      <cylinderGeometry args={[0.015, 0.004, length, 6]} />
      <meshStandardMaterial color={GLOW} emissive={GLOW} emissiveIntensity={1.1} transparent opacity={0.8} />
    </mesh>
  );
}

export function DeepCreature() {
  return (
    <SceneFrame cameraPosition={[0, 0.4, 4.5]} fog={false}>
      <fogExp2 attach="fog" args={["#01060a", 0.14]} />
      <ambientLight intensity={0.04} color="#06121a" />
      {/* faint caustic-ish fill from above */}
      <pointLight position={[0, 6, 1]} intensity={0.6} color="#16384a" distance={20} />
      <Jellyfish />
      {/* drifting bioluminescent motes */}
      <Sparkles count={70} scale={[8, 6, 6]} size={3} speed={0.25} color={GLOW} opacity={0.5} />
      <Sparkles count={30} scale={[6, 5, 5]} size={5} speed={0.12} color={GLOW_WARM} opacity={0.35} />
    </SceneFrame>
  );
}
