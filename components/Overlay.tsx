
import React, { useState } from 'react';
import { TreeConfig, OrnamentShape } from '../types';
import { 
  Sparkles, Box, Circle, Diamond, Play, Shuffle, 
  Settings2, Palette, ChevronRight, Star, Triangle, X, RectangleHorizontal, Gift, Share2, Video, Image as ImageIcon
} from 'lucide-react';

interface OverlayProps {
  config: TreeConfig;
  setConfig: React.Dispatch<React.SetStateAction<TreeConfig>>;
  isFormed: boolean;
  setIsFormed: (val: boolean) => void;
  onExport: (wish: string, type: 'video' | 'image') => void;
  exportProgress: number | null;
  hasStarted: boolean;
  onStart: () => void;
}

const PRESET_PALETTES = [
  ['#FFD700', '#C0C0C0', '#ffffff'], // Royal Gold
  ['#FF7300', '#ffffff', '#00ff00'], // Updated Classic Xmas
  ['#ff00ff', '#00ffff', '#ffff00'], // Cyberpunk
  ['#FF69B4', '#FFB6C1', '#FFF0F5'], // Soft Pink
];

// Updated Color List
const EXTENDED_COLORS = [
  '#FFD700', '#C0C0C0', '#FF6600', '#69FFD4', // Row 1
  '#FF69B4', '#AD8AF4', '#FF0090', '#FFA500', // Row 2
  '#FFFFFF', '#0000FF', '#972786', '#008080', // Row 3
  '#7200C4', '#ff5d73', '#F0E68C', '#8093F1', // Row 4
  '#FF0000', '#30bced', '#fcff4b', '#C8FF00'  
];

