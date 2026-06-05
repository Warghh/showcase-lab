import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { SceneFrame } from "../components/SceneFrame";

/** Volumetric god-rays — slim translucent cones falling from the surface. */
function GodRays() {
  const group = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!group.current) return;
    group.current.children.forEach((c, i) => {
      const m = (c as THREE.Mesh).material as THREE.MeshBasicMaterial;
      m.opacity = 0.04 + Math.abs(Math.sin(s.clock.elapsedTime * 0.4 + i)) * 0.05;
    });
  });
  const rays = [-4, -2.2, -0.6, 1.1, 3, 4.4];
  return (
    <group ref={group} position={[0, 8, -3]}>
      {rays.map((x, i) => (
        <mesh key={i} position={[x, 0, (i % 3) - 1]} rotation={[0, 0, (x % 0.4) - 0.2]}>
          <coneGeometry args={[0.9, 16, 8, 1, true]} />
          <meshBasicMaterial
            color="#e7c667"
            transparent
            opacity={0.06}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

/** The seafloor, far below, fading into the fog. */
function Seafloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -10, 0]}>
      <planeGeometry args={[80, 80, 1, 1]} />
      <meshStandardMaterial color="#05121a" roughness={1} metalness={0} />
    </mesh>
  );
}

/** Slowly descend the camera; light dies as the deep takes over. */
function Descent() {
  const { camera } = useThree();
  const key = useRef<THREE.PointLight>(null);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    const depth = (Math.sin(t * 0.18) * 0.5 + 0.5) * 9; // 0..9 ease down and back
    camera.position.set(Math.sin(t * 0.1) * 0.6, 4 - depth, 7);
    camera.lookAt(0, 4 - depth - 2, 0);
    if (key.current) key.current.intensity = 1.6 * (1 - depth / 11);
  });
  return <pointLight ref={key} position={[0, 9, 2]} color="#cfe6ff" distance={30} />;
}

export function DeepDescent() {
  return (
    <SceneFrame cameraPosition={[0, 4, 7]} fog={false}>
      <fogExp2 attach="fog" args={["#030a10", 0.06]} />
      <ambientLight intensity={0.08} color="#0a1a26" />
      <GodRays />
      {/* marine snow — three drifting depths */}
      <Sparkles count={120} scale={[14, 20, 10]} size={2} speed={0.3} color="#bcd3e0" opacity={0.5} />
      <Sparkles count={60} scale={[10, 16, 8]} size={4} speed={0.15} color="#e7c667" opacity={0.3} />
      <Seafloor />
      <Descent />
    </SceneFrame>
  );
}
