/**
 * 跳一跳游戏配置
 * @description 定义跳一跳的游戏参数
 */

/**
 * 游戏配置常量
 */
export const JUMPJUMP_CONFIG = {
  /** 玩家大小 */
  PLAYER_SIZE: 30,
  /** 重力 */
  GRAVITY: 0.4,
  /** 蓄力跳跃系数 */
  JUMP_POWER_FACTOR: 0.15,
  /** 最大蓄力 */
  MAX_POWER: 100,
  /** 平台最小宽度 */
  PLATFORM_MIN_WIDTH: 60,
  /** 平台最大宽度 */
  PLATFORM_MAX_WIDTH: 120,
  /** 平台高度 */
  PLATFORM_HEIGHT: 20,
  /** 平台间距范围 */
  PLATFORM_GAP_MIN: 80,
  PLATFORM_GAP_MAX: 180,
  /** 平台下移速度 */
  SCROLL_SPEED: 2,
} as const

/**
 * 颜色配置
 */
export const JUMPJUMP_COLORS = {
  /** 背景 */
  BACKGROUND: '#2c3e50',
  /** 玩家 */
  PLAYER: '#e74c3c',
  /** 玩家眼睛 */
  PLAYER_EYE: '#ffffff',
  /** 平台颜色列表 */
  PLATFORMS: ['#3498db', '#2ecc71', '#9b59b6', '#f1c40f', '#e67e22', '#1abc9c'],
  /** 蓄力条背景 */
  POWER_BAR_BG: '#34495e',
  /** 蓄力条 */
  POWER_BAR: '#e74c3c',
  /** 文字 */
  TEXT: '#ffffff',
} as const