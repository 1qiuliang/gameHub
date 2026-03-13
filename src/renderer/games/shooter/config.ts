/**
 * 太空射击游戏配置
 * @description 定义太空射击游戏的游戏参数
 */

/**
 * 游戏配置常量
 */
export const SHOOTER_CONFIG = {
  /** 玩家移动速度（像素/帧） */
  PLAYER_SPEED: 6,
  /** 列数 */
  COLUMNS: 7,
  /** 子弹速度 */
  BULLET_SPEED: 10,
  /** 子弹冷却时间（毫秒） */
  BULLET_COOLDOWN: 250,
  /** 自动发射间隔（毫秒） */
  AUTO_FIRE_INTERVAL: 400,
  /** 敌人移动速度 */
  ENEMY_SPEED: 2,
  /** 敌人生成间隔（毫秒） */
  ENEMY_SPAWN_INTERVAL: 1200,
  /** 敌人下落速度增量 */
  ENEMY_SPEED_INCREMENT: 0.3,
  /** 玩家飞船宽度 */
  PLAYER_WIDTH: 50,
  /** 玩家飞船高度 */
  PLAYER_HEIGHT: 40,
  /** 子弹宽度 */
  BULLET_WIDTH: 4,
  /** 子弹高度 */
  BULLET_HEIGHT: 15,
  /** 敌人宽度 */
  ENEMY_WIDTH: 40,
  /** 敌人高度 */
  ENEMY_HEIGHT: 30,
} as const

/**
 * 发射模式枚举
 */
export enum FireMode {
  /** 手动发射 */
  MANUAL = 'manual',
  /** 自动发射 */
  AUTO = 'auto',
}

/**
 * 颜色配置
 */
export const SHOOTER_COLORS = {
  /** 背景 */
  BACKGROUND: '#0a0a1a',
  /** 星星 */
  STARS: '#ffffff',
  /** 玩家飞船 */
  PLAYER: '#00ff88',
  /** 玩家飞船引擎火焰 */
  PLAYER_FLAME: '#ff6600',
  /** 子弹 */
  BULLET: '#ffff00',
  /** 敌人 */
  ENEMY: '#ff3366',
  /** 敌人眼睛 */
  ENEMY_EYE: '#ffffff',
  /** 爆炸效果 */
  EXPLOSION: '#ff8800',
  /** 文字 */
  TEXT: '#ffffff',
} as const