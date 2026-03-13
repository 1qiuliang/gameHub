/**
 * Flappy Bird 游戏配置
 * @description 定义 Flappy Bird 的游戏参数
 */

/**
 * 游戏配置常量
 */
export const FLAPPY_CONFIG = {
  /** 小鸟大小 */
  BIRD_SIZE: 30,
  /** 重力加速度 */
  GRAVITY: 0.5,
  /** 跳跃力度 */
  JUMP_FORCE: -8,
  /** 管道宽度 */
  PIPE_WIDTH: 60,
  /** 管道间距（上下管道之间的间隙） */
  PIPE_GAP: 150,
  /** 管道移动速度 */
  PIPE_SPEED: 2,
  /** 管道生成间隔（像素） */
  PIPE_SPAWN_INTERVAL: 250,
  /** 地面高度 */
  GROUND_HEIGHT: 80,
} as const

/**
 * 颜色配置
 */
export const FLAPPY_COLORS = {
  /** 天空背景 */
  BACKGROUND: '#70c5ce',
  /** 小鸟身体 */
  BIRD: '#f7dc6f',
  /** 小鸟翅膀 */
  BIRD_WING: '#f39c12',
  /** 小鸟嘴巴 */
  BIRD_BEAK: '#e74c3c',
  /** 管道 */
  PIPE: '#2ecc71',
  /** 管道边缘 */
  PIPE_BORDER: '#27ae60',
  /** 地面 */
  GROUND: '#ded895',
  /** 地面草皮 */
  GRASS: '#2ecc71',
  /** 云朵 */
  CLOUD: '#ffffff',
  /** 文字 */
  TEXT: '#ffffff',
  /** 文字描边 */
  TEXT_STROKE: '#2c3e50',
} as const