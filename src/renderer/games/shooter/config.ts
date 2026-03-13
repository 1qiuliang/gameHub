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
  COLUMNS: 5,
  /** 子弹速度 */
  BULLET_SPEED: 12,
  /** 子弹冷却时间（毫秒） */
  BULLET_COOLDOWN: 200,
  /** 自动发射间隔（毫秒） */
  AUTO_FIRE_INTERVAL: 350,
  /** 敌人移动速度 */
  ENEMY_SPEED: 1.5,
  /** 敌人生成间隔（毫秒） */
  ENEMY_SPAWN_INTERVAL: 1000,
  /** 敌人下落速度增量 */
  ENEMY_SPEED_INCREMENT: 0.2,
  /** 玩家飞船宽度 */
  PLAYER_WIDTH: 50,
  /** 玩家飞船高度 */
  PLAYER_HEIGHT: 40,
  /** 子弹宽度 */
  BULLET_WIDTH: 6,
  /** 子弹高度 */
  BULLET_HEIGHT: 18,
  /** 敌人宽度 */
  ENEMY_WIDTH: 40,
  /** 敌人高度 */
  ENEMY_HEIGHT: 30,
  /** 道具掉落概率 */
  POWERUP_DROP_RATE: 0.15,
  /** 道具下落速度 */
  POWERUP_SPEED: 2,
  /** 子弹升级最大等级 */
  MAX_BULLET_LEVEL: 3,
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
 * 敌人类型枚举
 */
export enum EnemyType {
  /** 普通敌人 - 标准速度和血量 */
  NORMAL = 'normal',
  /** 快速敌人 - 速度快但血量少 */
  FAST = 'fast',
  /** 坦克敌人 - 速度慢但血量高 */
  TANK = 'tank',
  /** 精英敌人 - 高分数高血量 */
  ELITE = 'elite',
}

/**
 * 敌人配置
 */
export const ENEMY_CONFIG: Record<
  EnemyType,
  {
    health: number
    speed: number
    score: number
    color: string
    width: number
    height: number
    spawnWeight: number
  }
> = {
  [EnemyType.NORMAL]: {
    health: 1,
    speed: 1,
    score: 10,
    color: '#ff3366',
    width: 40,
    height: 30,
    spawnWeight: 60,
  },
  [EnemyType.FAST]: {
    health: 1,
    speed: 2,
    score: 15,
    color: '#ffaa00',
    width: 30,
    height: 25,
    spawnWeight: 25,
  },
  [EnemyType.TANK]: {
    health: 3,
    speed: 0.6,
    score: 30,
    color: '#8844ff',
    width: 50,
    height: 40,
    spawnWeight: 10,
  },
  [EnemyType.ELITE]: {
    health: 5,
    speed: 0.8,
    score: 50,
    color: '#ff0088',
    width: 55,
    height: 45,
    spawnWeight: 5,
  },
}

/**
 * 道具类型枚举
 */
export enum PowerUpType {
  /** 子弹升级 */
  BULLET_UPGRADE = 'bullet_upgrade',
  /** 射速提升 */
  FIRE_RATE = 'fire_rate',
  /** 清屏炸弹 */
  BOMB = 'bomb',
}

/**
 * 道具配置
 */
export const POWERUP_CONFIG: Record<
  PowerUpType,
  {
    color: string
    symbol: string
    description: string
  }
> = {
  [PowerUpType.BULLET_UPGRADE]: {
    color: '#00ff88',
    symbol: '⬆',
    description: '子弹升级',
  },
  [PowerUpType.FIRE_RATE]: {
    color: '#ffff00',
    symbol: '⚡',
    description: '射速提升',
  },
  [PowerUpType.BOMB]: {
    color: '#ff4444',
    symbol: '💥',
    description: '清屏炸弹',
  },
}

/**
 * 子弹等级配置
 */
export const BULLET_LEVEL_CONFIG = [
  { spread: 0, damage: 1, cooldown: 200 },     // Level 1: 单发
  { spread: 1, damage: 1, cooldown: 180 },     // Level 2: 双发
  { spread: 2, damage: 1, cooldown: 150 },     // Level 3: 三发
] as const

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
  /** 子弹升级 */
  BULLET_UPGRADED: '#00ffff',
  /** 敌人 */
  ENEMY: '#ff3366',
  /** 敌人眼睛 */
  ENEMY_EYE: '#ffffff',
  /** 爆炸效果 */
  EXPLOSION: '#ff8800',
  /** 文字 */
  TEXT: '#ffffff',
  /** 道具 */
  POWERUP: '#00ff88',
} as const