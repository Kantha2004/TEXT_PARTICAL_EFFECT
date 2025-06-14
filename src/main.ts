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


import { TextCanvas } from "./TEXT_PARTICAL_EFFECT/TextCanvas";
import type { CanvasConfig, Gradients } from "./TEXT_PARTICAL_EFFECT/types";
import { debounce } from "./utils/debounce";

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
  fontFamily: 'Rowdies',
  shape: 'circle',
  gap: 2,
  gradients,
};

const setupInputBox = (functionToCall: (text: string) => void) => {
  const inputBox = document.querySelector('#input-text-canvas') as HTMLInputElement;
  const handleInput = debounce((evt: Event) => {
    functionToCall((evt.target as HTMLInputElement).value);
  }, 400);
  inputBox?.addEventListener('input', handleInput);
};

async function init() {
  try {
    // Wait for all fonts to be loaded
    await document.fonts.load(`${config.fontSize}px ${config.fontFamily}`);
    await document.fonts.ready;
    const textCanvas = new TextCanvas(config);
    textCanvas.initiateText();
    setupInputBox((text) => textCanvas.updateText(text));
    const animate = () => {
      textCanvas.renderEffect();
      requestAnimationFrame(animate);
    };
    window.addEventListener('resize', () => {
      textCanvas.resize(window.innerWidth, window.innerHeight);
    });

    animate();

  } catch (error) {
    console.error(error);
  }
}

init();

