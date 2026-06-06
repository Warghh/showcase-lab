import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SceneFrame } from "../components/SceneFrame";

const GOLD = "#e2c168";
const PALE_BLUE = "#9fd8ff";

const F3 = 1 / 3;
const G3 = 1 / 6;

const GRAD3: [number, number, number][] = [
  [1, 1, 0],
  [-1, 1, 0],
  [1, -1, 0],
  [-1, -1, 0],
  [1, 0, 1],
  [-1, 0, 1],
  [1, 0, -1],
  [-1, 0, -1],
  [0, 1, 1],
  [0, -1, 1],
  [0, 1, -1],
  [0, -1, -1],
];

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makePermutation(seed: number) {
  const rand = mulberry32(seed);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i += 1) p[i] = i;
  for (let i = 255; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = p[i];
    p[i] = p[j];
    p[j] = tmp;
  }
  const perm = new Uint8Array(512);
  for (let i = 0; i < 512; i += 1) perm[i] = p[i & 255];
  return perm;
}

function makeSimplex3D(seed: number) {
  const perm = makePermutation(seed);
  return (x: number, y: number, z: number) => {
    const s = (x + y + z) * F3;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);
    const k = Math.floor(z + s);

    const t = (i + j + k) * G3;
    const x0 = x - (i - t);
    const y0 = y - (j - t);
    const z0 = z - (k - t);

    let i1 = 0;
    let j1 = 0;
    let k1 = 0;
    let i2 = 0;
    let j2 = 0;
    let k2 = 0;

    if (x0 >= y0) {
      if (y0 >= z0) {
        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 1;
        k2 = 0;
      } else if (x0 >= z0) {
        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 0;
        k2 = 1;
      } else {
        i1 = 0;
        j1 = 0;
        k1 = 1;
        i2 = 1;
        j2 = 0;
        k2 = 1;
      }
    } else if (y0 < z0) {
      i1 = 0;
      j1 = 0;
      k1 = 1;
      i2 = 0;
      j2 = 1;
      k2 = 1;
    } else if (x0 < z0) {
      i1 = 0;
      j1 = 1;
      k1 = 0;
      i2 = 0;
      j2 = 1;
      k2 = 1;
    } else {
      i1 = 0;
      j1 = 1;
      k1 = 0;
      i2 = 1;
      j2 = 1;
      k2 = 0;
    }

    const x1 = x0 - i1 + G3;
    const y1 = y0 - j1 + G3;
    const z1 = z0 - k1 + G3;
    const x2 = x0 - i2 + 2 * G3;
    const y2 = y0 - j2 + 2 * G3;
    const z2 = z0 - k2 + 2 * G3;
    const x3 = x0 - 1 + 3 * G3;
    const y3 = y0 - 1 + 3 * G3;
    const z3 = z0 - 1 + 3 * G3;

    const ii = i & 255;
    const jj = j & 255;
    const kk = k & 255;

    const gi0 = perm[ii + perm[jj + perm[kk]]] % 12;
    const gi1 = perm[ii + i1 + perm[jj + j1 + perm[kk + k1]]] % 12;
    const gi2 = perm[ii + i2 + perm[jj + j2 + perm[kk + k2]]] % 12;
    const gi3 = perm[ii + 1 + perm[jj + 1 + perm[kk + 1]]] % 12;

    let n0 = 0;
    let n1 = 0;
    let n2 = 0;
    let n3 = 0;

    let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
    if (t0 > 0) {
      t0 *= t0;
      n0 = t0 * t0 * (GRAD3[gi0][0] * x0 + GRAD3[gi0][1] * y0 + GRAD3[gi0][2] * z0);
    }

    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
    if (t1 > 0) {
      t1 *= t1;
      n1 = t1 * t1 * (GRAD3[gi1][0] * x1 + GRAD3[gi1][1] * y1 + GRAD3[gi1][2] * z1);
    }

    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
    if (t2 > 0) {
      t2 *= t2;
      n2 = t2 * t2 * (GRAD3[gi2][0] * x2 + GRAD3[gi2][1] * y2 + GRAD3[gi2][2] * z2);
    }

    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
    if (t3 > 0) {
      t3 *= t3;
      n3 = t3 * t3 * (GRAD3[gi3][0] * x3 + GRAD3[gi3][1] * y3 + GRAD3[gi3][2] * z3);
    }

    return 32 * (n0 + n1 + n2 + n3);
  };
}

