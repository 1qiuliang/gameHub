/**
 * 测试环境设置
 * @description 配置测试环境和全局模拟
 */

import '@testing-library/jest-dom'

// 模拟 Canvas 和 CanvasRenderingContext2D
class MockCanvasRenderingContext2D {
  fillStyle = ''
  strokeStyle = ''
  lineWidth = 1
  globalAlpha = 1
  font = ''
  textAlign = 'left'
  textBaseline = 'alphabetic'
  shadowColor = ''
  shadowBlur = 0
  shadowOffsetX = 0
  shadowOffsetY = 0

  fillRect() {}
  strokeRect() {}
  clearRect() {}
  beginPath() {}
  closePath() {}
  moveTo() {}
  lineTo() {}
  arc() {}
  ellipse() {}
  fill() {}
  stroke() {}
  save() {}
  restore() {}
  translate() {}
  scale() {}
  rotate() {}
  drawImage() {}
  measureText() {
    return { width: 0 }
  }
  fillText() {}
  strokeText() {}
  roundRect() {}
  createLinearGradient() {
    return { addColorStop: () => {} }
  }
  createRadialGradient() {
    return { addColorStop: () => {} }
  }
  createPattern() {
    return null
  }
  clip() {}
  setTransform() {}
  resetTransform() {}
  getTransform() {
    return {} as DOMMatrix
  }
  getImageData() {
    return { data: new Uint8ClampedArray() } as ImageData
  }
  putImageData() {}
  createImageData() {
    return {} as ImageData
  }
}

// 模拟 HTMLCanvasElement
HTMLCanvasElement.prototype.getContext = function (
  contextId: string
): RenderingContext | null {
  if (contextId === '2d') {
    return new MockCanvasRenderingContext2D() as unknown as CanvasRenderingContext2D
  }
  return null
}

// 模拟 requestAnimationFrame
global.requestAnimationFrame = (callback: FrameRequestCallback): number => {
  return setTimeout(() => callback(performance.now()), 16) as unknown as number
}

// 模拟 cancelAnimationFrame
global.cancelAnimationFrame = (id: number): void => {
  clearTimeout(id)
}

// 模拟 performance.now()
if (!global.performance) {
  global.performance = {
    now: () => Date.now(),
  } as Performance
}

// 模拟 window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})