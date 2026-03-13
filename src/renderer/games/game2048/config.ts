/**
 * 2048游戏配置
 * @description 定义2048的游戏参数和颜色主题
 */

/**
 * 游戏配置常量
 */
export const GAME2048_CONFIG = {
  /** 网格数量 4x4 */
  GRID_SIZE: 4,
  /** 每个格子大小（像素） */
  CELL_SIZE: 100,
  /** 格子间距 */
  CELL_GAP: 10,
  /** 动画持续时间（毫秒） */
  ANIMATION_DURATION: 100,
  /** 初始方块数量 */
  INITIAL_TILES: 2,
  /** 新方块生成概率（4的出现概率） */
  FOUR_PROBABILITY: 0.1,
} as const

/**
 * 计算画布大小
 */
export const CANVAS_SIZE =
  GAME2048_CONFIG.GRID_SIZE * GAME2048_CONFIG.CELL_SIZE +
  (GAME2048_CONFIG.GRID_SIZE + 1) * GAME2048_CONFIG.CELL_GAP

/**
 * 颜色配置
 */
export const GAME2048_COLORS = {
  /** 背景 */
  BACKGROUND: '#faf8ef',
  /** 网格背景 */
  GRID_BG: '#bbada0',
  /** 空格子 */
  CELL_EMPTY: '#cdc1b4',
  /** 文字 */
  TEXT_DARK: '#776e65',
  TEXT_LIGHT: '#f9f6f2',
} as const

/**
 * 方块颜色映射
 */
export const TILE_COLORS: Record<number, { bg: string; text: string }> = {
  2: { bg: '#eee4da', text: GAME2048_COLORS.TEXT_DARK },
  4: { bg: '#ede0c8', text: GAME2048_COLORS.TEXT_DARK },
  8: { bg: '#f2b179', text: GAME2048_COLORS.TEXT_LIGHT },
  16: { bg: '#f59563', text: GAME2048_COLORS.TEXT_LIGHT },
  32: { bg: '#f67c5f', text: GAME2048_COLORS.TEXT_LIGHT },
  64: { bg: '#f65e3b', text: GAME2048_COLORS.TEXT_LIGHT },
  128: { bg: '#edcf72', text: GAME2048_COLORS.TEXT_LIGHT },
  256: { bg: '#edcc61', text: GAME2048_COLORS.TEXT_LIGHT },
  512: { bg: '#edc850', text: GAME2048_COLORS.TEXT_LIGHT },
  1024: { bg: '#edc53f', text: GAME2048_COLORS.TEXT_LIGHT },
  2048: { bg: '#edc22e', text: GAME2048_COLORS.TEXT_LIGHT },
  4096: { bg: '#3c3a32', text: GAME2048_COLORS.TEXT_LIGHT },
  8192: { bg: '#3c3a32', text: GAME2048_COLORS.TEXT_LIGHT },
}