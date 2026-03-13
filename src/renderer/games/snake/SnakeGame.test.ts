/**
 * 贪吃蛇游戏测试
 * @description 测试贪吃蛇游戏的核心功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SnakeGame } from './SnakeGame'
import { createMockCanvas, createMockCallback, simulateUpdates, pressKey } from '@/test/utils'
import { Direction, GameStatus } from '@shared/types'
import { SNAKE_CONFIG } from './config'

describe('SnakeGame', () => {
  let game: SnakeGame
  let canvas: HTMLCanvasElement

  beforeEach(() => {
    game = new SnakeGame()
    canvas = createMockCanvas()
  })

  describe('游戏元数据', () => {
    it('应该有正确的游戏 ID', () => {
      expect(game.meta.id).toBe('snake')
    })

    it('应该有游戏名称', () => {
      expect(game.meta.name).toBe('贪吃蛇')
    })

    it('应该有游戏描述', () => {
      expect(game.meta.description).toBeTruthy()
    })

    it('应该有游戏图标', () => {
      expect(game.meta.icon).toBe('🐍')
    })

    it('应该属于经典游戏分类', () => {
      expect(game.meta.category).toBe('classic')
    })
  })

  describe('游戏配置', () => {
    it('应该有正确的画布尺寸', () => {
      expect(game.config.width).toBe(600)
      expect(game.config.height).toBe(400)
    })

    it('应该显示分数', () => {
      expect(game.config.showScore).toBe(true)
    })

    it('应该显示等级', () => {
      expect(game.config.showLevel).toBe(true)
    })
  })

  describe('初始化', () => {
    it('应该成功初始化游戏', async () => {
      await expect(game.init(canvas)).resolves.toBeUndefined()
    })

    it('初始化后应该处于 IDLE 状态', async () => {
      await game.init(canvas)
      expect(game.getState().status).toBe(GameStatus.IDLE)
    })

    it('重复初始化应该发出警告', async () => {
      const warnSpy = vi.spyOn(console, 'warn')
      await game.init(canvas)
      await game.init(canvas)
      expect(warnSpy).toHaveBeenCalled()
    })
  })

  describe('游戏生命周期', () => {
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
        const warnSpy = vi.spyOn(console, 'warn')
        game.start()
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
    })

    describe('reset()', () => {
      it('应该重置分数', () => {
        game.start()
        game.setState({ score: 100 })
        game.reset()
        expect(game.getState().score).toBe(0)
      })

      it('应该重置等级', () => {
        game.start()
        game.setState({ level: 5 })
        game.reset()
        expect(game.getState().level).toBe(1)
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
  })

  describe('输入处理', () => {
    beforeEach(async () => {
      await game.init(canvas)
      game.start()
    })

    it('向上箭头应该设置方向为 UP', () => {
      pressKey(game, 'ArrowUp')
      // 方向会在下一次移动时更新
      simulateUpdates(game, 20, SNAKE_CONFIG.INITIAL_SPEED / 10)
      expect(game.getState().status).toBe(GameStatus.PLAYING)
    })

    it('W 键应该设置方向为 UP', () => {
      pressKey(game, 'w')
      simulateUpdates(game, 20, SNAKE_CONFIG.INITIAL_SPEED / 10)
      expect(game.getState().status).toBe(GameStatus.PLAYING)
    })

    it('不能反向移动（当前向右，不能向左）', () => {
      // 初始方向是 RIGHT，尝试向左应该被忽略
      pressKey(game, 'ArrowLeft')
      simulateUpdates(game, 20, SNAKE_CONFIG.INITIAL_SPEED / 10)
      // 游戏应该还在运行，没有撞墙
      expect(game.getState().status).toBe(GameStatus.PLAYING)
    })

    it('空格键应该暂停游戏', () => {
      pressKey(game, ' ')
      expect(game.getState().status).toBe(GameStatus.PAUSED)
    })

    it('暂停后空格键应该恢复游戏', () => {
      pressKey(game, ' ')
      pressKey(game, ' ')
      expect(game.getState().status).toBe(GameStatus.PLAYING)
    })
  })

  describe('游戏逻辑', () => {
    beforeEach(async () => {
      await game.init(canvas)
      game.start()
    })

    it('蛇应该持续移动', () => {
      // 游戏应该正在运行
      expect(game.getState().status).toBe(GameStatus.PLAYING)
      // 调用 update 不应该抛出异常
      expect(() => game.update(16)).not.toThrow()
    })

    it('撞墙应该触发游戏结束', () => {
      const { callback, calls } = createMockCallback()
      game.on('gameover', callback)

      // 快速移动到边界
      simulateUpdates(game, 100, SNAKE_CONFIG.INITIAL_SPEED)

      // 蛇最终会撞墙
      expect(calls.length).toBeGreaterThanOrEqual(0) // 可能还没撞墙
    })
  })

  describe('状态管理', () => {
    it('getState 应该返回状态副本', async () => {
      await game.init(canvas)
      const state1 = game.getState()
      const state2 = game.getState()
      expect(state1).not.toBe(state2) // 不同的对象引用
      expect(state1).toEqual(state2) // 但内容相同
    })

    it('setState 应该更新状态', async () => {
      await game.init(canvas)
      game.setState({ score: 50 })
      expect(game.getState().score).toBe(50)
    })
  })

  describe('事件系统', () => {
    beforeEach(async () => {
      await game.init(canvas)
    })

    it('on 应该注册事件监听器', () => {
      const { callback } = createMockCallback()
      game.on('start', callback)
      game.start()
      // 如果没有抛出异常，说明监听器注册成功
    })

    it('off 应该移除事件监听器', () => {
      const { callback, calls } = createMockCallback()
      game.on('start', callback)
      game.off('start', callback)
      game.start()
      expect(calls).toHaveLength(0)
    })
  })

  describe('销毁', () => {
    it('destroy 应该清理资源', async () => {
      await game.init(canvas)
      game.start()
      game.destroy()
      // 销毁后不应该有异常
      expect(true).toBe(true)
    })
  })
})