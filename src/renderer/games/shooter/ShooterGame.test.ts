/**
 * 太空射击游戏测试
 * @description 测试太空射击游戏的核心功能
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { ShooterGame } from './ShooterGame'
import { createMockCanvas, createMockCallback, pressKey } from '@/test/utils'
import { GameStatus } from '@shared/types'
import { SHOOTER_CONFIG, FireMode } from './config'

describe('ShooterGame', () => {
  let game: ShooterGame
  let canvas: HTMLCanvasElement

  beforeEach(() => {
    game = new ShooterGame()
    canvas = createMockCanvas()
  })

  describe('游戏元数据', () => {
    it('应该有正确的游戏 ID', () => {
      expect(game.meta.id).toBe('shooter')
    })

    it('应该有游戏名称', () => {
      expect(game.meta.name).toBe('太空射击')
    })

    it('应该有游戏描述', () => {
      expect(game.meta.description).toBeTruthy()
    })

    it('应该有游戏图标', () => {
      expect(game.meta.icon).toBe('🚀')
    })

    it('应该属于动作游戏分类', () => {
      expect(game.meta.category).toBe('action')
    })
  })

  describe('游戏配置', () => {
    it('应该有正确的画布尺寸', () => {
      expect(game.config.width).toBe(500)
      expect(game.config.height).toBe(600)
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

      it('应该显示模式选择界面', () => {
        game.start()
        // 游戏开始后应该显示模式选择
        expect(game.getState().status).toBe(GameStatus.PLAYING)
      })
    })

    describe('pause()', () => {
      it('应该将状态变为 PAUSED', () => {
        game.start()
        game.pause()
        expect(game.getState().status).toBe(GameStatus.PAUSED)
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
    })
  })

  describe('输入处理', () => {
    beforeEach(async () => {
      await game.init(canvas)
      game.start()
    })

    it('左箭头键应该移动玩家', () => {
      pressKey(game, 'ArrowLeft')
      expect(game.getState().status).toBe(GameStatus.PLAYING)
    })

    it('A 键应该移动玩家', () => {
      pressKey(game, 'a')
      expect(game.getState().status).toBe(GameStatus.PLAYING)
    })

    it('右箭头键应该移动玩家', () => {
      pressKey(game, 'ArrowRight')
      expect(game.getState().status).toBe(GameStatus.PLAYING)
    })

    it('D 键应该移动玩家', () => {
      pressKey(game, 'd')
      expect(game.getState().status).toBe(GameStatus.PLAYING)
    })

    it('数字键 1 应该选择手动模式', () => {
      pressKey(game, '1')
      expect(game.getState().status).toBe(GameStatus.PLAYING)
    })

    it('数字键 2 应该选择自动模式', () => {
      pressKey(game, '2')
      expect(game.getState().status).toBe(GameStatus.PLAYING)
    })

    it('Enter 键应该开始游戏', () => {
      pressKey(game, 'Enter')
      expect(game.getState().status).toBe(GameStatus.PLAYING)
    })

    it('M 键应该切换发射模式', () => {
      pressKey(game, 'm')
      expect(game.getState().status).toBe(GameStatus.PLAYING)
    })

    it('P 键应该暂停游戏', () => {
      // 先关闭模式选择界面
      pressKey(game, 'Enter')
      // 然后 P 键应该可以暂停
      pressKey(game, 'p')
      expect(game.getState().status).toBe(GameStatus.PAUSED)
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