function makeCurlField(seed: number) {
  const noise = makeSimplex3D(seed);
  const noiseY = (x: number, y: number, z: number) => noise(x + 31.416, y + 17.11, z + 9.21);
  const noiseZ = (x: number, y: number, z: number) => noise(x + 11.73, y + 57.2, z + 83.12);
  const eps = 0.01;

  return (x: number, y: number, z: number) => {
    const dFz_dy = (noiseZ(x, y + eps, z) - noiseZ(x, y - eps, z)) / (2 * eps);
    const dFy_dz = (noiseY(x, y, z + eps) - noiseY(x, y, z - eps)) / (2 * eps);

    const dFx_dz = (noise(x, y, z + eps) - noise(x, y, z - eps)) / (2 * eps);
    const dFz_dx = (noiseZ(x + eps, y, z) - noiseZ(x - eps, y, z)) / (2 * eps);

    const dFy_dx = (noiseY(x + eps, y, z) - noiseY(x - eps, y, z)) / (2 * eps);
    const dFx_dy = (noise(x, y + eps, z) - noise(x, y - eps, z)) / (2 * eps);

    return [dFz_dy - dFy_dz, dFx_dz - dFz_dx, dFy_dx - dFx_dy] as const;
  };
}

export function ParticleFlow() {
  const count = 6200;
  const bounds = 5.5;
  const reduceMotion = useRef(false);
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, velocities, colors } = useMemo(() => {
    const rand = mulberry32(913);
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const gold = new THREE.Color(GOLD);
    const blue = new THREE.Color(PALE_BLUE);

    for (let i = 0; i < count; i += 1) {
      const idx = i * 3;
      pos[idx] = (rand() * 2 - 1) * bounds;
      pos[idx + 1] = (rand() * 2 - 1) * bounds * 0.8;
      pos[idx + 2] = (rand() * 2 - 1) * bounds;

      vel[idx] = (rand() * 2 - 1) * 0.05;
      vel[idx + 1] = (rand() * 2 - 1) * 0.05;
      vel[idx + 2] = (rand() * 2 - 1) * 0.05;

      const mix = rand();
      const c = gold.clone().lerp(blue, mix);
      col[idx] = c.r;
      col[idx + 1] = c.g;
      col[idx + 2] = c.b;
    }

    return { positions: pos, velocities: vel, colors: col };
  }, [count, bounds]);

  const curlField = useMemo(() => makeCurlField(27), []);

  useEffect(() => {
    reduceMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useFrame((_state, delta) => {
    if (reduceMotion.current) return;
    const positionAttr = pointsRef.current?.geometry.attributes.position as THREE.BufferAttribute | undefined;
    if (!positionAttr) return;

    const speed = 0.85;
    const frequency = 0.45;
    const maxSpeed = 1.4;

    for (let i = 0; i < count; i += 1) {
      const idx = i * 3;
      const x = positions[idx];
      const y = positions[idx + 1];
      const z = positions[idx + 2];

      const [cx, cy, cz] = curlField(x * frequency, y * frequency, z * frequency);
      velocities[idx] += cx * speed * delta;
      velocities[idx + 1] += cy * speed * delta;
      velocities[idx + 2] += cz * speed * delta;

      const vx = velocities[idx];
      const vy = velocities[idx + 1];
      const vz = velocities[idx + 2];
      const vmag = Math.sqrt(vx * vx + vy * vy + vz * vz);
      if (vmag > maxSpeed) {
        const scale = maxSpeed / vmag;
        velocities[idx] *= scale;
        velocities[idx + 1] *= scale;
        velocities[idx + 2] *= scale;
      }

      positions[idx] += velocities[idx];
      positions[idx + 1] += velocities[idx + 1];
      positions[idx + 2] += velocities[idx + 2];

      if (
        Math.abs(positions[idx]) > bounds ||
        Math.abs(positions[idx + 1]) > bounds ||
        Math.abs(positions[idx + 2]) > bounds
      ) {
        positions[idx] = (Math.random() * 2 - 1) * bounds * 0.9;
        positions[idx + 1] = (Math.random() * 2 - 1) * bounds * 0.6;
        positions[idx + 2] = (Math.random() * 2 - 1) * bounds * 0.9;
        velocities[idx] *= 0.2;
        velocities[idx + 1] *= 0.2;
        velocities[idx + 2] *= 0.2;
      }
    }

    positionAttr.needsUpdate = true;
  });

  return (
    <SceneFrame cameraPosition={[0, 0.2, 8]}>
      <color attach="background" args={["#04070b"]} />
      <fogExp2 attach="fog" args={["#04070b", 0.09]} />
      <ambientLight intensity={0.15} color="#7fb4c8" />
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={positions} count={positions.length / 3} itemSize={3} />
          <bufferAttribute attach="attributes-color" array={colors} count={colors.length / 3} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={0.055}
          vertexColors
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </SceneFrame>
  );
}
