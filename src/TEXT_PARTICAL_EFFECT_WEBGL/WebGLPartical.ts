import type { WebGLParticalEffect } from "./WebGLParticalEffect";
import type { RGBAColor } from "./types";

export class WebGLPartical {
  effect: WebGLParticalEffect;
  color: [number, number, number, number]; // RGBA as normalized values
  x: number;
  y: number;
  originalX: number;
  originalY: number;
  size: number;
  dx: number;
  dy: number;
  vx: number;
  vy: number;
  force: number;
  angle: number;
  distance: number;
  friction: number;
  ease: number;
  shapeIndex: number; // 0=circle, 1=square, 2=triangle, 3=star

  constructor(effect: WebGLParticalEffect, x: number, y: number, color: RGBAColor, shapeIndex: number) {
    this.effect = effect;
    this.color = this.parseRGBAColor(color);
    this.x = Math.random() * this.effect.canvasWidth;
    this.y = this.effect.canvasHeight;
    this.originalX = x;
    this.originalY = y;
    this.size = this.effect.gap;
    this.dx = 0;
    this.dy = 0;
    this.vx = 0;
    this.vy = 0;
    this.force = 0;
    this.angle = 0;
    this.distance = 0;
    this.friction = (Math.random() * 0.4) + 0.25;
    this.ease = (Math.random() * 0.2) + 0.08;
    this.shapeIndex = shapeIndex;
  }

  private parseRGBAColor(rgbaString: RGBAColor): [number, number, number, number] {
    const match = rgbaString.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      return [
        parseInt(match[1]) / 255,
        parseInt(match[2]) / 255,
        parseInt(match[3]) / 255,
        parseInt(match[4]) / 255
      ];
    }
    return [1, 1, 1, 1]; // Default white
  }

  public update() {
    this.dx = this.effect.mouse.mouseX - this.x;
    this.dy = this.effect.mouse.mouseY - this.y;
    this.distance = (this.dx * this.dx) + (this.dy * this.dy);
    this.force = Math.min(-10, Math.max(-120, -this.effect.mouse.radius / this.distance));

    if (this.distance < this.effect.mouse.radius) {
      this.angle = Math.atan2(this.dy, this.dx);
      this.vx += this.force * Math.cos(this.angle);
      this.vy += this.force * Math.sin(this.angle);
    }

    this.x += (this.vx *= this.friction) + (this.originalX - this.x) * this.ease;
    this.y += (this.vy *= this.friction) + (this.originalY - this.y) * this.ease;
  }
}
