/**
 * @Kanthakumar Here
 * I made a few changes to this effect from Frank's Laboratory YouTube channel.
 * Special thanks to Frank's Laboratory YouTube channel.
 * Inspired by: https://www.youtube.com/watch?v=2F2t1RJoGt8
 * If you like it, go watch and learn how to create it.
 */

import { TextCanvas } from "./TEXT_PARTICAL_EFFECT/TextCanvas";
import type { CanvasConfig, Gradients } from "./TEXT_PARTICAL_EFFECT/types";

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

