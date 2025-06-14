/**
 * @author Kanthakumar
 *
 * This particle effect is a customized version of an original concept 
 * by Frank's Laboratory on YouTube.
 *
 * Inspired by: https://www.youtube.com/watch?v=2F2t1RJoGt8
 *
 * Credits:
 * A big thanks to Frank's Laboratory for the inspiring tutorial that laid the 
 * foundation for this effect.
 *
 * If you enjoy interactive canvas animations, definitely check out the video and 
 * consider supporting the channel!
 */


import { ParticalEffect, type ParticalEffectOptions } from "./ParticalEffect";
import type { CanvasConfig, Gradients } from "./types";

/**
 * The TextCanvas class handles drawing styled and wrapped text on a canvas,
 * and applies a particle animation effect to the drawn text.
 */
export class TextCanvas {
  /** The HTML canvas element used for rendering. */
  private readonly canvas: HTMLCanvasElement;

  /** The 2D rendering context of the canvas. */
  private readonly ctx: CanvasRenderingContext2D;

  /** Configuration for canvas size, font, text, and color. */
  private config: CanvasConfig;

  /** The particle effect applied to the rendered text. */
  private particalEffect: ParticalEffect | null;


  /**
   * Constructs the TextCanvas with the provided configuration.
   * @param config - CanvasConfig object containing setup details.
   */
  constructor(config: CanvasConfig) {
    this.config = config;
    this.canvas = this.initializeCanvas();
    this.ctx = this.getContext();
    this.particalEffect = null;
  }

  /**
   * Initializes the canvas element and sets its dimensions.
   * @returns The HTMLCanvasElement being used.
   * @throws Will throw an error if the canvas element is not found.
   */
  private initializeCanvas(): HTMLCanvasElement {
    const canvas = document.querySelector('#text-canvas') as HTMLCanvasElement;
    if (!canvas) {
      throw new Error('Canvas element not found');
    }
    canvas.width = this.config.width;
    canvas.height = this.config.height;
    return canvas;
  }

  /**
   * Retrieves the 2D rendering context of the canvas.
   * @returns The CanvasRenderingContext2D object.
   * @throws Will throw an error if the context cannot be obtained.
   */
  private getContext(): CanvasRenderingContext2D {
    const ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    return ctx;
  }

  /**
   * Wraps text into multiple lines to fit within a specified maximum width.
   * @param text - The full text to wrap.
   * @param maxWidth - Maximum width in pixels per line.
   * @returns An array of wrapped lines.
   */
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

  /**
   * Creates a linear gradient based on the specified gradient stops.
   * @param gradients - Array of gradient stops.
   * @returns A CanvasGradient object to be used as fill style.
   */
  private getGradient(gradients: Gradients) {
    const gradient = this.ctx.createLinearGradient(0, 0, this.config.width, this.canvas.height);
    for (const gradientColor of gradients) {
      gradient.addColorStop(gradientColor.stop, gradientColor.color);
    }
    return gradient;
  }

  /**
   * Draws the configured text on the canvas and initializes the particle effect.
   * Handles multi-line wrapping and vertical alignment.
   */
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

    const particalEffectOptions: ParticalEffectOptions = {
      shape: this.config.shape ?? 'circle',
      gap: this.config.gap,
    }

    // Create particles from the rendered text
    this.particalEffect = new ParticalEffect(this.ctx, this.config.width, this.config.height, particalEffectOptions);
  }

  /**
   * Updates the text displayed in the particle effect.
   * @param newText - The new text to be displayed.
   * If empty or null, the method will return early without making any changes.
   * @remarks
   * This method will reinitialize the text particles after updating the text.
   */
  public updateText(newText: string): void {
    if (!newText) return;
    this.particalEffect?.clearParticals();
    this.config.text = newText;
    this.initiateText();
  }

  /**
   * Updates the canvas configuration and resets the particle effect.
   * If no configuration is provided, the method returns without making any changes.
   * 
   * @param config - The new canvas configuration to apply
   * @returns void
   * 
   * @throws {Error} May throw an error if particle effect initialization fails
   */
  public updateConfig(config: CanvasConfig): void {
    if (!config) return;
    this.particalEffect?.clearParticals();
    this.config = config;
    this.initiateText();
  }

  /**
   * Clears the entire canvas.
   */
  public clearCanvas() {
    this.ctx.clearRect(0, 0, this.config.width, this.config.height);
  }

  /**
   * Renders the animated particle effect based on the drawn text.
   * Clears the canvas before each render.
   */
  public renderEffect() {
    this.clearCanvas();
    this.particalEffect?.render();
  }

  /**
   * Resizes the canvas and updates internal configuration.
   * This method also re-initializes the text and regenerates particles based on the new dimensions.
   *
   * @param width - The new width of the canvas.
   * @param height - The new height of the canvas.
   */
  public resize(width: number, height: number) {
    this.config.width = width;
    this.config.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
    this.initiateText();
  }

}
