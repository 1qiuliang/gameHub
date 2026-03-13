/**
 * 游戏接口定义
 * @description 所有游戏必须实现此接口，实现可插拔的游戏架构
 */

import type { ReactNode } from 'react'
import { GameCategory, GameStatus } from '@shared/types'

/* ==================== 游戏元数据 ==================== */

/**
 * 游戏元数据接口
 * @description 包含游戏的基本信息，用于展示和分类
 */
export interface GameMeta {
  /** 游戏唯一标识 */
  id: string
  /** 游戏名称 */
  name: string
  /** 游戏描述 */
  description: string
  /** 游戏图标（URL或Base64） */
  icon: string
  /** 游戏分类 */
  category: GameCategory
  /** 作者 */
  author?: string
  /** 版本号 */
  version?: string
  /** 标签 */
  tags?: string[]
  /** 游戏说明 */
  instructions?: string
  /** 操作说明 */
  controls?: string
}

/* ==================== 游戏配置 ==================== */

/**
 * 游戏配置接口
 * @description 定义游戏运行时的配置参数
 */
export interface GameConfig {
  /** 画布宽度 */
  width: number
  /** 画布高度 */
  height: number
  /** 帧率限制（可选，默认60） */
  fps?: number
  /** 是否显示分数 */
  showScore?: boolean
  /** 是否显示等级 */
  showLevel?: boolean
  /** 是否显示生命值 */
  showLives?: boolean
  /** 背景颜色 */
  backgroundColor?: string
  /** 自定义UI组件 */
  customUI?: ReactNode
}

/* ==================== 游戏状态 ==================== */

/**
 * 游戏状态接口
 * @description 定义游戏的通用状态结构
 */
export interface GameState {
  /** 当前分数 */
  score: number
  /** 当前等级 */
  level: number
  /** 剩余生命 */
  lives: number
  /** 游戏状态 */
  status: GameStatus
  /** 最高分 */
  highScore: number
  /** 已用时间（秒） */
  elapsedTime: number
  /** 游戏自定义状态 */
  [key: string]: unknown
}

/* ==================== 游戏事件 ==================== */

/**
 * 游戏事件类型
 */
export type GameEventType =
  | 'start'
  | 'pause'
  | 'resume'
  | 'reset'
  | 'gameover'
  | 'score'
  | 'levelup'
  | 'collision'

/**
 * 游戏事件回调
 */
export type GameEventCallback = (event: GameEventType, data?: unknown) => void

/* ==================== 游戏主接口 ==================== */

/**
 * 游戏主接口
 * @description 所有游戏必须实现此接口，定义标准的生命周期和行为
 */
export interface IGame {
  /* ========== 元数据 ========== */

  /** 游戏元数据 */
  readonly meta: GameMeta
  /** 游戏配置 */
  readonly config: GameConfig

  /* ========== 生命周期 ========== */

  /**
   * 初始化游戏
   * @param canvas - 游戏渲染的目标画布
   * @description 在游戏启动前调用，用于设置渲染上下文和加载资源
   */
  init(canvas: HTMLCanvasElement): Promise<void> | void

  /**
   * 开始游戏
   * @description 启动游戏循环，游戏进入运行状态
   */
  start(): void

  /**
   * 暂停游戏
   * @description 暂停游戏循环，保持当前状态
   */
  pause(): void

  /**
   * 恢复游戏
   * @description 从暂停状态恢复游戏运行
   */
  resume(): void

  /**
   * 重置游戏
   * @description 重置游戏到初始状态，准备重新开始
   */
  reset(): void

  /**
   * 销毁游戏
   * @description 清理资源，释放内存，游戏即将被卸载
   */
  destroy(): void

  /* ========== 游戏循环 ========== */

  /**
   * 更新游戏状态
   * @param deltaTime - 距上一帧的时间间隔（毫秒）
   * @description 每帧调用，处理游戏逻辑和状态更新
   */
  update(deltaTime: number): void

  /**
   * 渲染游戏画面
   * @param ctx - Canvas 2D渲染上下文
   * @description 每帧调用，绘制游戏画面
   */
  render(ctx: CanvasRenderingContext2D): void

  /* ========== 状态管理 ========== */

  /**
   * 获取游戏状态
   * @returns 当前游戏状态
   */
  getState(): GameState

  /**
   * 设置游戏状态
   * @param state - 要更新的状态片段
   * @description 部分更新游戏状态
   */
  setState(state: Partial<GameState>): void

  /* ========== 输入处理 ========== */

  /**
   * 处理按键按下
   * @param key - 按键标识
   * @description 响应键盘按下事件
   */
  handleKeyDown(key: string): void

  /**
   * 处理按键释放
   * @param key - 按键标识
   * @description 响应键盘释放事件
   */
  handleKeyUp(key: string): void

  /* ========== 事件系统 ========== */

  /**
   * 注册事件监听器
   * @param event - 事件类型
   * @param callback - 回调函数
   */
  on(event: GameEventType, callback: GameEventCallback): void

  /**
   * 移除事件监听器
   * @param event - 事件类型
   * @param callback - 回调函数
   */
  off(event: GameEventType, callback: GameEventCallback): void
}

/* ==================== 游戏构造器类型 ==================== */

/**
 * 游戏构造器类型
 * @description 用于定义游戏类的构造函数签名
 */
export type GameConstructor = new () => IGame