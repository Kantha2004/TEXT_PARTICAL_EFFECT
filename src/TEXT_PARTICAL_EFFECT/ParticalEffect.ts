import { Partical } from "./Partical";
import type { MousePosition, RGBAColor } from "./types";

/**
 * The ParticalEffect class handles creating and rendering particles based on the pixel data of a canvas.
 */
export class ParticalEffect {
  /** The 2D rendering context of the canvas where particles will be drawn. */
  readonly context: CanvasRenderingContext2D;

  /** The spacing between particles in pixels. */
  readonly gap: number;

  /** The collection of particles being managed and rendered. */
  private particals: Partical[];

  /** Object representing the mouse position and interaction radius. */
  mouse: MousePosition;

  /** The width of the canvas. */
  canvasWidth: number;

  /** The height of the canvas. */
  canvasHeight: number;

  /** Timer ID used to deactivate mouse interactions after inactivity. */
  private deactivationTimerId: number | null;

  /** Timeout (ms) to wait before disabling mouse interaction after a touch/click ends. */
  private readonly inactivityTimeout: number = 300;

  /**
   * Creates a new ParticalEffect instance.
   * @param context - The 2D context of the target canvas.
   * @param canvasWidth - The width of the canvas.
   * @param canvasHeight - The height of the canvas.
   */
  constructor(context: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
    this.context = context;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.particals = [];
    this.gap = 2;
    this.mouse = {
      radius: 20000, // A large radius for particle interaction
      mouseX: -1000,
      mouseY: -1000,
    };
    this.deactivationTimerId = null;

    // Mouse and touch event listeners for interactivity
    window.addEventListener('mousemove', (event) => {
      this.clearDeactivationTimer();
      this.mouse.mouseX = event.x;
      this.mouse.mouseY = event.y;
      this.scheduleMouseDeactivation(500);
    });

    window.addEventListener('touchmove', (event) => {
      this.clearDeactivationTimer();
      this.mouse.mouseX = event.touches?.[0].pageX;
      this.mouse.mouseY = event.touches?.[0].pageY;
      this.scheduleMouseDeactivation(500);
    });

    window.addEventListener('touchend', () => {
      this.scheduleMouseDeactivation();
    });

    window.addEventListener('touchcancel', () => {
      this.scheduleMouseDeactivation();
    });

    window.addEventListener('click', () => {
      this.scheduleMouseDeactivation();
    });

    this.convertToParticals();
  }

  /**
   * Schedules deactivation of the mouse interaction after a short timeout.
   * Useful for touch and click interactions that should fade quickly.
   */
  private scheduleMouseDeactivation(timeOut?:number) {
    this.clearDeactivationTimer();
    this.deactivationTimerId = window.setTimeout(() => {
      this.mouse.mouseX = -1000;
      this.mouse.mouseY = -1000;
    }, (timeOut ?? this.inactivityTimeout));
  }

  /**
   * Clears the existing mouse deactivation timer, preventing unintended hiding of the mouse position.
   */
  private clearDeactivationTimer() {
    if (this.deactivationTimerId) {
      clearTimeout(this.deactivationTimerId);
    }
  }

  /**
   * Converts canvas image data into particles based on non-transparent pixels.
   * Each visible pixel becomes a particle with its RGBA color.
   */
  public convertToParticals() {
    this.particals = [];

    const pixels = this.context.getImageData(0, 0, this.canvasWidth, this.canvasHeight).data;

    for (let y = 0; y < this.canvasHeight; y += this.gap) {
      for (let x = 0; x < this.canvasWidth; x += this.gap) {
        const index = (y * this.canvasWidth + x) * 4;
        const alpha = pixels[index + 3];

        // Skip transparent pixels
        if (alpha <= 0) continue;

        const red = pixels[index];
        const green = pixels[index + 1];
        const blue = pixels[index + 2];

        const rgbaColor: RGBAColor = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
        this.particals.push(new Partical(this, x, y, rgbaColor));
      }
    }
  }

  /**
   * Updates and renders all particles on the canvas.
   * Should be called within the animation loop.
   */
  public render() {
    this.particals.forEach((partical) => {
      partical.update();
      partical.draw();
    });
  }
}
