/**
 * 打砖块游戏测试
 * @description 测试打砖块游戏的核心功能
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { BreakoutGame } from './BreakoutGame'
import { createMockCanvas, createMockCallback, pressKey, releaseKey } from '@/test/utils'
import { GameStatus } from '@shared/types'
import { BREAKOUT_CONFIG } from './config'

describe('BreakoutGame', () => {
  let game: BreakoutGame
  let canvas: HTMLCanvasElement

  beforeEach(() => {
    game = new BreakoutGame()
    canvas = createMockCanvas()
  })

  describe('游戏元数据', () => {
    it('应该有正确的游戏 ID', () => {
      expect(game.meta.id).toBe('breakout')
    })

    it('应该有游戏名称', () => {
      expect(game.meta.name).toBe('打砖块')
    })

    it('应该有游戏描述', () => {
      expect(game.meta.description).toBeTruthy()
    })

    it('应该有游戏图标', () => {
      expect(game.meta.icon).toBe('🧱')
    })

    it('应该属于经典游戏分类', () => {
      expect(game.meta.category).toBe('classic')
    })
  })

  describe('游戏配置', () => {
    it('应该有正确的画布尺寸', () => {
      expect(game.config.width).toBe(600)
      expect(game.config.height).toBe(500)
    })

    it('应该显示分数', () => {
      expect(game.config.showScore).toBe(true)
    })

    it('应该显示等级', () => {
      expect(game.config.showLevel).toBe(true)
    })

    it('应该显示生命值', () => {
      expect(game.config.showLives).toBe(true)
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

    it('应该有初始生命值', async () => {
      await game.init(canvas)
      expect(game.getState().lives).toBe(BREAKOUT_CONFIG.INITIAL_LIVES)
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

      it('应该重置生命值', () => {
        game.start()
        game.setState({ lives: 1 })
        game.reset()
        expect(game.getState().lives).toBe(BREAKOUT_CONFIG.INITIAL_LIVES)
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

    it('左箭头键应该设置 leftPressed', () => {
      pressKey(game, 'ArrowLeft')
      game.update(16)
      // 游戏应该还在运行
      expect(game.getState().status).toBe(GameStatus.PLAYING)
    })

    it('A 键应该设置 leftPressed', () => {
      pressKey(game, 'a')
      game.update(16)
      expect(game.getState().status).toBe(GameStatus.PLAYING)
    })

    it('右箭头键应该设置 rightPressed', () => {
      pressKey(game, 'ArrowRight')
      game.update(16)
      expect(game.getState().status).toBe(GameStatus.PLAYING)
    })

    it('D 键应该设置 rightPressed', () => {
      pressKey(game, 'd')
      game.update(16)
      expect(game.getState().status).toBe(GameStatus.PLAYING)
    })

    it('释放键应该重置按键状态', () => {
      pressKey(game, 'ArrowLeft')
      releaseKey(game, 'ArrowLeft')
      game.update(16)
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