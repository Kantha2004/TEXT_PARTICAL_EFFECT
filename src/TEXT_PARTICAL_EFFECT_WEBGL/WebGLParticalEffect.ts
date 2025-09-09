import { WebGLPartical } from "./WebGLPartical";
import { WebGLUtils } from "./Webgl-utils";
import { vertexShaderSource, fragmentShaderSource } from "./Shaders";
import type { MousePosition, ParticleShape, RGBAColor } from "./types";

export interface WebGLParticalEffectOptions {
  shape?: ParticleShape;
  gap?: number;
}

export class WebGLParticalEffect {
  readonly gl: WebGLRenderingContext;
  readonly gap: number;
  private particals: WebGLPartical[];
  mouse: MousePosition;
  canvasWidth: number;
  canvasHeight: number;
  private deactivationTimerId: number | null;
  private readonly inactivityTimeout: number = 300;
  shape: ParticleShape;

  // WebGL specific properties
  private program: WebGLProgram | null = null;
  private positionBuffer: WebGLBuffer | null = null;
  private colorBuffer: WebGLBuffer | null = null;
  private sizeBuffer: WebGLBuffer | null = null;
  private shapeBuffer: WebGLBuffer | null = null;
  
  // Attribute locations
  private positionLocation: number = -1;
  private colorLocation: number = -1;
  private sizeLocation: number = -1;
  private shapeLocation: number = -1;
  private resolutionLocation: WebGLUniformLocation | null = null;

  constructor(
    gl: WebGLRenderingContext,
    canvasWidth: number,
    canvasHeight: number,
    options: WebGLParticalEffectOptions = {}
  ) {
    this.gl = gl;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.particals = [];
    this.gap = options.gap ?? 4;
    this.mouse = {
      radius: 20000,
      mouseX: -1000,
      mouseY: -1000,
    };
    this.deactivationTimerId = null;
    this.shape = options.shape ?? 'circle';

    this.initWebGL();
    this.setupMouseListeners();
  }

  private initWebGL() {
    const vertexShader = WebGLUtils.createShader(this.gl, this.gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = WebGLUtils.createShader(this.gl, this.gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    if (!vertexShader || !fragmentShader) {
      throw new Error('Failed to create shaders');
    }

    this.program = WebGLUtils.createProgram(this.gl, vertexShader, fragmentShader);
    if (!this.program) {
      throw new Error('Failed to create WebGL program');
    }

    // Get attribute and uniform locations
    this.positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
    this.colorLocation = this.gl.getAttribLocation(this.program, 'a_color');
    this.sizeLocation = this.gl.getAttribLocation(this.program, 'a_size');
    this.shapeLocation = this.gl.getAttribLocation(this.program, 'a_shape');
    this.resolutionLocation = this.gl.getUniformLocation(this.program, 'u_resolution');

    // Create buffers
    this.positionBuffer = this.gl.createBuffer();
    this.colorBuffer = this.gl.createBuffer();
    this.sizeBuffer = this.gl.createBuffer();
    this.shapeBuffer = this.gl.createBuffer();

    // Enable blending for transparency
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
  }

  private setupMouseListeners() {
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

    window.addEventListener('touchend', () => this.scheduleMouseDeactivation());
    window.addEventListener('touchcancel', () => this.scheduleMouseDeactivation());
    window.addEventListener('click', () => this.scheduleMouseDeactivation());
  }

  private scheduleMouseDeactivation(timeout?: number) {
    this.clearDeactivationTimer();
    this.deactivationTimerId = window.setTimeout(() => {
      this.mouse.mouseX = -1000;
      this.mouse.mouseY = -1000;
    }, timeout ?? this.inactivityTimeout);
  }

  private clearDeactivationTimer() {
    if (this.deactivationTimerId) {
      clearTimeout(this.deactivationTimerId);
    }
  }

  private getShapeIndex(shape: ParticleShape): number {
    switch (shape) {
      case 'circle': return 0;
      case 'square': return 1;
      case 'triangle': return 2;
      case 'star': return 3;
      default: return 0;
    }
  }

  public convertToParticals(context: CanvasRenderingContext2D) {
    this.particals = [];
    const shapeIndex = this.getShapeIndex(this.shape);

    const pixels = context.getImageData(0, 0, this.canvasWidth, this.canvasHeight).data;

    for (let y = 0; y < this.canvasHeight; y += this.gap) {
      for (let x = 0; x < this.canvasWidth; x += this.gap) {
        const index = (y * this.canvasWidth + x) * 4;
        const alpha = pixels[index + 3];

        if (alpha <= 0) continue;

        const red = pixels[index];
        const green = pixels[index + 1];
        const blue = pixels[index + 2];

        const rgbaColor: RGBAColor = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
        this.particals.push(new WebGLPartical(this, x, y, rgbaColor, shapeIndex));
      }
    }
  }

  public clearCanvas() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }

  public clearParticals() {
    this.particals = [];
  }

  public render() {
    if (!this.program || this.particals.length === 0) return;

    // Update all particles
    this.particals.forEach(particle => particle.update());

    // Prepare data arrays
    const positions = new Float32Array(this.particals.length * 2);
    const colors = new Float32Array(this.particals.length * 4);
    const sizes = new Float32Array(this.particals.length);
    const shapes = new Float32Array(this.particals.length);

    this.particals.forEach((particle, i) => {
      const posIndex = i * 2;
      const colorIndex = i * 4;

      positions[posIndex] = particle.x;
      positions[posIndex + 1] = particle.y;

      colors[colorIndex] = particle.color[0];
      colors[colorIndex + 1] = particle.color[1];
      colors[colorIndex + 2] = particle.color[2];
      colors[colorIndex + 3] = particle.color[3];

      sizes[i] = particle.size;
      shapes[i] = particle.shapeIndex;
    });

    // Set viewport and clear
    this.gl.viewport(0, 0, this.canvasWidth, this.canvasHeight);
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    // Use the shader program
    this.gl.useProgram(this.program);

    // Set uniforms
    this.gl.uniform2f(this.resolutionLocation, this.canvasWidth, this.canvasHeight);

    // Bind and set position attribute
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.DYNAMIC_DRAW);
    this.gl.enableVertexAttribArray(this.positionLocation);
    this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);

    // Bind and set color attribute
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, colors, this.gl.DYNAMIC_DRAW);
    this.gl.enableVertexAttribArray(this.colorLocation);
    this.gl.vertexAttribPointer(this.colorLocation, 4, this.gl.FLOAT, false, 0, 0);

    // Bind and set size attribute
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.sizeBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, sizes, this.gl.DYNAMIC_DRAW);
    this.gl.enableVertexAttribArray(this.sizeLocation);
    this.gl.vertexAttribPointer(this.sizeLocation, 1, this.gl.FLOAT, false, 0, 0);

    // Bind and set shape attribute
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.shapeBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, shapes, this.gl.DYNAMIC_DRAW);
    this.gl.enableVertexAttribArray(this.shapeLocation);
    this.gl.vertexAttribPointer(this.shapeLocation, 1, this.gl.FLOAT, false, 0, 0);

    // Draw particles as points
    this.gl.drawArrays(this.gl.POINTS, 0, this.particals.length);
  }
}
