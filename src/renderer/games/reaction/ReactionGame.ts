/**
 * 反应测试游戏
 * @description 测试反应速度的小游戏
 */

import { BaseGame, type IGame, type GameMeta, type GameConfig } from '@/core'
import { GameCategory } from '@shared/types'
import {
  ReactionState,
  REACTION_CONFIG,
  REACTION_COLORS,
  REACTION_RATINGS,
} from './config'

/**
 * 游戏状态
 */
interface ReactionGameState {
  phase: ReactionState
  startTime: number
  signalTime: number
  reactionTime: number
  waitTimeoutId: ReturnType<typeof setTimeout> | null
  resultTimeoutId: ReturnType<typeof setTimeout> | null
}

/**
 * 反应测试游戏类
 */
export class ReactionGame extends BaseGame implements IGame {
  /* ========== 游戏元数据 ========== */
  readonly meta: GameMeta = {
    id: 'reaction',
    name: '反应测试',
    description: '测试你的反应速度！等待绿色出现后尽快点击。',
    icon: '⚡',
    category: GameCategory.PUZZLE,
    author: 'GameHub',
    version: '1.0.0',
    tags: ['反应', '休闲', '测试'],
    controls: '等待绿色出现后，点击屏幕或按任意键',
  }

  /* ========== 游戏配置 ========== */
  readonly config: GameConfig = {
    width: 500,
    height: 400,
    showScore: true,
    showLevel: false,
    showLives: false,
    backgroundColor: REACTION_COLORS.WAITING_BG,
  }

  /* ========== 反应测试特有状态 ========== */
  private _gameState: ReactionGameState

  constructor() {
    super()
    this._gameState = this.createGameState()
  }

  /**
   * 创建初始状态
   */
  private createGameState(): ReactionGameState {
    return {
      phase: ReactionState.WAITING,
      startTime: 0,
      signalTime: 0,
      reactionTime: 0,
      waitTimeoutId: null,
      resultTimeoutId: null,
    }
  }

  /* ========== 重写初始化状态 ========== */
  protected createInitialState() {
    return {
      ...super.createInitialState(),
      score: 0,
      level: 1,
      lives: 0,
      bestTime: 0,
    }
  }

  /* ========== 重写重置 ========== */
  reset(): void {
    this.clearAllTimeouts()
    this._gameState = this.createGameState()
    super.reset()
  }

  /**
   * 清除所有定时器
   */
  private clearAllTimeouts(): void {
    if (this._gameState.waitTimeoutId) {
      clearTimeout(this._gameState.waitTimeoutId)
      this._gameState.waitTimeoutId = null
    }
    if (this._gameState.resultTimeoutId) {
      clearTimeout(this._gameState.resultTimeoutId)
      this._gameState.resultTimeoutId = null
    }
  }

  /* ========== 更新逻辑 ========== */
  update(_deltaTime: number): void {
    // 此游戏不需要持续更新，完全依赖事件驱动
  }

  /**
   * 开始测试
   */
  private startTest(): void {
    this._gameState.phase = ReactionState.READY
    this._gameState.startTime = Date.now()

    // 随机等待时间后变绿
    const waitTime =
      REACTION_CONFIG.MIN_WAIT_TIME +
      Math.random() * (REACTION_CONFIG.MAX_WAIT_TIME - REACTION_CONFIG.MIN_WAIT_TIME)

    this._gameState.waitTimeoutId = setTimeout(() => {
      this.showSignal()
    }, waitTime)
  }

  /**
   * 显示绿色信号
   */
  private showSignal(): void {
    this._gameState.phase = ReactionState.GO
    this._gameState.signalTime = Date.now()
  }

  /**
   * 处理点击
   */
  private handleClick(): void {
    const state = this.getState()

    // 游戏不在运行状态时不处理
    if (state.status !== 'playing') return

    const { phase } = this._gameState

    switch (phase) {
      case ReactionState.WAITING:
        // 开始测试
        this.startTest()
        break

      case ReactionState.READY:
        // 太早点击
        this._gameState.phase = ReactionState.TOO_EARLY
        this.clearAllTimeouts()
        this.scheduleReset()
        break

      case ReactionState.GO:
        // 记录反应时间
        this._gameState.reactionTime = Date.now() - this._gameState.signalTime
        this._gameState.phase = ReactionState.DONE

        // 更新最佳成绩
        const bestTime = this.getState().bestTime as number
        if (bestTime === 0 || this._gameState.reactionTime < bestTime) {
          this.setState({ bestTime: this._gameState.reactionTime })
        }

        this.scheduleReset()
        break

      case ReactionState.TOO_EARLY:
      case ReactionState.DONE:
        // 等待自动重置
        break
      default:
        break
    }
  }

