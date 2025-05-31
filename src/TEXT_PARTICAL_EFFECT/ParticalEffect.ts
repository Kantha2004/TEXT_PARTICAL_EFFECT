import { Partical } from "./Partical";
import type { MousePosition, RGBAColor } from "./types";

/**
 * The ParticalEffect class handles creating and rendering particles based on the pixel data of a canvas.
 */
export class ParticalEffect {
  /**
   * The 2D rendering context of the canvas where particles will be drawn.
   */
  readonly context: CanvasRenderingContext2D;

  /**
   * The spacing between particles in pixels.
   */
  readonly gap: number;

  /**
   * The collection of particles being managed and rendered.
   */
  private particals: Partical[];

  /**
   * Object representing the mouse position and interaction radius.
   */
  mouse: MousePosition;

  /**
   * The width of the canvas.
   */
  canvasWidth: number;

  /**
   * The height of the canvas.
   */
  canvasHeight: number;

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
    this.gap = 4;
    this.mouse = {
      radius: 20000, // A large radius for particle interaction
      mouseX: 0,
      mouseY: 0
    };

    // Track mouse movement for interactive particle behavior
    window.addEventListener('mousemove', (event) => {
      this.mouse.mouseX = event.x;
      this.mouse.mouseY = event.y;
    });

    // Initialize particles from current canvas image data
    this.convertToParticals();
  }

  /**
   * Converts canvas image data into individual particles based on non-transparent pixels.
   * This method reads RGBA pixel data and creates a particle for each visible point.
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
   * Should be called inside the animation loop to animate the effect.
   */
  public render() {
    this.particals.forEach(partical => {
      partical.update();
      partical.draw();
    });
  }
}
