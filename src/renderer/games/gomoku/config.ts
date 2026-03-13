/**
 * 五子棋游戏配置
 * @description 定义五子棋的游戏参数
 */

/**
 * 游戏配置常量
 */
export const GOMOKU_CONFIG = {
  /** 棋盘大小 */
  BOARD_SIZE: 15,
  /** 格子大小 */
  CELL_SIZE: 36,
  /** 棋子半径 */
  STONE_RADIUS: 15,
  /** 棋盘边距 */
  BOARD_PADDING: 20,
} as const

/**
 * 颜色配置
 */
export const GOMOKU_COLORS = {
  /** 棋盘背景 */
  BOARD_BG: '#dcb35c',
  /** 棋盘线条 */
  BOARD_LINE: '#8b4513',
  /** 星位点 */
  STAR_POINT: '#8b4513',
  /** 黑棋 */
  BLACK_STONE: '#1a1a1a',
  /** 白棋 */
  WHITE_STONE: '#f5f5f5',
  /** 最后落子标记 */
  LAST_MOVE: '#e74c3c',
  /** 悬停提示 */
  HOVER: 'rgba(0, 0, 0, 0.2)',
  /** 文字 */
  TEXT: '#333333',
} as const

/**
 * 星位点位置
 */
export const STAR_POINTS = [
  { row: 3, col: 3 },
  { row: 3, col: 7 },
  { row: 3, col: 11 },
  { row: 7, col: 3 },
  { row: 7, col: 7 },
  { row: 7, col: 11 },
  { row: 11, col: 3 },
  { row: 11, col: 7 },
  { row: 11, col: 11 },
] as const