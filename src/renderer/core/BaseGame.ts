/**
 * 游戏基类
 * @description 提供游戏的标准实现框架，子类只需实现核心逻辑
 */

import type {
  IGame,
  GameMeta,
  GameConfig,
  GameState,
  GameEventType,
  GameEventCallback,
} from './interfaces/IGame'
import { GameStatus } from '@shared/types'

/**
 * 游戏抽象基类
 * @description 实现了IGame接口的通用逻辑，子类继承后只需实现抽象方法
 */
export abstract class BaseGame implements IGame {
  /* ========== 元数据和配置 ========== */

  abstract readonly meta: GameMeta
  abstract readonly config: GameConfig

  /* ========== 内部状态 ========== */

  /** Canvas 元素 */
  protected _canvas: HTMLCanvasElement | null = null
  /** Canvas 2D 渲染上下文 */
  protected _ctx: CanvasRenderingContext2D | null = null
  /** 游戏状态 */
  protected _state: GameState
  /** 动画帧ID */
  protected _animationId: number | null = null
  /** 上一帧时间戳 */
  protected _lastTime: number = 0
  /** 是否已初始化 */
  protected _initialized: boolean = false
  /** 事件监听器映射 */
  protected _eventListeners: Map<GameEventType, Set<GameEventCallback>> = new Map()

  /* ========== 构造函数 ========== */

  constructor() {
    this._state = this.createInitialState()
  }

  /* ========== 初始化状态 ========== */

  /**
   * 创建初始游戏状态
   * @description 子类可重写此方法添加自定义状态
   */
  protected createInitialState(): GameState {
    return {
      score: 0,
      level: 1,
      lives: 3,
      status: GameStatus.IDLE,
      highScore: 0,
      elapsedTime: 0,
    }
  }

  /* ========== 生命周期实现 ========== */

  /**
   * 初始化游戏
   */
  async init(canvas: HTMLCanvasElement): Promise<void> {
    if (this._initialized) {
      console.warn(`[${this.meta.name}] 游戏已经初始化`)
      return
    }

    this._canvas = canvas
    this._ctx = canvas.getContext('2d')

    if (!this._ctx) {
      throw new Error(`[${this.meta.name}] 无法获取Canvas渲染上下文`)
    }

    // 【设置画布尺寸】
    this._canvas.width = this.config.width
    this._canvas.height = this.config.height

    // 【加载资源】（子类可重写）
    await this.loadResources()

    this._initialized = true
    console.log(`[${this.meta.name}] 游戏初始化完成`)
  }

  /**
   * 加载游戏资源
   * @description 子类可重写此方法加载图片、音频等资源
   */
  protected async loadResources(): Promise<void> {
    // 默认空实现，子类可重写
  }

  /**
   * 开始游戏
   */
  start(): void {
    if (!this._initialized) {
      console.error(`[${this.meta.name}] 游戏未初始化，无法启动`)
      return
    }

    if (this._state.status === GameStatus.PLAYING) {
      console.warn(`[${this.meta.name}] 游戏已在运行中`)
      return
    }

    this._state.status = GameStatus.PLAYING
    this._lastTime = performance.now()
    this._animationId = requestAnimationFrame(this.gameLoop.bind(this))

    this.emit('start')
    console.log(`[${this.meta.name}] 游戏开始`)
  }

  /**
   * 暂停游戏
   */
  pause(): void {
    if (this._state.status !== GameStatus.PLAYING) {
      return
    }

    this._state.status = GameStatus.PAUSED
    if (this._animationId) {
      cancelAnimationFrame(this._animationId)
      this._animationId = null
    }

    this.emit('pause')
    console.log(`[${this.meta.name}] 游戏暂停`)
  }

  /**
   * 恢复游戏
   */
  resume(): void {
    if (this._state.status !== GameStatus.PAUSED) {
      return
    }

    this._state.status = GameStatus.PLAYING
    this._lastTime = performance.now()
    this._animationId = requestAnimationFrame(this.gameLoop.bind(this))

    this.emit('resume')
    console.log(`[${this.meta.name}] 游戏恢复`)
  }

