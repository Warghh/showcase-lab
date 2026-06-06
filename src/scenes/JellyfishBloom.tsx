import { useMemo, useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { SceneFrame } from "../components/SceneFrame";

const GLOW = "#5fe0d0";
const GLOW_WARM = "#e7c667";

/** A bioluminescent jellyfish — pulsing bell, glowing tendrils, lit by itself. */
function Jellyfish({
  position,
  scale = 1,
  phaseOffset = 0,
  id = 0,
}: {
  position: [number, number, number];
  scale?: number;
  phaseOffset?: number;
  id?: number;
}) {
  const bell = useRef<THREE.Mesh>(null);
  const group = useRef<THREE.Group>(null);
  const glow = useRef<THREE.PointLight>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setPrefersReducedMotion(prefersReduced);
  }, []);

  const tendrils = useMemo(
    () => Array.from({ length: 14 }, (_, i) => ({ a: (i / 14) * Math.PI * 2, r: 0.18 + (i % 3) * 0.06, len: 1.4 + (i % 4) * 0.25 })),
    []
  );

  useFrame((s) => {
    if (prefersReducedMotion) return;
    
    const t = s.clock.elapsedTime + phaseOffset;
    const pulse = 1 + Math.sin(t * 1.6) * 0.12;
    if (bell.current) {
      bell.current.scale.set(pulse, 1 / pulse, pulse);
    }
    if (group.current) {
      group.current.position.y = position[1] + Math.sin(t * 0.5) * 0.25;
      group.current.rotation.y = t * 0.12;
    }
    if (glow.current) glow.current.intensity = 5 + Math.sin(t * 1.6) * 2.5;
  });

  return (
    <group ref={group} position={position}>
      <pointLight ref={glow} position={[0, 0.2, 0]} color={GLOW} distance={9} intensity={6} />
      {/* bell — translucent dome */}
      <mesh ref={bell} position={[0, 0.3, 0]} scale={scale}>
        <sphereGeometry args={[0.9, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial
          color={GLOW}
          emissive={GLOW}
          emissiveIntensity={1.1}
          transparent
          opacity={0.55}
          roughness={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* glowing rim */}
      <mesh position={[0, 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={scale}>
        <torusGeometry args={[0.88, 0.04, 8, 48]} />
        <meshStandardMaterial color={GLOW_WARM} emissive={GLOW_WARM} emissiveIntensity={1.6} />
      </mesh>
      {/* tendrils */}
      {tendrils.map((td, i) => (
        <Tendril key={i} angle={td.a} radius={td.r} length={td.len} index={i} scale={scale} phaseOffset={phaseOffset} />
      ))}
    </group>
  );
}

function Tendril({
  angle,
  radius,
  length,
  index,
  scale = 1,
  phaseOffset = 0,
}: {
  angle: number;
  radius: number;
  length: number;
  index: number;
  scale?: number;
  phaseOffset?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setPrefersReducedMotion(prefersReduced);
  }, []);

  useFrame((s) => {
    if (!ref.current || prefersReducedMotion) return;
    const t = s.clock.elapsedTime + phaseOffset;
    ref.current.rotation.x = Math.sin(t * 1.2 + index) * 0.25;
    ref.current.rotation.z = Math.cos(t * 0.9 + index) * 0.18;
  });

  return (
    <mesh ref={ref} position={[Math.cos(angle) * radius, 0.2, Math.sin(angle) * radius]} scale={scale}>
      <cylinderGeometry args={[0.015, 0.004, length, 6]} />
      <meshStandardMaterial color={GLOW} emissive={GLOW} emissiveIntensity={1.3} transparent opacity={0.8} />
    </mesh>
  );
}

export function JellyfishBloom() {
  // Generate a swarm of jellyfish at varied depths and scales
  // Use a seeded pattern for consistent positioning but varied appearance
  const jellyfishSwarm = useMemo(() => {
    const swarm = [];
    const count = 16; // A dozen+ creatures
    const spreadXZ = 8;
    const depthMin = -3;
    const depthMax = 3;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const distance = 2 + (i % 3) * 1.5;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance + depthMin + (Math.random() * (depthMax - depthMin));
      const y = -1 + Math.random() * 2;
      const scale = 0.6 + Math.random() * 0.7; // varied scales
      const phaseOffset = (i / count) * Math.PI * 2; // out-of-phase pulsing

      swarm.push({
        id: i,
        position: [x, y, z] as [number, number, number],
        scale,
        phaseOffset,
      });
    }
    return swarm;
  }, []);

  return (
    <SceneFrame cameraPosition={[0, 1.2, 7]} fog={false}>
      <fogExp2 attach="fog" args={["#01060a", 0.08]} />
      {/* Minimal ambient light — let the jellyfish light themselves */}
      <ambientLight intensity={0.02} color="#06121a" />
      {/* Faint caustic-ish fill from above */}
      <pointLight position={[0, 6, 1]} intensity={0.4} color="#16384a" distance={20} />
      {/* Small moonish light source for rim lighting */}
      <pointLight position={[-8, 5, -5]} intensity={0.3} color="#e7c667" distance={25} />

      {/* Render the swarm of jellyfish */}
      {jellyfishSwarm.map((jf) => (
        <Jellyfish key={jf.id} {...jf} />
      ))}

      {/* Drifting bioluminescent motes — subtle, doesn't overpower the jellyfish */}
      <Sparkles
        count={40}
        scale={[10, 8, 8]}
        size={2}
        speed={0.12}
        color={GLOW}
        opacity={0.3}
      />
      <Sparkles
        count={20}
        scale={[8, 6, 6]}
        size={4}
        speed={0.08}
        color={GLOW_WARM}
        opacity={0.2}
      />
    </SceneFrame>
  );
}
