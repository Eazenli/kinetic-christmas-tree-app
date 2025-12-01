import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { TreeParticles } from './TreeParticles';
import { TreeConfig, OrnamentShape } from '../types';
import Snow from './Snow';

interface SceneProps {
  config: TreeConfig;
  isFormed: boolean;
  isRecording?: boolean;
}

const Scene: React.FC<SceneProps> = ({ config, isFormed, isRecording }) => {
  
  // Calculate particles per shape to maintain total count roughly
  const particleCountPerShape = Math.floor(config.particleCount / Math.max(1, config.ornamentShapes.length));

  return (
    <Canvas 
      // Lower DPR to 1.5 during recording to prevent frame drops/lag, 2 for normal usage
      dpr={isRecording ? 1.5 : [1, 2]} 
      gl={{ 
        antialias: true, 
        stencil: false, 
        depth: true,
        preserveDrawingBuffer: true // Crucial for media recording/screenshots
      }}
    >
      <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={45} />
      
      <color attach="background" args={['#050508']} />
      
      <Suspense fallback={null}>
        <group position={[0, -2, 0]}>
            {/* 1. The Emerald Tree Base Structure */}
            <TreeParticles 
                count={4000} 
                colors={[config.treeColor, '#024004', '#067c0a']} // Emerald mix
                shape={OrnamentShape.DIAMOND} 
                isFormed={isFormed} 
                baseScale={0.8} // Smaller particles for foliage
                scaleVariance={0.5}
            />
            
            {/* 2. The Custom Ornaments Layers */}
            {config.ornamentShapes.map((shape) => (
               <TreeParticles
                  key={shape}
                  count={particleCountPerShape}
                  colors={config.ornamentColors}
                  shape={shape}
                  isFormed={isFormed}
                  baseScale={config.ornamentScale}
                  scaleVariance={config.ornamentScaleVariance}
               />
            ))}
        </group>

        {/* Cinematic Atmosphere */}
        <Snow />

        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#ffddaa" />
        <pointLight position={[-10, 5, -10]} intensity={1.5} color="#ccffcc" />
        <spotLight 
            position={[0, 25, 0]} 
            angle={0.6} 
            penumbra={1} 
            intensity={3} 
            castShadow 
            shadow-mapSize={2048} 
        />

        <Environment preset="city" />
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />

        <EffectComposer enableNormalPass={false}>
          <Bloom 
            luminanceThreshold={0.9} 
            mipmapBlur 
            intensity={config.bloomIntensity} 
            radius={0.6}
            levels={8}
          />
          {/* Subtle noise for film grain */}
          <Noise opacity={0.015} />
        </EffectComposer>
      </Suspense>

      <OrbitControls 
        enablePan={false} 
        enableZoom={true} 
        minPolarAngle={Math.PI / 2.5} 
        maxPolarAngle={Math.PI / 1.8}
        minDistance={8}
        maxDistance={30}
        autoRotate={isFormed && !isRecording} 
        autoRotateSpeed={0.3}
        dampingFactor={0.05}
      />
    </Canvas>
  );
};

export default Scene;