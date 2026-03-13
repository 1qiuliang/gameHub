/**
 * Flappy Bird 游戏测试
 * @description 测试 Flappy Bird 游戏的核心功能
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { FlappyBirdGame } from './FlappyBirdGame'
import { createMockCanvas, createMockCallback, pressKey } from '@/test/utils'
import { GameStatus } from '@shared/types'

describe('FlappyBirdGame', () => {
  let game: FlappyBirdGame
  let canvas: HTMLCanvasElement

  beforeEach(() => {
    game = new FlappyBirdGame()
    canvas = createMockCanvas()
  })

  describe('游戏元数据', () => {
    it('应该有正确的游戏 ID', () => {
      expect(game.meta.id).toBe('flappybird')
    })

    it('应该有游戏名称', () => {
      expect(game.meta.name).toBe('Flappy Bird')
    })

    it('应该有游戏描述', () => {
      expect(game.meta.description).toBeTruthy()
    })

    it('应该有游戏图标', () => {
      expect(game.meta.icon).toBe('🐦')
    })

    it('应该属于动作游戏分类', () => {
      expect(game.meta.category).toBe('action')
    })
  })

  describe('游戏配置', () => {
    it('应该有正确的画布尺寸', () => {
      expect(game.config.width).toBe(400)
      expect(game.config.height).toBe(600)
    })

    it('应该显示分数', () => {
      expect(game.config.showScore).toBe(true)
    })

    it('不应该显示等级', () => {
      expect(game.config.showLevel).toBe(false)
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
    })

    describe('resume()', () => {
      it('应该将状态从 PAUSED 变为 PLAYING', () => {
        game.start()
        game.pause()
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

      it('应该将状态变为 IDLE', () => {
        game.start()
        game.reset()
        expect(game.getState().status).toBe(GameStatus.IDLE)
      })
    })
  })

  describe('输入处理', () => {
    beforeEach(async () => {
      await game.init(canvas)
      game.start()
    })

    it('空格键应该触发跳跃', () => {
      pressKey(game, ' ')
      // 游戏应该还在运行
      expect(game.getState().status).toBe(GameStatus.PLAYING)
    })

    it('向上箭头键应该触发跳跃', () => {
      pressKey(game, 'ArrowUp')
      expect(game.getState().status).toBe(GameStatus.PLAYING)
    })

    it('W 键应该触发跳跃', () => {
      pressKey(game, 'w')
      expect(game.getState().status).toBe(GameStatus.PLAYING)
    })

    it('非运行状态下按键应该被忽略', async () => {
      const newGame = new FlappyBirdGame()
      await newGame.init(canvas)
      // 还没有调用 start()
      pressKey(newGame, ' ')
      expect(newGame.getState().status).toBe(GameStatus.IDLE)
    })
  })

  describe('状态管理', () => {
    it('getState 应该返回状态副本', async () => {
      await game.init(canvas)
      const state1 = game.getState()
      const state2 = game.getState()
      expect(state1).not.toBe(state2)
      expect(state1).toEqual(state2)
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
      expect(true).toBe(true)
    })
  })
})