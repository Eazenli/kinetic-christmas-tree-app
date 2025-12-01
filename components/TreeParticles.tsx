
import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrnamentShape } from '../types';

interface TreeParticlesProps {
  count: number;
  colors: string[]; // Now accepts an array of colors
  shape: OrnamentShape;
  isFormed: boolean;
  baseScale?: number;
  scaleVariance?: number; // Changed to number 0-1
}

const tempObject = new THREE.Object3D();
const tempColor = new THREE.Color();
const tempVec3 = new THREE.Vector3();
const mouseVec3 = new THREE.Vector3();

// --- Geometry Generators ---
const createStarShape = () => {
  const shape = new THREE.Shape();
  const outerRadius = 0.15;
  const innerRadius = 0.07;
  const points = 5;
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i / (points * 2)) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
};

export const TreeParticles: React.FC<TreeParticlesProps> = ({ 
  count, 
  colors, 
  shape, 
  isFormed,
  baseScale = 1,
  scaleVariance = 0
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { viewport, mouse, camera } = useThree();

  // Generate random data for particles
  const particles = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
      // 1. Target Position (Cone Tree Structure)
      const height = 14;
      const y = Math.random() * height - height / 2; // -7 to 7
      const normalizedY = (y + height / 2) / height; // 0 to 1
      const maxRadiusAtY = (1 - normalizedY) * 5; 
      
      const r = Math.sqrt(Math.random()) * maxRadiusAtY; 
      const theta = Math.random() * Math.PI * 2;
      
      const targetX = r * Math.cos(theta);
      const targetZ = r * Math.sin(theta);
      const targetY = y;

      // 2. Chaos Position
      const chaosX = (Math.random() - 0.5) * 30;
      const chaosY = (Math.random() - 0.5) * 30;
      const chaosZ = (Math.random() - 0.5) * 20;

      // 3. Scale Calculation
      // If scaleVariance is 0, multiplier is 1. If 1, multiplier is 0.5 to 1.5
      const randomFactor = (Math.random() - 0.5) * scaleVariance; // -0.5*v to 0.5*v
      const scaleMultiplier = 1 + randomFactor; 
      const scale = baseScale * scaleMultiplier;

      data.push({
        target: new THREE.Vector3(targetX, targetY, targetZ),
        chaos: new THREE.Vector3(chaosX, chaosY, chaosZ),
        current: new THREE.Vector3(chaosX, chaosY, chaosZ),
        scale: Math.max(0.1, scale), // Prevent negative or zero scale
        phase: Math.random() * Math.PI * 2,
        colorIndex: Math.floor(Math.random() * colors.length), 
      });
    }
    return data;
  }, [count, baseScale, scaleVariance, colors.length]);

  // Geometry switch
  const geometry = useMemo(() => {
    const extrudeSettings = { depth: 0.1, bevelEnabled: true, bevelSegments: 1, steps: 1, bevelSize: 0.02, bevelThickness: 0.02 };
    
    switch (shape) {
      case OrnamentShape.CUBE: return new THREE.BoxGeometry(0.2, 0.2, 0.2);
      case OrnamentShape.DIAMOND: return new THREE.OctahedronGeometry(0.15);
      case OrnamentShape.TRIANGLE: return new THREE.ConeGeometry(0.15, 0.3, 3);
      case OrnamentShape.STAR: 
        return new THREE.ExtrudeGeometry(createStarShape(), extrudeSettings);
      case OrnamentShape.RECTANGLE:
        // A sleek vertical rectangle tag or "gift box" shape
        return new THREE.BoxGeometry(0.15, 0.25, 0.05); 
      case OrnamentShape.SPHERE:
      default: return new THREE.SphereGeometry(0.12, 16, 16);
    }
  }, [shape]);

  // Update colors when palette changes
  useLayoutEffect(() => {
    if (meshRef.current) {
      particles.forEach((p, i) => {
        // Pick color based on assigned index, wrapping if palette shrinks
        const colorHex = colors[p.colorIndex % colors.length]; 
        const c = new THREE.Color(colorHex);
        meshRef.current!.setColorAt(i, c);
      });
      meshRef.current.instanceColor!.needsUpdate = true;
    }
  }, [colors, particles]);

  useFrame((state) => {
    if (!meshRef.current) return;

    // Repulsion Logic
    mouseVec3.set(mouse.x * viewport.width / 2, mouse.y * viewport.height / 2, 2);
    mouseVec3.unproject(camera);
    // Approximate interaction plane at z=0, but follow camera angle roughly
    // Simple sphere repulsion from a projected point in front of camera
    const repulsionCenter = mouseVec3.clone().setZ(2).multiplyScalar(5); 

    const time = state.clock.getElapsedTime();
    const lerpFactor = isFormed ? 0.04 : 0.02;

    particles.forEach((particle, i) => {
      // Move towards target
      const dest = isFormed ? particle.target : particle.chaos;
      particle.current.lerp(dest, lerpFactor);

      // Float noise
      particle.current.y += Math.sin(time + particle.phase) * 0.005;

      // Mouse Repulsion
      const d = particle.current.distanceTo(repulsionCenter);
      const repRadius = 5;
      if (d < repRadius) {
        const force = (1 - d / repRadius) * 2; // Stronger core
        const dir = tempVec3.copy(particle.current).sub(repulsionCenter).normalize();
        particle.current.add(dir.multiplyScalar(force * 0.1));
      }

      // Update Matrix
      tempObject.position.copy(particle.current);
      
      // Continuous Rotation
      tempObject.rotation.x = time * 0.5 + particle.phase;
      tempObject.rotation.y = time * 0.8 + particle.phase;
      
      tempObject.scale.setScalar(particle.scale);
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);

      // Twinkle Effect (modulating emissive/color brightness)
      // We re-apply color every frame to add the 'bloom' pulse
      const baseColorHex = colors[particle.colorIndex % colors.length];
      tempColor.set(baseColorHex);
      
      const twinkle = Math.sin(time * 3 + particle.phase);
      if (twinkle > 0.8) {
         tempColor.offsetHSL(0, 0, 0.2); // Flash white/bright
      }
      meshRef.current!.setColorAt(i, tempColor);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, undefined, count]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        toneMapped={false}
        roughness={0.2}
        metalness={0.9}
        emissiveIntensity={0.8}
      />
    </instancedMesh>
  );
};
