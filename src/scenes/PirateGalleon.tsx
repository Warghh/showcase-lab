import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import { SceneFrame } from "../components/SceneFrame";

/** A curved sail (half-cylinder shell) that bellies in the wind. */
function Sail({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!mesh.current) return;
    // belly the sail with a gentle wind pulse
    const w = 0.9 + Math.sin(s.clock.elapsedTime * 1.1 + position[1]) * 0.12;
    mesh.current.scale.z = w * scale;
  });
  return (
    <mesh ref={mesh} position={position} rotation={[0, 0, 0]}>
      <cylinderGeometry args={[0.7 * scale, 0.7 * scale, 1.3 * scale, 16, 1, true, Math.PI * 0.25, Math.PI * 0.5]} />
      <meshStandardMaterial
        color="#d8c79a"
        emissive="#e7c667"
        emissiveIntensity={0.1}
        roughness={1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function Galleon() {
  const group = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!group.current) return;
    const t = s.clock.elapsedTime;
    group.current.position.y = Math.sin(t * 0.5) * 0.12 - 0.2;
    group.current.rotation.z = Math.sin(t * 0.4) * 0.04;
    group.current.rotation.x = Math.sin(t * 0.3) * 0.02;
  });
  return (
    <group ref={group} position={[0, 0, 0]}>
      {/* hull */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3, 0.6, 1]} />
        <meshStandardMaterial color="#0c0a06" roughness={0.85} />
      </mesh>
      {/* prow + stern wedges */}
      <mesh position={[1.7, 0.1, 0]} rotation={[0, 0, -0.35]}>
        <coneGeometry args={[0.4, 1, 4]} />
        <meshStandardMaterial color="#0c0a06" roughness={0.85} />
      </mesh>
      <mesh position={[-1.6, 0.25, 0]}>
        <boxGeometry args={[0.5, 1, 1]} />
        <meshStandardMaterial color="#0c0a06" roughness={0.85} />
      </mesh>
      {/* three masts with sails */}
      {[-0.9, 0.1, 1.1].map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          <mesh position={[0, 1.3, 0]}>
            <cylinderGeometry args={[0.05, 0.06, 2.6, 8]} />
            <meshStandardMaterial color="#1a1304" roughness={0.8} />
          </mesh>
          <Sail position={[x === 0.1 ? 0 : 0, 1.5, 0]} scale={1.15 - i * 0.08} />
          <Sail position={[0, 0.7, 0]} scale={0.95 - i * 0.06} />
        </group>
      ))}
    </group>
  );
}

/** Reflective sea + the moon's gold path streaking toward the viewer. */
function Sea() {
  const path = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!path.current) return;
    const m = path.current.material as THREE.MeshBasicMaterial;
    m.opacity = 0.28 + Math.sin(s.clock.elapsedTime * 0.8) * 0.06;
  });
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.55, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#050f16" emissive="#08202c" emissiveIntensity={0.5} roughness={0.25} metalness={0.7} />
      </mesh>
      {/* gold moon path */}
      <mesh ref={path} rotation={[-Math.PI / 2, 0, 0]} position={[-3, -0.54, 4]}>
        <planeGeometry args={[1.6, 18]} />
        <meshBasicMaterial color="#e7c667" transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

export function PirateGalleon() {
  return (
    <SceneFrame cameraPosition={[0, 1.2, 7.5]} fog={false}>
      <fogExp2 attach="fog" args={["#040810", 0.03]} />
      {/* the moon — key light off to the left */}
      <directionalLight position={[-8, 6, 3]} intensity={1.2} color="#f3ead0" />
      <ambientLight intensity={0.1} color="#10202c" />
      <pointLight position={[3, 2, -2]} intensity={1.4} color="#e7c667" distance={14} />
      {/* moon disc */}
      <mesh position={[-7, 5, -12]}>
        <circleGeometry args={[2.2, 48]} />
        <meshBasicMaterial color="#f5edcf" />
      </mesh>
      <Stars radius={60} depth={40} count={2200} factor={3.5} fade speed={0.4} />
      <Galleon />
      <Sea />
    </SceneFrame>
  );
}
