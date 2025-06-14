export type HexColor = `#${string}`;

export type RGBAColor = `rgba(${number}, ${number}, ${number}, ${number})`;

export type ParticleShape = 'circle' | 'square' | 'triangle' | 'star';

export type Gradients = {
  stop: number;
  color: HexColor | 'red' | 'blue' | 'green' | 'yellow' | 'orange' | 'purple' | 'black' | 'white' | 'orangered';
}[];

export type MousePosition = {
  mouseX: number;
  mouseY: number;
  radius: number;
}

export interface CanvasConfig {
  width: number;
  height: number;
  fontSize: number;
  text: string;
  maxWidthRatio: number;
  fontFamily?: string;
  gradients?: Gradients;
  shape?: ParticleShape;
  gap?: number;
}