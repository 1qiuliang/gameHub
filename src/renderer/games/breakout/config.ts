/**
 * 打砖块游戏配置
 * @description 定义打砖块的游戏参数
 */

/**
 * 游戏配置常量
 */
export const BREAKOUT_CONFIG = {
  /** 挡板高度 */
  PADDLE_HEIGHT: 15,
  /** 挡板宽度 */
  PADDLE_WIDTH: 100,
  /** 挡板移动速度 */
  PADDLE_SPEED: 8,
  /** 小球半径 */
  BALL_RADIUS: 8,
  /** 小球初始速度 */
  BALL_SPEED: 3,
  /** 砖块行数 */
  BRICK_ROWS: 5,
  /** 砖块列数 */
  BRICK_COLS: 10,
  /** 砖块高度 */
  BRICK_HEIGHT: 25,
  /** 砖块间距 */
  BRICK_PADDING: 5,
  /** 砖块顶部边距 */
  BRICK_OFFSET_TOP: 50,
  /** 初始生命 */
  INITIAL_LIVES: 3,
} as const

/**
 * 颜色配置
 */
export const BREAKOUT_COLORS = {
  /** 背景 */
  BACKGROUND: '#1a1a2e',
  /** 挡板 */
  PADDLE: '#3498db',
  /** 小球 */
  BALL: '#ffffff',
  /** 文字 */
  TEXT: '#ffffff',
  /** 砖块颜色（按行） */
  BRICKS: ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db'],
} as const