  /**
   * 重置游戏
   */
  reset(): void {
    // 停止游戏循环
    if (this._animationId) {
      cancelAnimationFrame(this._animationId)
      this._animationId = null
    }

    // 重置状态
    const highScore = this._state.highScore
    this._state = this.createInitialState()
    this._state.highScore = highScore

    this.emit('reset')
    console.log(`[${this.meta.name}] 游戏重置`)
  }

  /**
   * 销毁游戏
   */
  destroy(): void {
    // 停止游戏循环
    if (this._animationId) {
      cancelAnimationFrame(this._animationId)
      this._animationId = null
    }

    // 清除事件监听
    this._eventListeners.clear()

    // 清除引用
    this._canvas = null
    this._ctx = null
    this._initialized = false

    console.log(`[${this.meta.name}] 游戏已销毁`)
  }

  /* ========== 游戏循环 ========== */

  /**
   * 游戏主循环
   */
  private gameLoop(currentTime: number): void {
    if (this._state.status !== GameStatus.PLAYING) {
      return
    }

    // 【计算时间差】
    const deltaTime = currentTime - this._lastTime
    this._lastTime = currentTime

    // 【更新游戏时长】
    this._state.elapsedTime += deltaTime

    // 【更新逻辑】
    this.update(deltaTime)

    // 【渲染画面】
    if (this._ctx) {
      this.render(this._ctx)
    }

    // 【继续下一帧】
    this._animationId = requestAnimationFrame(this.gameLoop.bind(this))
  }

  /**
   * 更新游戏状态（子类实现）
   */
  abstract update(deltaTime: number): void

  /**
   * 渲染游戏画面（子类实现）
   */
  abstract render(ctx: CanvasRenderingContext2D): void

  /* ========== 状态管理 ========== */

  /**
   * 获取游戏状态
   */
  getState(): GameState {
    return { ...this._state }
  }

  /**
   * 设置游戏状态
   */
  setState(state: Partial<GameState>): void {
    this._state = { ...this._state, ...state }
  }

  /* ========== 游戏结束处理 ========== */

  /**
   * 触发游戏结束
   */
  protected gameOver(): void {
    this._state.status = GameStatus.GAME_OVER

    // 更新最高分
    if (this._state.score > this._state.highScore) {
      this._state.highScore = this._state.score
    }

    if (this._animationId) {
      cancelAnimationFrame(this._animationId)
      this._animationId = null
    }

    this.emit('gameover', { score: this._state.score, highScore: this._state.highScore })
    console.log(`[${this.meta.name}] 游戏结束，得分: ${this._state.score}`)
  }

  /* ========== 输入处理 ========== */

  /**
   * 处理按键按下（子类实现）
   */
  abstract handleKeyDown(key: string): void

  /**
   * 处理按键释放（子类实现）
   */
  abstract handleKeyUp(key: string): void

  /* ========== 事件系统 ========== */

  /**
   * 注册事件监听器
   */
  on(event: GameEventType, callback: GameEventCallback): void {
    if (!this._eventListeners.has(event)) {
      this._eventListeners.set(event, new Set())
    }
    this._eventListeners.get(event)!.add(callback)
  }

  /**
   * 移除事件监听器
   */
  off(event: GameEventType, callback: GameEventCallback): void {
    this._eventListeners.get(event)?.delete(callback)
  }

  /**
   * 触发事件
   */
  protected emit(event: GameEventType, data?: unknown): void {
    this._eventListeners.get(event)?.forEach((callback) => {
      try {
        callback(event, data)
      } catch (error) {
        console.error(`[${this.meta.name}] 事件回调执行错误:`, error)
      }
    })
  }

  /* ========== 辅助方法 ========== */

  /**
   * 获取画布尺寸
   */
  protected getCanvasSize(): { width: number; height: number } {
    return {
      width: this._canvas?.width ?? this.config.width,
      height: this._canvas?.height ?? this.config.height,
    }
  }

  /**
   * 清空画布
   */
  protected clearCanvas(ctx: CanvasRenderingContext2D): void {
    const { width, height } = this.getCanvasSize()
    ctx.fillStyle = this.config.backgroundColor ?? '#1a1a2e'
    ctx.fillRect(0, 0, width, height)
  }
}