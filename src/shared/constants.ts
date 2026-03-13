/**
 * 共享常量定义
 * @description 主进程和渲染进程共用的常量配置
 */

/**
 * 应用配置
 */
export const APP_CONFIG = {
  /** 应用名称 */
  NAME: 'GameHub',
  /** 应用版本 */
  VERSION: '1.0.0',
  /** 默认窗口宽度 */
  DEFAULT_WIDTH: 1280,
  /** 默认窗口高度 */
  DEFAULT_HEIGHT: 800,
  /** 最小窗口宽度 */
  MIN_WIDTH: 800,
  /** 最小窗口高度 */
  MIN_HEIGHT: 600,
} as const

/**
 * 游戏相关常量
 */
export const GAME_CONSTANTS = {
  /** 默认帧率 */
  DEFAULT_FPS: 60,
  /** 默认画布宽度 */
  DEFAULT_CANVAS_WIDTH: 800,
  /** 默认画布高度 */
  DEFAULT_CANVAS_HEIGHT: 600,
} as const

/**
 * 存储键名
 */
export const STORAGE_KEYS = {
  /** 游戏设置 */
  GAME_SETTINGS: 'gamehub_settings',
  /** 最高分记录 */
  HIGH_SCORES: 'gamehub_high_scores',
  /** 最近游玩 */
  RECENT_GAMES: 'gamehub_recent_games',
  /** 收藏的游戏 */
  FAVORITE_GAMES: 'gamehub_favorite_games',
} as const