const Overlay: React.FC<OverlayProps> = ({ config, setConfig, isFormed, setIsFormed, onExport, exportProgress, hasStarted, onStart }) => {
  const [showCard, setShowCard] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  const handleCreateCard = () => {
    // Directly set static wish instead of calling AI
    setShowCard(true);
    setIsFormed(true); // Ensure tree is formed for the 'snapshot'
  };

  const handleExportClick = (type: 'video' | 'image') => {
    if (onExport) {
      onExport("MERRY CHRISTMAS", type);
      // Don't close card immediately if video, wait for progress to start or let global progress overlay take over
      if (type === 'image') setShowCard(false); 
      // For video, we keep card open or let the progress bar cover it. 
      // The progress bar overlay has z-index 60, card has 50.
    }
  };

  const toggleShape = (shape: OrnamentShape) => {
    const current = config.ornamentShapes;
    if (current.includes(shape)) {
      if (current.length > 1) { // Prevent unselecting last shape
        setConfig({ ...config, ornamentShapes: current.filter(s => s !== shape) });
      }
    } else {
      setConfig({ ...config, ornamentShapes: [...current, shape] });
    }
  };

  const toggleColor = (color: string) => {
    const current = config.ornamentColors;
    if (current.includes(color)) {
      if (current.length > 1) {
        setConfig({ ...config, ornamentColors: current.filter(c => c !== color) });
      }
    } else {
      setConfig({ ...config, ornamentColors: [...current, color] });
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col z-10 overflow-hidden font-sans">
      
      {/* 
        LOGO Header 
        - Intro State: Fixed Center, Scaled Up
        - App State: Top Left, Scaled Down
      */}
      <div className={`pointer-events-auto z-40 flex flex-col items-center transition-all duration-1000 ease-in-out
        ${hasStarted 
           ? 'absolute left-8 top-8 scale-100' 
           : 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-150'
        }
      `}>
        <h1 className="text-4xl md:text-5xl font-normal font-['Pinyon_Script'] text-emerald-300 drop-shadow-[0_0_15px_rgba(52,211,153,0.6)] whitespace-nowrap">
          Christmas Glow
        </h1>
        <div className={`h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent my-2 transition-all duration-1000 ${hasStarted ? 'w-32' : 'w-48'}`}></div>
        <p className="text-gold-200 text-[10px] md:text-xs uppercase tracking-[0.25em] font-sans font-light text-yellow-100/80">
          Kinetic Christmas Tree
        </p>
        
        {/* Start Button - Only visible in intro */}
        {!hasStarted && (
           <button 
             onClick={onStart}
             className="mt-12 group relative px-6 py-2 bg-emerald-950/40 border border-emerald-500/30 rounded-full overflow-hidden transition-all hover:bg-emerald-900/60 hover:border-emerald-400/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-in fade-in zoom-in duration-1000 delay-500 fill-mode-both"
           >
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
             <span className="relative font-sans text-xs tracking-[0.2em] text-emerald-100 uppercase">
               Create Your Own Christmas Tree
             </span>
           </button>
        )}
      </div>

      {/* 
        Main Application UI Controls 
        - Fades in after start
      */}
      <div className={`absolute inset-0 transition-opacity duration-1000 delay-500 ${hasStarted ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          
          {/* Top Right: Assemble/Dissolve Button */}
          <div className="absolute right-8 top-8 pointer-events-auto z-40">
            <button 
              onClick={() => setIsFormed(!isFormed)}
              className={`flex items-center gap-3 px-6 py-3 rounded-full border backdrop-blur-md transition-all duration-700 group
                ${isFormed 
                  ? 'bg-red-900/20 border-red-500/30 text-red-100 hover:bg-red-900/40 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)]' 
                  : 'bg-emerald-900/20 border-emerald-500/30 text-emerald-100 hover:bg-emerald-900/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]'}
              `}
            >
              {isFormed ? <Shuffle className="w-5 h-5 group-hover:rotate-180 transition-transform" /> : <Play className="w-5 h-5 group-hover:scale-125 transition-transform" />}
              <span className="font-sans tracking-widest text-xs md:text-sm">{isFormed ? 'DISSOLVE' : 'ASSEMBLE'}</span>
            </button>
          </div>

          {/* Export Progress Overlay */}
          {exportProgress !== null && (
            <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300 pointer-events-auto">
              <div className="w-72 space-y-6 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Sparkles className="text-yellow-400 animate-spin-slow w-8 h-8" />
                  <h3 className="text-emerald-300 font-serif tracking-widest uppercase text-lg">Weaving Magic...</h3>
                </div>
                
                <div className="relative w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 via-yellow-400 to-emerald-500 transition-all duration-300 ease-out"
                        style={{ width: `${exportProgress}%` }}
                    />
                </div>
                
                <p className="text-emerald-400/60 text-xs font-mono tracking-wider">{exportProgress}% COMPLETE</p>
              </div>
            </div>
          )}

          {/* Greeting Card Modal Overlay */}
          {showCard && exportProgress === null && (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-500 pointer-events-auto">
              <div className="relative w-full max-w-lg bg-gradient-to-br from-emerald-950 to-black border border-yellow-500/30 rounded-xl p-8 shadow-[0_0_50px_rgba(16,185,129,0.3)] flex flex-col items-center text-center transform transition-all scale-100">
                <button 
                    onClick={() => setShowCard(false)}
                    className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>

                <div className="w-16 h-16 bg-gradient-to-tr from-yellow-400 to-yellow-200 rounded-full flex items-center justify-center shadow-lg mb-6">
                    <Gift className="text-black w-8 h-8" />
                </div>

                <h3 className="font-serif text-2xl text-yellow-100 mb-2 tracking-widest uppercase">Holiday Greetings</h3>
                <p className="font-serif text-3xl text-emerald-300 mb-6 drop-shadow-lg">MERRY CHRISTMAS</p>
                
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6" />
                
                <div className="flex flex-col gap-3 w-full">
                  <button 
                    onClick={() => handleExportClick('video')}
                    className="w-full py-4 bg-white text-black rounded-lg text-xs md:text-sm uppercase tracking-widest font-bold hover:bg-gray-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2"
                  >
                    <Video size={16} />
                    Download GIF Card
                  </button>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleExportClick('image')}
                      className="flex-1 py-3 border border-white/20 rounded-lg text-xs uppercase tracking-widest hover:bg-white/10 transition-colors text-white/90 flex items-center justify-center gap-2"
                    >
                      <ImageIcon size={16} />
                      Download JPG Image
                    </button>
                    <button onClick={() => setShowCard(false)} className="flex-1 py-3 border border-white/10 rounded-lg text-xs uppercase tracking-widest hover:bg-white/5 transition-colors text-white/50">
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Area - Greeting Card Button */}
          {!showCard && exportProgress === null && (
            <div className="absolute bottom-0 left-0 p-8 flex items-end justify-start pointer-events-none z-20">
              <button 
                onClick={handleCreateCard}
                className="pointer-events-auto group flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300
                  text-white/40 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10
                "
              >
                <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="tracking-widest text-[10px] uppercase font-light">Create Greeting Card</span>
              </button>
            </div>
          )}

          {/* Right Sidebar - Designer Panel */}
          <div 
            className={`pointer-events-auto absolute right-0 top-0 bottom-0 w-80 bg-black/90 backdrop-blur-2xl border-l border-white/10 transition-transform duration-500 ease-in-out flex flex-col z-30 shadow-2xl ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
          >
            {/* Toggle Tab */}
            <button 
              onClick={() => setIsPanelOpen(!isPanelOpen)}
              className="absolute left-0 top-32 -translate-x-full bg-black/90 border-y border-l border-white/10 p-3 rounded-l-xl text-emerald-400 hover:text-white hover:bg-emerald-900/50 transition-colors shadow-lg"
              title={isPanelOpen ? "Close Designer" : "Open Designer"}
            >
              {isPanelOpen ? <ChevronRight size={20} /> : <Settings2 size={20} />}
            </button>

            {/* Panel Content */}
            <div className="pt-24 p-6 overflow-y-auto custom-scrollbar h-full space-y-8">
              <h2 className="text-white font-sans text-xl border-b border-white/10 pb-4 flex items-center gap-2">
                  <Palette size={18} className="text-emerald-400" /> Atelier
              </h2>

              {/* Shapes Section */}
              <div className="space-y-3">
                <label className="text-xs text-emerald-400/80 uppercase tracking-widest font-bold">Ornament Geometry</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: OrnamentShape.SPHERE, icon: Circle, label: 'Pearl' },
                    { id: OrnamentShape.CUBE, icon: Box, label: 'Cube' },
                    { id: OrnamentShape.DIAMOND, icon: Diamond, label: 'Prism' },
                    { id: OrnamentShape.STAR, icon: Star, label: 'Star' },
                    { id: OrnamentShape.RECTANGLE, icon: RectangleHorizontal, label: 'Tag' },
                    { id: OrnamentShape.TRIANGLE, icon: Triangle, label: 'Shard' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => toggleShape(item.id)}
                      className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-2 transition-all border duration-300
                        ${config.ornamentShapes.includes(item.id) 
                          ? 'bg-emerald-900/50 border-emerald-400 text-white shadow-[0_0_15px_rgba(52,211,153,0.3)]' 
                          : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10 hover:text-white'}
                      `}
                    >
                      <item.icon size={20} strokeWidth={1.5} />
                      <span className="text-[10px] uppercase">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Controls */}
              <div className="space-y-3">
                  <label className="text-xs text-emerald-400/80 uppercase tracking-widest font-bold">Dimensions</label>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-5">
                    
                    {/* Base Size */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs text-gray-400">
                        <span>Base Size</span>
                        <span>{(config.ornamentScale * 100).toFixed(0)}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.5" 
                        max="3" 
                        step="0.1" 
                        value={config.ornamentScale}
                        onChange={(e) => setConfig({...config, ornamentScale: parseFloat(e.target.value)})}
                        className="w-full accent-emerald-500 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Random Variance Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs text-gray-400">
                        <span>Random Variance</span>
                        <span>{(config.ornamentScaleVariance * 100).toFixed(0)}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="2" 
                        step="0.1" 
                        value={config.ornamentScaleVariance}
                        onChange={(e) => setConfig({...config, ornamentScaleVariance: parseFloat(e.target.value)})}
                        className="w-full accent-emerald-500 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                  </div>
              </div>

              {/* Color Palette */}
              <div className="space-y-3">
                <label className="text-xs text-emerald-400/80 uppercase tracking-widest font-bold">Pigments</label>
                
                {/* Presets */}
                <div className="flex gap-2 mb-3">
                    {PRESET_PALETTES.map((palette, i) => (
                      <button 
                        key={i}
                        onClick={() => setConfig({...config, ornamentColors: palette})}
                        className="h-6 flex-1 rounded-md overflow-hidden flex border border-white/10 hover:opacity-80 transition-opacity"
                      >
                        {palette.map(c => (
                          <div key={c} style={{backgroundColor: c}} className="flex-1 h-full" />
                        ))}
                      </button>
                    ))}
                </div>

                {/* Extended Color Picker - Circular Grid */}
                <div className="grid grid-cols-4 gap-2">
                  {EXTENDED_COLORS.map((col) => {
                      const isSelected = config.ornamentColors.includes(col);
                      return (
                      <button
                        key={col}
                        onClick={() => toggleColor(col)}
                        className={`aspect-square rounded-full border-2 transition-transform hover:scale-110 relative group
                          ${isSelected ? 'border-white scale-110' : 'border-transparent'}
                        `}
                        style={{ backgroundColor: col }}
                      >
                        {isSelected && <div className="absolute inset-0 flex items-center justify-center text-black/50"><Sparkles size={10} /></div>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default Overlay;
