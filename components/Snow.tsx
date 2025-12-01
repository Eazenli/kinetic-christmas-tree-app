import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import '../types';

const Snow: React.FC = () => {
  const count = 1000;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 50;
      const y = (Math.random() - 0.5) * 50;
      const z = (Math.random() - 0.5) * 50;
      const speed = 0.02 + Math.random() * 0.05;
      const xSpeed = (Math.random() - 0.5) * 0.01;
      temp.push({ x, y, z, speed, xSpeed });
    }
    return temp;
  }, []);

  useFrame(() => {
    if (!mesh.current) return;
    
    particles.forEach((particle, i) => {
      particle.y -= particle.speed;
      particle.x += particle.xSpeed;
      
      if (particle.y < -20) {
        particle.y = 20;
        particle.x = (Math.random() - 0.5) * 50;
        particle.z = (Math.random() - 0.5) * 50;
      }

      dummy.position.set(particle.x, particle.y, particle.z);
      // Gentle rotation
      dummy.rotation.x += 0.001;
      dummy.rotation.y += 0.002;
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <octahedronGeometry args={[0.02, 0]} />
      <meshStandardMaterial 
        color="#ffffff" 
        emissive="#ffffff" 
        emissiveIntensity={0.5} 
        transparent 
        opacity={0.6} 
        roughness={0.1}
      />
    </instancedMesh>
  );
};

export default Snow;