  /**
   * 计划重置
   */
  private scheduleReset(): void {
    this._gameState.resultTimeoutId = setTimeout(() => {
      this.clearAllTimeouts()
      this._gameState = this.createGameState()
    }, REACTION_CONFIG.RESULT_DISPLAY_TIME)
  }

  /**
   * 获取评级
   */
  private getRating(time: number): { text: string; emoji: string } {
    for (const rating of REACTION_RATINGS) {
      if (time < rating.max) {
        return { text: rating.text, emoji: rating.emoji }
      }
    }
    return { text: '加油！', emoji: '🐢' }
  }

  /* ========== 渲染逻辑 ========== */
  render(ctx: CanvasRenderingContext2D): void {
    const { phase, reactionTime } = this._gameState
    const { width, height } = this.config

    // 根据状态选择背景颜色
    let bgColor: string
    switch (phase) {
      case ReactionState.WAITING:
        bgColor = REACTION_COLORS.WAITING_BG
        break
      case ReactionState.READY:
        bgColor = REACTION_COLORS.READY_BG
        break
      case ReactionState.GO:
        bgColor = REACTION_COLORS.GO_BG
        break
      case ReactionState.TOO_EARLY:
        bgColor = REACTION_COLORS.TOO_EARLY_BG
        break
      case ReactionState.DONE:
        bgColor = REACTION_COLORS.GO_BG
        break
      default:
        bgColor = REACTION_COLORS.WAITING_BG
    }

    // 清空画布
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, width, height)

    // 绘制内容
    ctx.fillStyle = REACTION_COLORS.TEXT
    ctx.textAlign = 'center'

    switch (phase) {
      case ReactionState.WAITING:
        ctx.font = 'bold 28px Arial'
        ctx.fillText('点击开始测试', width / 2, height / 2 - 20)
        ctx.font = '16px Arial'
        ctx.fillText('等待绿色出现后尽快点击', width / 2, height / 2 + 20)
        break

      case ReactionState.READY:
        ctx.font = 'bold 32px Arial'
        ctx.fillText('等待...', width / 2, height / 2 - 20)
        ctx.font = '16px Arial'
        ctx.fillText('绿色出现时立即点击！', width / 2, height / 2 + 20)
        break

      case ReactionState.GO:
        ctx.font = 'bold 48px Arial'
        ctx.fillText('点击！', width / 2, height / 2)
        break

      case ReactionState.TOO_EARLY:
        ctx.font = 'bold 32px Arial'
        ctx.fillText('太早了！', width / 2, height / 2 - 30)
        ctx.font = '18px Arial'
        ctx.fillText('请等待绿色出现再点击', width / 2, height / 2 + 10)
        ctx.font = '14px Arial'
        ctx.fillText('2秒后重新开始...', width / 2, height / 2 + 40)
        break

      case ReactionState.DONE:
        const rating = this.getRating(reactionTime)
        ctx.font = 'bold 56px Arial'
        ctx.fillText(`${reactionTime}ms`, width / 2, height / 2 - 40)
        ctx.font = '32px Arial'
        ctx.fillText(`${rating.emoji} ${rating.text}`, width / 2, height / 2 + 20)
        ctx.font = '14px Arial'
        ctx.fillText('2秒后重新开始...', width / 2, height / 2 + 60)
        break
      default:
        break
    }

    // 显示最佳成绩
    const bestTime = this.getState().bestTime as number
    if (bestTime > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.font = '14px Arial'
      ctx.textAlign = 'left'
      ctx.fillText(`最佳: ${bestTime}ms`, 20, 30)
    }
  }

  /* ========== 输入处理 ========== */
  handleKeyDown(_key: string): void {
    this.handleClick()
  }

  handleKeyUp(_key: string): void {
    // 不需要按键释放处理
  }
}