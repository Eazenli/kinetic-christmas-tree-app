
import React, { useState } from 'react';
import Scene from './components/Scene';
import Overlay from './components/Overlay';
import { TreeConfig, OrnamentShape } from './types';
// @ts-ignore
import { GIFEncoder, quantize, applyPalette } from 'gifenc';

const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false); // Intro State
  const [isFormed, setIsFormed] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [exportProgress, setExportProgress] = useState<number | null>(null);
  
  const [config, setConfig] = useState<TreeConfig>({
    treeColor: '#046307', // Deep Emerald
    ornamentColors: ['#FFD700', '#C0C0C0', '#FF0000'], // Gold & Silver & Red default
    ornamentShapes: [OrnamentShape.SPHERE, OrnamentShape.CUBE, OrnamentShape.STAR],
    particleCount: 1500,
    bloomIntensity: 2.0,
    ornamentScale: 1.2,
    ornamentScaleVariance: 1.0,
  });

  // Helper to draw the cinematic overlay and text onto a 2D context
  const drawComposition = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // 1. Add Gradient Overlay for Text Contrast
    const gradient = ctx.createLinearGradient(0, height * 0.6, 0, height);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.8)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Draw "MERRY CHRISTMAS"
    // Scale font based on canvas width
    const titleSize = Math.max(24, width * 0.08); 
    ctx.font = `700 ${titleSize}px "Pinyon Script", cursive`;
    ctx.fillStyle = '#FFD700'; // Gold
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Add Shadow/Glow
    ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
    ctx.shadowBlur = width * 0.03;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillText("Merry Christmas", width / 2, height * 0.82);
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
  };

  const composeAndDownloadImage = (sourceCanvas: HTMLCanvasElement) => {
    const width = sourceCanvas.width;
    const height = sourceCanvas.height;

    // Create offscreen canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw 3D Scene
    ctx.drawImage(sourceCanvas, 0, 0);

    // Draw Overlay
    drawComposition(ctx, width, height);

    // Download
    try {
      const dataUrl = canvas.toDataURL('image/webp', 1.0);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'merry-christmas-card.webp';
      a.click();
    } catch (e) {
      console.error("Image export failed", e);
    }
  };

  const handleExport = async (wish: string, type: 'video' | 'image') => {
    setIsFormed(true); // Ensure tree is formed
    setIsRecording(true); // High Quality Render

    // Wait for scene to stabilize
    await new Promise(r => setTimeout(r, 1000));

    const sourceCanvas = document.querySelector('canvas');
    if (!sourceCanvas) {
      console.error("Canvas not found");
      setIsRecording(false);
      return;
    }

    if (type === 'image') {
       composeAndDownloadImage(sourceCanvas);
       setIsRecording(false);
    } else {
       // --- GIF Export Logic ---
       try {
         setExportProgress(0);
         // GIF Encoder setup
         const gif = new GIFEncoder();
         
         // Downscale for GIF performance (GIFs are heavy!)
         // Target width 800px, maintain aspect ratio
         const targetWidth = 800;
         const targetHeight = Math.floor(sourceCanvas.height * (targetWidth / sourceCanvas.width));
         
         // Temp canvas for composition & resizing
         const tmpCanvas = document.createElement('canvas');
         tmpCanvas.width = targetWidth;
         tmpCanvas.height = targetHeight;
         const ctx = tmpCanvas.getContext('2d', { willReadFrequently: true });
         if (!ctx) throw new Error("Could not create context");

         // Capture Settings
         const fps = 12;
         const durationSeconds = 3;
         const totalFrames = fps * durationSeconds;
         const delay = 1000 / fps;

         for (let i = 0; i < totalFrames; i++) {
            // Update progress
            setExportProgress(Math.round((i / totalFrames) * 100));

            // Draw current 3D frame to temp canvas
            ctx.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight);
            
            // Draw Text Overlay
            drawComposition(ctx, targetWidth, targetHeight);

            // Get Raw Pixel Data
            const { data } = ctx.getImageData(0, 0, targetWidth, targetHeight);
            
            // Quantize Colors (Convert truecolor to 256 color palette)
            const palette = quantize(data, 256);
            const index = applyPalette(data, palette);

            // Write frame to GIF
            gif.writeFrame(index, targetWidth, targetHeight, { palette, delay });

            // Wait for next frame render
            await new Promise(r => setTimeout(r, delay));
         }

         gif.finish();

         // Download
         const blob = new Blob([gif.bytes()], { type: 'image/gif' });
         const url = URL.createObjectURL(blob);
         const a = document.createElement('a');
         a.href = url;
         a.download = 'christmas-glow-card.gif';
         a.click();
         URL.revokeObjectURL(url);

       } catch (err) {
         console.error("GIF Recording failed", err);
       } finally {
         setIsRecording(false);
         setExportProgress(null);
       }
    }
  };

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden selection:bg-emerald-500 selection:text-white font-sans">
      {/* 3D Scene Background - Blurred in Intro */}
      <div className={`absolute inset-0 transition-all duration-1000 ease-in-out ${!hasStarted ? 'blur-sm scale-105 opacity-80' : 'blur-0 scale-100 opacity-100'}`}>
        <Scene 
          config={config} 
          isFormed={isFormed} 
          isRecording={isRecording}
        />
      </div>
      
      <Overlay 
        config={config} 
        setConfig={setConfig} 
        isFormed={isFormed}
        setIsFormed={setIsFormed}
        onExport={handleExport}
        exportProgress={exportProgress}
        hasStarted={hasStarted}
        onStart={() => setHasStarted(true)}
      />
      
      {/* Decorative Gradient Overlay for Cinematic Depth */}
      <div className={`absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] z-0 transition-opacity duration-1000 ${hasStarted ? 'opacity-100' : 'opacity-60'}`} />
    </div>
  );
};

export default App;
