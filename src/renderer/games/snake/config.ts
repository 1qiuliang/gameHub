/**
 * 贪吃蛇游戏配置
 * @description 定义贪吃蛇的游戏参数
 */

/**
 * 游戏配置常量
 */
export const SNAKE_CONFIG = {
  /** 网格大小 */
  GRID_SIZE: 20,
  /** 初始移动速度（毫秒/格） */
  INITIAL_SPEED: 150,
  /** 速度增量（每吃一个食物减少的毫秒数） */
  SPEED_INCREMENT: 5,
  /** 最小速度 */
  MIN_SPEED: 50,
  /** 初始蛇长度 */
  INITIAL_LENGTH: 3,
} as const

/**
 * 颜色配置
 */
export const SNAKE_COLORS = {
  /** 背景 */
  BACKGROUND: '#1a1a2e',
  /** 网格线 */
  GRID: 'rgba(255, 255, 255, 0.05)',
  /** 蛇身 */
  SNAKE_BODY: '#2ecc71',
  /** 蛇头 */
  SNAKE_HEAD: '#27ae60',
  /** 食物 */
  FOOD: '#e74c3c',
  /** 文字 */
  TEXT: '#ffffff',
} as const