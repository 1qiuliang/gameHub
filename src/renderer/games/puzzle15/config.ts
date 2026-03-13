/**
 * 数字华容道游戏配置
 * @description 定义数字华容道的游戏参数
 */

/**
 * 难度配置
 */
export const PUZZLE15_SIZES = {
  easy: { size: 3, name: '3×3 (8 Puzzle)' },
  medium: { size: 4, name: '4×4 (15 Puzzle)' },
  hard: { size: 5, name: '5×5 (24 Puzzle)' },
} as const

/**
 * 游戏配置常量
 */
export const PUZZLE15_CONFIG = {
  /** 默认网格大小 */
  DEFAULT_SIZE: 4,
  /** 方块大小 */
  TILE_SIZE: 80,
  /** 方块间距 */
  TILE_GAP: 5,
  /** 动画速度 */
  ANIMATION_SPEED: 10,
} as const

/**
 * 颜色配置
 */
export const PUZZLE15_COLORS = {
  /** 背景 */
  BACKGROUND: '#2c3e50',
  /** 方块背景 */
  TILE_BG: '#3498db',
  /** 方块悬停 */
  TILE_HOVER: '#2980b9',
  /** 空白位置 */
  EMPTY: '#1a252f',
  /** 数字 */
  TEXT: '#ffffff',
  /** 完成时的高亮 */
  COMPLETED: '#2ecc71',
} as const