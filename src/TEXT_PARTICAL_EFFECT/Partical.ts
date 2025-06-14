/**
 * @author Kanthakumar
 *
 * This particle effect is a customized and enhanced version of an original concept 
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


import type { ParticalEffect } from "./ParticalEffect";
import type { RGBAColor } from "./types";

/**
 * Represents a single particle in the particle effect system.
 */
export class Partical {
  /**
   * Reference to the effect managing this particle.
   */
  effect: ParticalEffect;

  /**
   * Color of the particle in RGBA format.
   */
  color: RGBAColor;

  /**
   * Current x position of the particle on the canvas.
   */
  x: number;

  /**
   * Current y position of the particle on the canvas.
   */
  y: number;

  /**
   * The original x position of the particle.
   */
  originalX: number;

  /**
   * The original y position of the particle.
   */
  originalY: number;

  /**
   * Size of the particle (width and height of the square shape).
   */
  size: number;

  /**
   * Distance between the particle and the mouse along the x-axis.
   */
  dx: number;

  /**
   * Distance between the particle and the mouse along the y-axis.
   */
  dy: number;

  /**
   * Velocity of the particle along the x-axis.
   */
  vx: number;

  /**
   * Velocity of the particle along the y-axis.
   */
  vy: number;

  /**
   * Repulsion force applied by the mouse to the particle.
   */
  force: number;

  /**
   * Angle between the particle and the mouse pointer in radians.
   */
  angle: number;

  /**
   * Squared distance between the particle and the mouse.
   */
  distance: number;

  /**
   * Friction factor reducing the velocity over time.
   */
  friction: number;

  /**
   * Easing factor to smoothly return the particle to its original position.
   */
  ease: number;

  /**
   * Constructs a new Partical instance.
   * @param effect - The particle effect manager.
   * @param x - The initial x-coordinate of the particle.
   * @param y - The initial y-coordinate of the particle.
   * @param color - The color of the particle in RGBA format.
   */
  constructor(effect: ParticalEffect, x: number, y: number, color: RGBAColor) {
    this.effect = effect;
    this.color = color;
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
    this.friction = (Math.random() * 0.4) + 0.18;
    this.ease = (Math.random() * 0.1) + 0.03;
  }

  /**
   * Draws the particle on the canvas using its current position and color.
   */
  public draw() {
    this.effect.context.fillStyle = this.color;

    switch (this.effect.shape) {
      case 'square':
        this.drawSquare();
        break;
      case 'triangle':
        this.drawTriangle();
        break;
      case 'star':
        this.drawStar();
        break;
      case 'circle':
      default:
        this.drawCircle();
        break;
    }
  }


  /**
   * Draws the particle as a filled circle.
   */
  private drawCircle() {
    const ctx = this.effect.context;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Draws the particle as a filled square.
   */
  private drawSquare() {
    this.effect.context.fillRect(this.x, this.y, this.size, this.size);
  }

  /**
   * Draws the particle as a filled upward-pointing triangle.
   */
  private drawTriangle() {
    const ctx = this.effect.context;
    const half = this.size / 2;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - half);               // Top point
    ctx.lineTo(this.x + half, this.y + half);        // Bottom right
    ctx.lineTo(this.x - half, this.y + half);        // Bottom left
    ctx.closePath();
    ctx.fill();
  }

  /**
   * Draws the particle as a 5-pointed star.
   */
  private drawStar() {
    const ctx = this.effect.context;
    const spikes = 5;
    const outerRadius = this.size / 2;
    const innerRadius = outerRadius / 2;
    let rot = Math.PI / 2 * 3;
    let x = this.x;
    let y = this.y;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(x, y - outerRadius);

    for (let i = 0; i < spikes; i++) {
      x = this.x + Math.cos(rot) * outerRadius;
      y = this.y + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = this.x + Math.cos(rot) * innerRadius;
      y = this.y + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }

    ctx.lineTo(this.x, this.y - outerRadius);
    ctx.closePath();
    ctx.fill();
  }



  /**
   * Updates the particle's position and velocity based on mouse interaction
   * and returns it gradually to its original position using easing and friction.
   */
  public update() {
    this.dx = this.effect.mouse.mouseX - this.x;
    this.dy = this.effect.mouse.mouseY - this.y;
    this.distance = (this.dx * this.dx) + (this.dy * this.dy);
    this.force = -this.effect.mouse.radius / this.distance;

    if (this.distance < this.effect.mouse.radius) {
      this.angle = Math.atan2(this.dy, this.dx);
      this.vx += this.force * Math.cos(this.angle);
      this.vy += this.force * Math.sin(this.angle);
    }

    this.x += (this.vx *= this.friction) + (this.originalX - this.x) * this.ease;
    this.y += (this.vy *= this.friction) + (this.originalY - this.y) * this.ease;
  }
}
