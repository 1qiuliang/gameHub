/**
 * 消消乐游戏配置
 * @description 定义消消乐的游戏参数
 */

/**
 * 宝石类型
 */
export const GEM_TYPES = [
  { id: 0, color: '#e74c3c', shape: 'circle' },    // 红色圆形
  { id: 1, color: '#3498db', shape: 'diamond' },   // 蓝色菱形
  { id: 2, color: '#2ecc71', shape: 'square' },    // 绿色方形
  { id: 3, color: '#f1c40f', shape: 'triangle' },  // 黄色三角
  { id: 4, color: '#9b59b6', shape: 'star' },      // 紫色星形
  { id: 5, color: '#e67e22', shape: 'hexagon' },   // 橙色六边形
] as const

/**
 * 游戏配置常量
 */
export const MATCH3_CONFIG = {
  /** 网格大小 */
  GRID_SIZE: 8,
  /** 宝石大小 */
  GEM_SIZE: 50,
  /** 动画速度 */
  ANIMATION_SPEED: 8,
  /** 下落速度 */
  FALL_SPEED: 12,
  /** 连锁延迟 */
  CHAIN_DELAY: 100,
} as const

/**
 * 颜色配置
 */
export const MATCH3_COLORS = {
  /** 背景 */
  BACKGROUND: '#1a1a2e',
  /** 网格背景 */
  GRID_BG: '#16213e',
  /** 选中边框 */
  SELECTED: '#ffffff',
  /** 提示文字 */
  TEXT: '#ffffff',
} as const