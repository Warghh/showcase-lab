import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { SceneFrame } from "../components/SceneFrame";

const BIOLUM = "#5fe0d0";
const SUCKER_GLOW = "#00ffaa";
const SHIP_GOLD = "#e7c667";

/** A single segmented tentacle with bioluminescent suckers, rising and curling. */
function Tentacle({
  angle,
  radius,
  length,
  index,
}: {
  angle: number;
  radius: number;
  length: number;
  index: number;
}) {
  const group = useRef<THREE.Group>(null);
  
  // Generate segments for the tentacle
  const segments = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      length: length / 12,
      segmentIndex: i,
    }));
  }, [length]);

  // Generate suckers along the tentacle
  const suckers = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      position: (i + 1) / 9, // distribute along tentacle
    }));
  }, []);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    const basePhase = index * 0.8;
    
    // Smooth rise from below, cubic-ease-out feel
    const yPos = Math.sin(t * 0.3 + basePhase) * 0.5 + 1.2;
    
    // Curling motion
    group.current.rotation.x = Math.sin(t * 0.4 + basePhase) * 0.3;
    group.current.rotation.z = Math.cos(t * 0.35 + basePhase) * 0.25;
    
    // Slight sway
    group.current.position.y = yPos;
  });

  return (
    <group
      ref={group}
      position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
    >
      {/* Tentacle body — segmented with tapering */}
      {segments.map((seg) => {
        const taper = 1 - seg.segmentIndex / segments.length;
        const baseDia = 0.12 * taper;
        return (
          <mesh
            key={seg.id}
            position={[0, (seg.segmentIndex + 0.5) * seg.length, 0]}
          >
            <cylinderGeometry
              args={[baseDia * 0.9, baseDia * 0.7, seg.length, 8]}
            />
            <meshStandardMaterial
              color={BIOLUM}
              emissive={BIOLUM}
              emissiveIntensity={0.6}
              roughness={0.3}
              metalness={0.2}
            />
          </mesh>
        );
      })}

      {/* Bioluminescent suckers */}
      {suckers.map((sucker) => {
        const yPos = length * sucker.position;
        const suckerId = `sucker-${index}-${sucker.id}`;
        return (
          <group key={suckerId} position={[0, yPos, 0]}>
            {/* Sucker disc */}
            <mesh position={[0, 0, 0.06]}>
              <cylinderGeometry args={[0.08, 0.08, 0.04, 16]} />
              <meshStandardMaterial
                color={SUCKER_GLOW}
                emissive={SUCKER_GLOW}
                emissiveIntensity={1.2}
                roughness={0.2}
              />
            </mesh>
            {/* Glow aura (small sphere) */}
            <mesh position={[0, 0, 0.08]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshStandardMaterial
                color={SUCKER_GLOW}
                emissive={SUCKER_GLOW}
                emissiveIntensity={0.9}
                transparent
                opacity={0.6}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/** The kraken itself — multiple tentacles rising from below. */
function Kraken() {
  const group = useRef<THREE.Group>(null);
  
  // Create 6 tentacles arranged in a circle
  const tentacles = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      angle: (i / 6) * Math.PI * 2,
      radius: 0.5,
      length: 2.2 + (i % 3) * 0.3,
    }));
  }, []);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    // Slow body rotation
    group.current.rotation.y = t * 0.08;
  });

  return (
    <group ref={group} position={[0, 0, 0]}>
      {/* Central glowing orb (kraken's core/eye area) */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial
          color={BIOLUM}
          emissive={BIOLUM}
          emissiveIntensity={1.1}
          roughness={0.5}
        />
      </mesh>
      
      {/* Glow light around the core */}
      <pointLight
        position={[0, 1.5, 0]}
        color={BIOLUM}
        intensity={4}
        distance={8}
      />

      {/* Tentacles */}
      {tentacles.map((tent) => (
        <Tentacle
          key={tent.id}
          angle={tent.angle}
          radius={tent.radius}
          length={tent.length}
          index={tent.id}
        />
      ))}
    </group>
  );
}

export function KrakenRises() {
  return (
    <SceneFrame cameraPosition={[0, 1.8, 5]} fog={false}>
      <fogExp2 attach="fog" args={["#0a0a0f", 0.18]} />

      {/* Ship's gold light catching from above-right — the warm key light */}
      <directionalLight
        position={[4, 3, 2]}
        intensity={1.3}
        color={SHIP_GOLD}
      />

      {/* Deep ambient fill — cool blues */}
      <ambientLight intensity={0.08} color="#0a1620" />

      {/* Faint caustic-ish light from above — cool, distant */}
      <pointLight position={[0, 6, 0]} intensity={0.5} color="#1a2e3a" distance={20} />

      {/* The rising kraken */}
      <Kraken />

      {/* Drifting bioluminescent particles — atmosphere */}
      <Sparkles
        count={100}
        scale={[6, 8, 6]}
        size={2.5}
        speed={0.15}
        color={BIOLUM}
        opacity={0.4}
      />
      <Sparkles
        count={40}
        scale={[5, 7, 5]}
        size={4}
        speed={0.08}
        color={SUCKER_GLOW}
        opacity={0.3}
      />
    </SceneFrame>
  );
}
