export enum OrnamentShape {
  SPHERE = 'sphere',
  CUBE = 'cube',
  DIAMOND = 'diamond',
  STAR = 'star',
  RECTANGLE = 'rectangle',
  TRIANGLE = 'triangle'
}

export interface TreeConfig {
  ornamentColors: string[];
  ornamentShapes: OrnamentShape[];
  treeColor: string;
  particleCount: number; // For ornaments
  bloomIntensity: number;
  ornamentScale: number;
  ornamentScaleVariance: number; // 0 to 1
}

// Fix: Augment global JSX namespace to include Three.js elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      instancedMesh: any;
      meshStandardMaterial: any;
      meshBasicMaterial: any;
      ambientLight: any;
      pointLight: any;
      spotLight: any;
      group: any;
      octahedronGeometry: any;
      color: any;
    }
  }
}
