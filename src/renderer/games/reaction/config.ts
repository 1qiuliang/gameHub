/**
 * 反应测试游戏配置
 * @description 定义反应测试的游戏参数
 */

/**
 * 游戏状态
 */
export enum ReactionState {
  /** 等待开始 */
  WAITING = 'waiting',
  /** 准备中（等待绿色信号） */
  READY = 'ready',
  /** 可以点击（绿色） */
  GO = 'go',
  /** 太早点击 */
  TOO_EARLY = 'too_early',
  /** 已完成 */
  DONE = 'done',
}

/**
 * 游戏配置常量
 */
export const REACTION_CONFIG = {
  /** 最小等待时间（毫秒） */
  MIN_WAIT_TIME: 2000,
  /** 最大等待时间（毫秒） */
  MAX_WAIT_TIME: 5000,
  /** 结果显示时间（毫秒） */
  RESULT_DISPLAY_TIME: 2000,
} as const

/**
 * 颜色配置
 */
export const REACTION_COLORS = {
  /** 等待状态背景 */
  WAITING_BG: '#3498db',
  /** 准备状态背景 */
  READY_BG: '#e74c3c',
  /** 可以点击背景 */
  GO_BG: '#2ecc71',
  /** 太早点击背景 */
  TOO_EARLY_BG: '#f39c12',
  /** 文字 */
  TEXT: '#ffffff',
} as const

/**
 * 评级配置
 */
export const REACTION_RATINGS = [
  { max: 150, text: '超神！', emoji: '🏆' },
  { max: 200, text: '非常快！', emoji: '🚀' },
  { max: 250, text: '很快！', emoji: '⚡' },
  { max: 300, text: '不错！', emoji: '👍' },
  { max: 400, text: '一般', emoji: '😐' },
  { max: Infinity, text: '加油！', emoji: '🐢' },
] as const