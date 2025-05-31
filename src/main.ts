import './style.css';

type HexColor = `#${string}`;

type RGBAColor = `rgba(${number}, ${number}, ${number}, ${number})`;

type Gradients = {
  stop: number;
  color: HexColor | 'red' | 'blue' | 'green' | 'yellow' | 'orange' | 'purple' | 'black' | 'white' | 'orangered';
}[];

type MousePosition = {
  mouseX: number;
  mouseY: number;
  radius: number;
}

// interfaces
interface CanvasConfig {
  width: number;
  height: number;
  fontSize: number;
  text: string;
  maxWidthRatio: number;
  gradients?: Gradients;
}


class Partical {
  effect: Effect;
  color: RGBAColor;
  x: number; // x is current x position of the partical
  y: number; // y is current y position of the partical
  originalX: number; // originalX is the x position of the partical in canvas
  originalY: number; // originalY is the y position of the partical in canvas
  size: number; // determine the size of the patical
  dx: number; // dx stands for distance between the mouse x and the partical
  dy: number; // dy stands for distance between the mouse y and the partical
  vx: number; // vx stands for the velocity(speed) of the partical in x axis
  vy: number; // vy stands for the velocity(speed) of the partical in y axis
  force: number;
  angle: number;
  distance: number;
  friction: number;
  ease: number;

  constructor(effect: Effect, x: number, y: number, color: RGBAColor) {
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
    this.friction = (Math.random() * 0.6) + 0.15;
    this.ease = (Math.random() * 0.1) + 0.005;
  }

  public draw() {
    this.effect.context.fillStyle = this.color;
    this.effect.context.fillRect(this.x, this.y, this.size, this.size);
  }

  public update() {
    this.dx = this.effect.mouse.mouseX - this.x;
    this.dy = this.effect.mouse.mouseY - this.y;
    this.distance = (this.dx * this.dx) + (this.dy * this.dy);
    this.force = -this.effect.mouse.radius / this.distance;
    if(this.distance < this.effect.mouse.radius) {
      this.angle = Math.atan2(this.dy, this.dx);
      this.vx += this.force * Math.cos(this.angle);
      this.vy += this.force * Math.sin(this.angle);
    }
    this.x += (this.vx *= this.friction) + (this.originalX - this.x) * this.ease;
    this.y += (this.vy *= this.friction) + (this.originalY - this.y) * this.ease; 
  }
}

class Effect {

  readonly context: CanvasRenderingContext2D;
  readonly gap: number;
  private particals: Partical[];
  mouse: MousePosition;
  canvasWidth: number;
  canvasHeight: number;
  constructor(context: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
    this.context = context;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.particals = [];
    this.gap = 4;
    this.mouse = {
      radius: 20000,
      mouseX: 0,
      mouseY: 0
    };
    window.addEventListener('mousemove', (event) => {
      this.mouse.mouseX = event.x;
      this.mouse.mouseY = event.y;
    });
    this.convertToParticals();
  }

  public convertToParticals() {
    this.particals = [];
    const pixels = this.context.getImageData(0, 0, this.canvasWidth, this.canvasHeight).data;
    for (let y = 0; y < this.canvasHeight; y += this.gap) {
      for (let x = 0; x < this.canvasWidth; x += this.gap) {
        const index = (y * this.canvasWidth + x) * 4;
        const alpha = pixels[index + 3];
        if (alpha <= 0) continue;
        const red = pixels[index];
        const green = pixels[index + 1];
        const blue = pixels[index + 2];
        const rgbaColor: RGBAColor = `rgba(${red}, ${green}, ${blue}, ${alpha})`
        this.particals.push(new Partical(this, x, y, rgbaColor));
      }
    }
  };

  public render() {
    this.particals.forEach(partical => {
      partical.update();
      partical.draw();
    })
  }
}

class TextCanvas {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly config: CanvasConfig;
  private textEffect: Effect | null;

  constructor(config: CanvasConfig) {
    this.config = config;
    this.canvas = this.initializeCanvas();
    this.ctx = this.getContext();
    this.textEffect = null
  }

  private initializeCanvas(): HTMLCanvasElement {
    const canvas = document.querySelector('#text-canvas') as HTMLCanvasElement;
    if (!canvas) {
      throw new Error('Canvas element not found');
    }
    canvas.width = this.config.width;
    canvas.height = this.config.height;
    return canvas;
  }

  private getContext(): CanvasRenderingContext2D {
    const ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    return ctx;
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
      gradient.addColorStop(gradientColor.stop, gradientColor.color)
    }
    return gradient;
  }

  public initiateText(): void {
    const { width, height, fontSize, text, maxWidthRatio } = this.config;

    this.ctx.font = `${fontSize}px Bangers`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = this.config.gradients?.length ? this.getGradient(this.config.gradients)
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
    this.textEffect = new Effect(this.ctx, this.config.width, this.config.height);
  };

  public clearCanvas() {
    this.ctx.clearRect(0, 0, this.config.width, this.config.height);
  } 

  public renderEffect() {
    this.clearCanvas();
    this.textEffect?.render();
  }
}

const gradients: Gradients = [
  {
    stop: 0.3, color: 'purple'
  },
  {
    stop: 0.6, color: 'orangered'
  },
  {
    stop: 0.9, color: 'green'
  }
]

const config: CanvasConfig = {
  width: window.innerWidth,
  height: window.innerHeight,
  fontSize: 200,
  text: 'Hello World!',
  maxWidthRatio: 0.8,
  gradients
};

try {
  const textCanvas = new TextCanvas(config);
  textCanvas.initiateText();
  const animate = () => {
    textCanvas.renderEffect();
    requestAnimationFrame(animate);
  };
  animate()
} catch (error) {
  console.error(error);
}

