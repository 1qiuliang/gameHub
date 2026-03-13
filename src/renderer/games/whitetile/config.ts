/**
 * 别踩白块游戏配置
 * @description 定义别踩白块的游戏参数
 */

/**
 * 游戏配置常量
 */
export const WHITETILE_CONFIG = {
  /** 列数 */
  COLS: 4,
  /** 行数（屏幕可见行数 + 缓冲） */
  VISIBLE_ROWS: 6,
  /** 方块高度 */
  TILE_HEIGHT: 120,
  /** 初始下落速度（像素/帧） */
  INITIAL_SPEED: 3,
  /** 速度增量（每10分增加） */
  SPEED_INCREMENT: 0.3,
  /** 最大速度 */
  MAX_SPEED: 15,
  /** 点击容差（像素） */
  TAP_TOLERANCE: 10,
} as const

/**
 * 颜色配置
 */
export const WHITETILE_COLORS = {
  /** 背景 */
  BACKGROUND: '#ffffff',
  /** 白色方块 */
  WHITE_TILE: '#ffffff',
  /** 黑色方块 */
  BLACK_TILE: '#1a1a1a',
  /** 已点击的黑色方块 */
  CLICKED_TILE: '#7f8c8d',
  /** 错误点击 */
  ERROR_TILE: '#e74c3c',
  /** 分割线 */
  DIVIDER: '#bdc3c7',
  /** 文字 */
  TEXT: '#2c3e50',
} as const