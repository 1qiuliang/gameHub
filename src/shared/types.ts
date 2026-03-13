/**
 * 共享类型定义
 * @description 主进程和渲染进程共用的类型定义
 */

/**
 * 游戏分类枚举
 */
export enum GameCategory {
  /** 经典小游戏 */
  CLASSIC = 'classic',
  /** 益智休闲 */
  PUZZLE = 'puzzle',
  /** 动作射击 */
  ACTION = 'action',
}

/**
 * 游戏状态枚举
 */
export enum GameStatus {
  /** 空闲 */
  IDLE = 'idle',
  /** 游戏中 */
  PLAYING = 'playing',
  /** 已暂停 */
  PAUSED = 'paused',
  /** 游戏结束 */
  GAME_OVER = 'game_over',
}

/**
 * 方向枚举
 */
export enum Direction {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
}

/**
 * 位置接口
 */
export interface Position {
  x: number
  y: number
}

/**
 * 尺寸接口
 */
export interface Size {
  width: number
  height: number
}

/**
 * 颜色配置
 */
export interface ColorConfig {
  primary: string
  secondary: string
  background: string
  text: string
}