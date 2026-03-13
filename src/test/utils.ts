/**
 * 测试工具函数
 * @description 提供测试中常用的辅助函数和模拟对象
 */

import type { IGame, GameEventType, GameEventCallback } from '@/core/interfaces/IGame'

/**
 * 创建模拟的 Canvas 元素
 */
export function createMockCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 600
  canvas.height = 400
  return canvas
}

/**
 * 创建模拟的游戏事件回调
 */
export function createMockCallback(): {
  callback: GameEventCallback
  calls: Array<{ event: GameEventType; data?: unknown }>
} {
  const calls: Array<{ event: GameEventType; data?: unknown }> = []
  const callback: GameEventCallback = (event, data) => {
    calls.push({ event, data })
  }
  return { callback, calls }
}

/**
 * 等待指定时间
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 模拟多次游戏更新
 */
export function simulateUpdates(game: IGame, count: number, deltaTime = 16): void {
  for (let i = 0; i < count; i++) {
    game.update(deltaTime)
  }
}

/**
 * 触发键盘事件
 */
export function pressKey(game: IGame, key: string): void {
  game.handleKeyDown(key)
}

/**
 * 释放键盘事件
 */
export function releaseKey(game: IGame, key: string): void {
  game.handleKeyUp(key)
}