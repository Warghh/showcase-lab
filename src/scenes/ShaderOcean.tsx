import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SceneFrame } from "../components/SceneFrame";

const GOLD = "#e7c667";
const VELVET = "#040404";

const VERTEX_SHADER = `
precision highp float;

uniform float uTime;
uniform vec2 uWave1Dir;
uniform float uWave1Amp;
uniform float uWave1Len;
uniform float uWave1Speed;
uniform float uWave1Steep;
uniform vec2 uWave2Dir;
uniform float uWave2Amp;
uniform float uWave2Len;
uniform float uWave2Speed;
uniform float uWave2Steep;
uniform vec2 uWave3Dir;
uniform float uWave3Amp;
uniform float uWave3Len;
uniform float uWave3Speed;
uniform float uWave3Steep;

varying vec3 vNormal;
varying vec3 vWorldPos;
varying vec3 vViewDir;
varying float vWaveHeight;

const float PI = 3.14159265359;

void applyWave(
  in vec2 pos,
  in vec2 dir,
  in float amp,
  in float len,
  in float speed,
  in float steep,
  inout vec3 displaced,
  inout float dHdX,
  inout float dHdZ,
  inout float height
) {
  float k = 2.0 * PI / len;
  float phase = k * dot(dir, pos) + speed * uTime;
  float cosP = cos(phase);
  float sinP = sin(phase);
  displaced.x += dir.x * (steep * amp) * cosP;
  displaced.z += dir.y * (steep * amp) * cosP;
  displaced.y += amp * sinP;
  dHdX += dir.x * k * amp * cosP;
  dHdZ += dir.y * k * amp * cosP;
  height += amp * sinP;
}

void main() {
  vec3 displaced = position;
  float dHdX = 0.0;
  float dHdZ = 0.0;
  float height = 0.0;

  applyWave(displaced.xz, normalize(uWave1Dir), uWave1Amp, uWave1Len, uWave1Speed, uWave1Steep, displaced, dHdX, dHdZ, height);
  applyWave(displaced.xz, normalize(uWave2Dir), uWave2Amp, uWave2Len, uWave2Speed, uWave2Steep, displaced, dHdX, dHdZ, height);
  applyWave(displaced.xz, normalize(uWave3Dir), uWave3Amp, uWave3Len, uWave3Speed, uWave3Steep, displaced, dHdX, dHdZ, height);

  vec3 objectNormal = normalize(vec3(-dHdX, 1.0, -dHdZ));
  vNormal = normalize(normalMatrix * objectNormal);

  vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
  vWorldPos = worldPos.xyz;
  vec3 viewPos = (viewMatrix * worldPos).xyz;
  vViewDir = normalize(-viewPos);
  vWaveHeight = height;

  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform vec3 uBaseColor;
uniform vec3 uAccentColor;
uniform vec3 uLightDir;
uniform float uFresnelPower;
uniform float uSpecularPower;
uniform float uSpecularStrength;

varying vec3 vNormal;
varying vec3 vWorldPos;
varying vec3 vViewDir;
varying float vWaveHeight;

void main() {
  vec3 n = normalize(vNormal);
  vec3 v = normalize(vViewDir);
  vec3 l = normalize(uLightDir);

  float diff = max(dot(n, l), 0.0);
  vec3 h = normalize(l + v);
  float spec = pow(max(dot(n, h), 0.0), uSpecularPower) * uSpecularStrength;
  float fresnel = pow(1.0 - max(dot(n, v), 0.0), uFresnelPower);

  float crest = smoothstep(0.08, 0.4, vWaveHeight);
  float shimmer = clamp(fresnel * 0.65 + crest * 0.3 + diff * 0.1, 0.0, 1.0);

  vec3 base = uBaseColor;
  vec3 accent = uAccentColor;
  vec3 color = mix(base, accent, shimmer) + spec * accent;

  gl_FragColor = vec4(color, 1.0);
}
`;

function OceanSurface() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uWave1Dir: { value: new THREE.Vector2(0.8, 0.4) },
      uWave1Amp: { value: 0.18 },
      uWave1Len: { value: 6.5 },
      uWave1Speed: { value: 0.7 },
      uWave1Steep: { value: 0.85 },
      uWave2Dir: { value: new THREE.Vector2(-0.4, 0.9) },
      uWave2Amp: { value: 0.12 },
      uWave2Len: { value: 3.8 },
      uWave2Speed: { value: 1.05 },
      uWave2Steep: { value: 0.6 },
      uWave3Dir: { value: new THREE.Vector2(0.2, -1.0) },
      uWave3Amp: { value: 0.08 },
      uWave3Len: { value: 2.4 },
      uWave3Speed: { value: 1.4 },
      uWave3Steep: { value: 0.5 },
      uBaseColor: { value: new THREE.Color(VELVET) },
      uAccentColor: { value: new THREE.Color(GOLD) },
      uLightDir: { value: new THREE.Vector3(-0.4, 0.9, 0.25).normalize() },
      uFresnelPower: { value: 3.2 },
      uSpecularPower: { value: 48.0 },
      uSpecularStrength: { value: 0.8 },
    }),
    []
  );

  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, 0]}>
      <planeGeometry args={[90, 90, 220, 220]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export function ShaderOcean() {
  return (
    <SceneFrame cameraPosition={[0, 1.15, 7]}>
      <ambientLight intensity={0.05} color={VELVET} />
      <pointLight position={[2, 3, -2]} intensity={0.7} color={GOLD} distance={12} />
      <OceanSurface />
    </SceneFrame>
  );
}
