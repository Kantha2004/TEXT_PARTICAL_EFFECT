import { WebGLParticalEffect, type WebGLParticalEffectOptions } from "./WebGLParticalEffect";
import type { CanvasConfig, Gradients } from "./types";

export class WebGLTextCanvas {
  private readonly canvas: HTMLCanvasElement;
  private readonly webglCanvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly gl: WebGLRenderingContext;
  private config: CanvasConfig;
  private particalEffect: WebGLParticalEffect | null;

  constructor(config: CanvasConfig) {
    this.config = config;
    this.canvas = this.initializeCanvas('text-canvas');
    this.webglCanvas = this.initializeCanvas('webgl-canvas');
    this.ctx = this.getContext2D();
    this.gl = this.getWebGLContext();
    this.particalEffect = null;
    
    // Hide the 2D canvas as it's only used for text rendering
    this.canvas.style.display = 'none';
  }

  private initializeCanvas(id: string): HTMLCanvasElement {
    const canvas = document.querySelector(`#${id}`) as HTMLCanvasElement;
    if (!canvas) {
      throw new Error(`Canvas element #${id} not found`);
    }
    canvas.width = this.config.width;
    canvas.height = this.config.height;
    return canvas;
  }

  private getContext2D(): CanvasRenderingContext2D {
    const ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      throw new Error('Failed to get 2D canvas context');
    }
    return ctx;
  }

  private getWebGLContext(): WebGLRenderingContext {
    const gl = this.webglCanvas.getContext('webgl');
    if (!gl) {
      throw new Error('WebGL not supported');
    }
    return gl;
  }

  private getWrappedTextLines(text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine.length > 0 ? `${currentLine} ${word}` : word;
      if (this.ctx.measureText(testLine).width > maxWidth) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  private getGradient(gradients: Gradients) {
    const gradient = this.ctx.createLinearGradient(0, 0, this.config.width, this.canvas.height);
    for (const gradientColor of gradients) {
      gradient.addColorStop(gradientColor.stop, gradientColor.color);
    }
    return gradient;
  }

  public initiateText(): void {
    this.clearCanvas();
    const { width, height, fontSize, text, maxWidthRatio, fontFamily = '' } = this.config;

    this.ctx.font = `${fontSize}px ${fontFamily}, Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = this.config.gradients?.length
      ? this.getGradient(this.config.gradients)
      : 'white';

    const textMaxWidth = width * maxWidthRatio;
    const lines = this.getWrappedTextLines(text, textMaxWidth);

    const horizontalCenter = width / 2;
    const verticalCenter = height / 2;
    const totalTextHeight = lines.length * fontSize;
    const verticalOffset = verticalCenter - (totalTextHeight / 2);

    lines.forEach((line, index) => {
      this.ctx.fillText(line, horizontalCenter, verticalOffset + (fontSize * index));
    });

    const particalEffectOptions: WebGLParticalEffectOptions = {
      shape: this.config.shape ?? 'circle',
      gap: this.config.gap,
    };

    this.particalEffect = new WebGLParticalEffect(this.gl, this.config.width, this.config.height, particalEffectOptions);
    this.particalEffect.convertToParticals(this.ctx);
  }

  public updateText(newText: string): void {
    if (!newText) return;
    this.particalEffect?.clearParticals();
    this.config.text = newText;
    this.initiateText();
  }

  public updateConfig(config: CanvasConfig): void {
    if (!config) return;
    this.particalEffect?.clearParticals();
    this.config = config;
    this.initiateText();
  }

  public clearCanvas() {
    this.ctx.clearRect(0, 0, this.config.width, this.config.height);
  }

  public renderEffect() {
    this.particalEffect?.render();
  }

  public resize(width: number, height: number) {
    this.config.width = width;
    this.config.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
    this.webglCanvas.width = width;
    this.webglCanvas.height = height;
    this.initiateText();
  }
}
