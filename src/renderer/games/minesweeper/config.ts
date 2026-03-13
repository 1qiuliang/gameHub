/**
 * 扫雷游戏配置
 * @description 定义扫雷的游戏参数
 */

/**
 * 难度配置
 */
export const MINESWEEPER_DIFFICULTY = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 16, cols: 30, mines: 99 },
} as const

/**
 * 游戏配置常量
 */
export const MINESWEEPER_CONFIG = {
  /** 单元格大小 */
  CELL_SIZE: 30,
  /** 默认难度 */
  DEFAULT_DIFFICULTY: 'easy' as keyof typeof MINESWEEPER_DIFFICULTY,
} as const

/**
 * 颜色配置
 */
export const MINESWEEPER_COLORS = {
  /** 背景 */
  BACKGROUND: '#c0c0c0',
  /** 未揭开格子 */
  HIDDEN: '#bdbdbd',
  /** 已揭开格子 */
  REVEALED: '#e0e0e0',
  /** 地雷 */
  MINE: '#1a1a1a',
  /** 旗帜 */
  FLAG: '#e74c3c',
  /** 数字颜色（1-8） */
  NUMBERS: [
    '#0000ff', // 1 - 蓝色
    '#008000', // 2 - 绿色
    '#ff0000', // 3 - 红色
    '#000080', // 4 - 深蓝
    '#800000', // 5 - 深红
    '#008080', // 6 - 青色
    '#000000', // 7 - 黑色
    '#808080', // 8 - 灰色
  ],
  /** 边框高亮 */
  BORDER_LIGHT: '#ffffff',
  /** 边框阴影 */
  BORDER_DARK: '#808080',
  /** 爆炸地雷背景 */
  EXPLODED: '#ff0000',
} as const