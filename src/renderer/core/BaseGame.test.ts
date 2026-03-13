/**
 * BaseGame 基类测试
 * @description 测试游戏基类的核心功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BaseGame } from './BaseGame'
import type { IGame, GameMeta, GameConfig } from './interfaces/IGame'
import { GameStatus } from '@shared/types'
import { createMockCanvas, createMockCallback } from '@/test/utils'

// 创建一个具体的测试游戏类
class TestGame extends BaseGame implements IGame {
  readonly meta: GameMeta = {
    id: 'test-game',
    name: 'Test Game',
    description: 'A test game for unit testing',
    icon: '🎮',
    category: 'classic',
    author: 'Test',
    version: '1.0.0',
  }

  readonly config: GameConfig = {
    width: 400,
    height: 300,
    showScore: true,
    showLevel: false,
    showLives: false,
  }

  updateCalled = false
  renderCalled = false
  keyDownCalled = false
  keyUpCalled = false

  update(_deltaTime: number): void {
    this.updateCalled = true
  }

  render(_ctx: CanvasRenderingContext2D): void {
    this.renderCalled = true
  }

  handleKeyDown(_key: string): void {
    this.keyDownCalled = true
  }

  handleKeyUp(_key: string): void {
    this.keyUpCalled = true
  }
}

describe('BaseGame', () => {
  let game: TestGame
  let canvas: HTMLCanvasElement

  beforeEach(() => {
    game = new TestGame()
    canvas = createMockCanvas()
  })

  describe('初始化', () => {
    it('应该有正确的元数据', () => {
      expect(game.meta.id).toBe('test-game')
      expect(game.meta.name).toBe('Test Game')
    })

    it('应该有正确的配置', () => {
      expect(game.config.width).toBe(400)
      expect(game.config.height).toBe(300)
    })

    it('初始化后应该处于 IDLE 状态', async () => {
      await game.init(canvas)
      expect(game.getState().status).toBe(GameStatus.IDLE)
    })

    it('初始化后应该设置 _initialized 标志', async () => {
      await game.init(canvas)
      // 再次初始化应该警告
      const warnSpy = vi.spyOn(console, 'warn')
      await game.init(canvas)
      expect(warnSpy).toHaveBeenCalled()
    })
  })

  describe('生命周期', () => {
    beforeEach(async () => {
      await game.init(canvas)
    })

    describe('start()', () => {
      it('应该将状态变为 PLAYING', () => {
        game.start()
        expect(game.getState().status).toBe(GameStatus.PLAYING)
      })

      it('应该触发 start 事件', () => {
        const { callback, calls } = createMockCallback()
        game.on('start', callback)
        game.start()
        expect(calls).toHaveLength(1)
        expect(calls[0].event).toBe('start')
      })

      it('重复开始应该被忽略', () => {
        game.start()
        const warnSpy = vi.spyOn(console, 'warn')
        game.start()
        expect(warnSpy).toHaveBeenCalled()
      })
    })

    describe('pause()', () => {
      it('应该将状态变为 PAUSED', () => {
        game.start()
        game.pause()
        expect(game.getState().status).toBe(GameStatus.PAUSED)
      })

      it('应该触发 pause 事件', () => {
        const { callback, calls } = createMockCallback()
        game.on('pause', callback)
        game.start()
        game.pause()
        expect(calls).toHaveLength(1)
        expect(calls[0].event).toBe('pause')
      })

      it('非 PLAYING 状态下暂停应该被忽略', () => {
        game.pause()
        expect(game.getState().status).toBe(GameStatus.IDLE)
      })
    })

    describe('resume()', () => {
      it('应该将状态从 PAUSED 变为 PLAYING', () => {
        game.start()
        game.pause()
        game.resume()
        expect(game.getState().status).toBe(GameStatus.PLAYING)
      })

      it('应该触发 resume 事件', () => {
        const { callback, calls } = createMockCallback()
        game.on('resume', callback)
        game.start()
        game.pause()
        game.resume()
        expect(calls).toHaveLength(1)
        expect(calls[0].event).toBe('resume')
      })

      it('非 PAUSED 状态下恢复应该被忽略', () => {
        game.start()
        game.resume()
        expect(game.getState().status).toBe(GameStatus.PLAYING)
      })
    })

    describe('reset()', () => {
      it('应该重置分数', () => {
        game.start()
        game.setState({ score: 100 })
        game.reset()
        expect(game.getState().score).toBe(0)
      })

      it('应该保留最高分', () => {
        game.start()
        game.setState({ highScore: 500 })
        game.reset()
        expect(game.getState().highScore).toBe(500)
      })

      it('应该将状态变为 IDLE', () => {
        game.start()
        game.reset()
        expect(game.getState().status).toBe(GameStatus.IDLE)
      })

      it('应该触发 reset 事件', () => {
        const { callback, calls } = createMockCallback()
        game.on('reset', callback)
        game.reset()
        expect(calls).toHaveLength(1)
        expect(calls[0].event).toBe('reset')
      })
    })

    describe('destroy()', () => {
      it('应该清理资源', () => {
        game.start()
        game.destroy()
        // 销毁后不应该有异常
        expect(true).toBe(true)
      })
    })
  })

  describe('状态管理', () => {
    beforeEach(async () => {
      await game.init(canvas)
    })

    it('getState 应该返回状态副本', () => {
      const state1 = game.getState()
      const state2 = game.getState()
      expect(state1).not.toBe(state2)
      expect(state1).toEqual(state2)
    })

    it('setState 应该更新状态', () => {
      game.setState({ score: 50 })
      expect(game.getState().score).toBe(50)
    })

    it('setState 应该支持部分更新', () => {
      game.setState({ score: 100 })
      game.setState({ level: 5 })
      expect(game.getState().score).toBe(100)
      expect(game.getState().level).toBe(5)
    })
  })

  describe('事件系统', () => {
    beforeEach(async () => {
      await game.init(canvas)
    })

    it('on 应该注册事件监听器', () => {
      const { callback, calls } = createMockCallback()
      game.on('start', callback)
      game.start()
      expect(calls).toHaveLength(1)
    })

    it('off 应该移除事件监听器', () => {
      const { callback, calls } = createMockCallback()
      game.on('start', callback)
      game.off('start', callback)
      game.start()
      expect(calls).toHaveLength(0)
    })

    it('emit 应该调用所有监听器', () => {
      const { callback: cb1, calls: calls1 } = createMockCallback()
      const { callback: cb2, calls: calls2 } = createMockCallback()
      game.on('start', cb1)
      game.on('start', cb2)
      game.start()
      expect(calls1).toHaveLength(1)
      expect(calls2).toHaveLength(1)
    })

    it('destroy 应该清除所有事件监听器', () => {
      const { callback, calls } = createMockCallback()
      game.on('start', callback)
      game.destroy()
      game.start() // 这应该不会触发事件
      expect(calls).toHaveLength(0)
    })
  })

  describe('游戏结束', () => {
    beforeEach(async () => {
      await game.init(canvas)
      game.start()
    })

    it('gameOver 应该更新最高分', () => {
      game.setState({ score: 100, highScore: 50 })
      // 模拟游戏结束
      ;(game as unknown as { gameOver: () => void }).gameOver()
      expect(game.getState().highScore).toBe(100)
    })

    it('gameOver 应该将状态变为 GAME_OVER', () => {
      ;(game as unknown as { gameOver: () => void }).gameOver()
      expect(game.getState().status).toBe(GameStatus.GAME_OVER)
    })

    it('gameOver 应该触发 gameover 事件', () => {
      const { callback, calls } = createMockCallback()
      game.on('gameover', callback)
      ;(game as unknown as { gameOver: () => void }).gameOver()
      expect(calls).toHaveLength(1)
      expect(calls[0].event).toBe('gameover')
    })
  })
})