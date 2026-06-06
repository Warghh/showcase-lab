import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { SceneFrame } from "../components/SceneFrame";

const GOLD = "#e7c667";
const DARK_BLUE = "#0a1f2a";

/** Generate random celestial coordinates for stars on a unit sphere. */
function generateStars(count: number): THREE.Vector3[] {
  const stars: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const phi = Math.random() * Math.PI * 2;
    const theta = Math.acos(Math.random() * 2 - 1);
    const x = Math.sin(theta) * Math.cos(phi);
    const y = Math.sin(theta) * Math.sin(phi);
    const z = Math.cos(theta);
    stars.push(new THREE.Vector3(x, y, z).multiplyScalar(30));
  }
  return stars;
}

/** Instanced gold stars rendered as a sphere of light. */
function CelestialSphere({ count = 800 }: { count?: number }) {
  const stars = useMemo(() => generateStars(count), [count]);

  return (
    <>
      {/* Background: thousands of tiny stars far away */}
      <Stars radius={100} depth={60} count={3000} factor={3} saturation={0} fade speed={0.3} />

      {/* Closer star field */}
      {stars.map((pos, i) => (
        <mesh key={i} position={[pos.x, pos.y, pos.z]}>
          <sphereGeometry args={[0.12, 4, 4]} />
          <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.8} />
        </mesh>
      ))}
    </>
  );
}

/** A few constellation connecting lines. */
function ConstellationLines() {
  const group = useRef<THREE.Group>(null);

  useMemo(() => {
    if (!group.current) return;
    
    // Create constellation lines using LineSegments
    const orionPositions = [
      [10, 8, -5], [12, 6, -4], [10, 4, -3], [8, 5, -4], [9, 7, -5]
    ];
    
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array([
      orionPositions[0][0], orionPositions[0][1], orionPositions[0][2],
      orionPositions[1][0], orionPositions[1][1], orionPositions[1][2],
      orionPositions[1][0], orionPositions[1][1], orionPositions[1][2],
      orionPositions[2][0], orionPositions[2][1], orionPositions[2][2],
      orionPositions[2][0], orionPositions[2][1], orionPositions[2][2],
      orionPositions[3][0], orionPositions[3][1], orionPositions[3][2],
      orionPositions[3][0], orionPositions[3][1], orionPositions[3][2],
      orionPositions[4][0], orionPositions[4][1], orionPositions[4][2],
      orionPositions[4][0], orionPositions[4][1], orionPositions[4][2],
      orionPositions[0][0], orionPositions[0][1], orionPositions[0][2],
    ]);
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const line = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: GOLD, opacity: 0.6, transparent: true }));
    group.current.add(line);
  }, []);

  return <group ref={group} />;
}

/** A slowly rotating astrolabe/compass ring in the foreground. Maritime feel. */
function Astrolabe() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.z = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={group} position={[0, 0, 0]}>
      {/* Outer ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.2, 0.08, 16, 100]} />
        <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.9} />
      </mesh>

      {/* Inner ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.8, 0.05, 16, 80]} />
        <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.7} />
      </mesh>

      {/* Cardinal direction markers */}
      {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((angle, i) => {
        const x = Math.cos(angle) * 3.6;
        const y = Math.sin(angle) * 3.6;
        return (
          <mesh key={`marker-${i}`} position={[x, 0, y]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={1} />
          </mesh>
        );
      })}
    </group>
  );
}

export function ConstellationNavigator() {
  return (
    <SceneFrame cameraPosition={[0, 3, 12]}>
      {/* Key light: warm directional from above-left */}
      <directionalLight position={[-8, 6, 4]} intensity={1} color={GOLD} />
      <ambientLight intensity={0.15} color={DARK_BLUE} />

      {/* Subtle point light for depth */}
      <pointLight position={[3, 4, -5]} intensity={1.2} color={GOLD} distance={20} />

      {/* Orbit controls for user interaction */}
      <OrbitControls enablePan={true} enableZoom={true} autoRotate={false} />

      {/* The scene content */}
      <CelestialSphere count={600} />
      <ConstellationLines />
      <Astrolabe />
    </SceneFrame>
  );
}
