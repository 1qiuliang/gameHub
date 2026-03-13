/**
 * 太空射击游戏
 * @description 经典太空射击游戏，控制飞船消灭入侵的敌人
 */

import { BaseGame, type IGame, type GameMeta, type GameConfig } from '@/core'
import { GameCategory } from '@shared/types'
import {
  SHOOTER_CONFIG,
  SHOOTER_COLORS,
  FireMode,
  EnemyType,
  PowerUpType,
  ENEMY_CONFIG,
  POWERUP_CONFIG,
  BULLET_LEVEL_CONFIG,
} from './config'

/**
 * 子弹接口
 */
interface Bullet {
  x: number
  y: number
  damage: number
}

/**
 * 敌人接口
 */
interface Enemy {
  x: number
  y: number
  type: EnemyType
  health: number
  maxHealth: number
  speed: number
  width: number
  height: number
}

/**
 * 道具接口
 */
interface PowerUp {
  x: number
  y: number
  type: PowerUpType
}

/**
 * 爆炸效果接口
 */
interface Explosion {
  x: number
  y: number
  radius: number
  alpha: number
  color: string
}

/**
 * 星星背景
 */
interface Star {
  x: number
  y: number
  size: number
  speed: number
}

/**
 * 射击游戏状态
 */
interface ShooterGameState {
  /** 玩家所在列（0 到 COLUMNS-1） */
  playerColumn: number
  /** 子弹数组 */
  bullets: Bullet[]
  /** 敌人数组 */
  enemies: Enemy[]
  /** 道具数组 */
  powerUps: PowerUp[]
  /** 爆炸效果 */
  explosions: Explosion[]
  /** 星星背景 */
  stars: Star[]
  /** 子弹冷却计时 */
  bulletCooldown: number
  /** 自动发射计时 */
  autoFireTimer: number
  /** 敌人生成计时 */
  enemySpawnTimer: number
  /** 基础敌人速度 */
  baseEnemySpeed: number
  /** 发射模式 */
  fireMode: FireMode
  /** 是否显示模式选择界面 */
  showModeSelect: boolean
  /** 子弹等级 (1-3) */
  bulletLevel: number
  /** 射速加成 */
  fireRateBonus: number
  /** 击杀数 */
  killCount: number
}

/**
 * 太空射击游戏类
 */
export class ShooterGame extends BaseGame implements IGame {
  /* ========== 游戏元数据 ========== */
  readonly meta: GameMeta = {
    id: 'shooter',
    name: '太空射击',
    description: '经典太空射击游戏！驾驶战机消灭外星敌人，收集道具升级武器！',
    icon: '🚀',
    category: GameCategory.ACTION,
    author: 'GameHub',
    version: '1.1.0',
    tags: ['射击', '动作', '街机'],
    controls: '方向键/A/D 移动，空格发射，M 切换模式',
  }

  /* ========== 游戏配置 ========== */
  readonly config: GameConfig = {
    width: 500,
    height: 600,
    showScore: true,
    showLevel: true,
    showLives: false,
    backgroundColor: SHOOTER_COLORS.BACKGROUND,
  }

  /* ========== 射击游戏特有状态 ========== */
  private _shooterState: ShooterGameState

  /**
   * 构造函数
   */
  constructor() {
    super()
    this._shooterState = this.createShooterState()
  }

  /**
   * 创建射击游戏初始状态
   */
  private createShooterState(): ShooterGameState {
    const { width, height } = this.config
    const stars: Star[] = []

    for (let i = 0; i < 50; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 2 + 0.5,
      })
    }

    return {
      playerColumn: Math.floor(SHOOTER_CONFIG.COLUMNS / 2),
      bullets: [],
      enemies: [],
      powerUps: [],
      explosions: [],
      stars,
      bulletCooldown: 0,
      autoFireTimer: 0,
      enemySpawnTimer: 0,
      baseEnemySpeed: SHOOTER_CONFIG.ENEMY_SPEED,
      fireMode: FireMode.MANUAL,
      showModeSelect: true,
      bulletLevel: 1,
      fireRateBonus: 0,
      killCount: 0,
    }
  }

  /* ========== 重写初始化状态 ========== */
  protected createInitialState() {
    return {
      ...super.createInitialState(),
      score: 0,
      level: 1,
      lives: 0,
    }
  }

  /* ========== 重写重置 ========== */
  reset(): void {
    super.reset()
    this._shooterState = this.createShooterState()
  }

  /* ========== 更新逻辑 ========== */
  update(deltaTime: number): void {
    const state = this.getState()

    if (state.status !== 'playing') {
      return
    }

    this.updateStars()

    if (this._shooterState.showModeSelect) {
      return
    }

    if (this._shooterState.bulletCooldown > 0) {
      this._shooterState.bulletCooldown -= deltaTime
    }

    if (this._shooterState.fireMode === FireMode.AUTO) {
      this._shooterState.autoFireTimer += deltaTime
      const fireInterval = SHOOTER_CONFIG.AUTO_FIRE_INTERVAL - this._shooterState.fireRateBonus
      if (this._shooterState.autoFireTimer >= fireInterval) {
        this._shooterState.autoFireTimer = 0
        this.fireBullets()
      }
    }

    this._shooterState.enemySpawnTimer += deltaTime
    const spawnInterval = Math.max(400, SHOOTER_CONFIG.ENEMY_SPAWN_INTERVAL - this.getState().level * 50)
    if (this._shooterState.enemySpawnTimer >= spawnInterval) {
      this._shooterState.enemySpawnTimer = 0
      this.spawnEnemy()
    }

    this.updateBullets()
    this.updateEnemies()
    this.updatePowerUps()
    this.updateExplosions()
    this.checkCollisions()
  }

  /**
   * 更新星星背景
   */
  private updateStars(): void {
    const { height } = this.getCanvasSize()
    const { stars } = this._shooterState

    stars.forEach((star) => {
      star.y += star.speed
      if (star.y > height) {
        star.y = 0
        star.x = Math.random() * this.config.width
      }
    })
  }

  /**
   * 根据列索引获取玩家 x 坐标
   */
  private getPlayerX(): number {
    const { width } = this.getCanvasSize()
    const columnWidth = width / SHOOTER_CONFIG.COLUMNS
    return columnWidth / 2 + this._shooterState.playerColumn * columnWidth
  }

  /**
   * 获取玩家 y 坐标
   */
  private getPlayerY(): number {
    return this.config.height - 60
  }

  /**
   * 根据权重随机选择敌人类型
   */
  private getRandomEnemyType(): EnemyType {
    const level = this.getState().level
    const types = Object.values(EnemyType)
    const weights = types.map((type) => {
      const config = ENEMY_CONFIG[type]
      // 高等级时增加高级敌人权重
      if (type === EnemyType.ELITE || type === EnemyType.TANK) {
        return config.spawnWeight * (1 + level * 0.3)
      }
      return config.spawnWeight
    })

    const totalWeight = weights.reduce((a, b) => a + b, 0)
    let random = Math.random() * totalWeight

    for (let i = 0; i < types.length; i++) {
      random -= weights[i]
      if (random <= 0) {
        return types[i]
      }
    }

    return EnemyType.NORMAL
  }

  /**
   * 生成敌人
   */
  private spawnEnemy(): void {
    const { width } = this.getCanvasSize()
    const columnWidth = width / SHOOTER_CONFIG.COLUMNS
    const column = Math.floor(Math.random() * SHOOTER_CONFIG.COLUMNS)
    const type = this.getRandomEnemyType()
    const config = ENEMY_CONFIG[type]

    this._shooterState.enemies.push({
      x: columnWidth / 2 + column * columnWidth,
      y: -config.height,
      type,
      health: config.health,
      maxHealth: config.health,
      speed: this._shooterState.baseEnemySpeed * config.speed,
      width: config.width,
      height: config.height,
    })
  }

  /**
   * 更新子弹
   */
  private updateBullets(): void {
    const { bullets } = this._shooterState

    for (let i = bullets.length - 1; i >= 0; i--) {
      bullets[i].y -= SHOOTER_CONFIG.BULLET_SPEED
      if (bullets[i].y < -SHOOTER_CONFIG.BULLET_HEIGHT) {
        bullets.splice(i, 1)
      }
    }
  }

  /**
   * 更新敌人
   */
  private updateEnemies(): void {
    const { height } = this.getCanvasSize()
    const { enemies } = this._shooterState

    for (let i = enemies.length - 1; i >= 0; i--) {
      enemies[i].y += enemies[i].speed

      if (enemies[i].y > height) {
        this.gameOver()
        return
      }
    }
  }

  /**
   * 更新道具
   */
  private updatePowerUps(): void {
    const { height } = this.getCanvasSize()
    const { powerUps } = this._shooterState

    for (let i = powerUps.length - 1; i >= 0; i--) {
      powerUps[i].y += SHOOTER_CONFIG.POWERUP_SPEED
      if (powerUps[i].y > height) {
        powerUps.splice(i, 1)
      }
    }
  }

  /**
   * 更新爆炸效果
   */
  private updateExplosions(): void {
    const { explosions } = this._shooterState

    for (let i = explosions.length - 1; i >= 0; i--) {
      explosions[i].radius += 2
      explosions[i].alpha -= 0.04
      if (explosions[i].alpha <= 0) {
        explosions.splice(i, 1)
      }
    }
  }

  /**
   * 碰撞检测
   */
  private checkCollisions(): void {
    const { bullets, enemies, powerUps, explosions } = this._shooterState
    const playerX = this.getPlayerX()
    const playerY = this.getPlayerY()

    // 子弹与敌人碰撞
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i]
      if (!bullet) continue

      for (let j = enemies.length - 1; j >= 0; j--) {
        const enemy = enemies[j]
        if (!enemy) continue

        if (
          bullet.x - SHOOTER_CONFIG.BULLET_WIDTH / 2 < enemy.x + enemy.width / 2 &&
          bullet.x + SHOOTER_CONFIG.BULLET_WIDTH / 2 > enemy.x - enemy.width / 2 &&
          bullet.y < enemy.y + enemy.height / 2 &&
          bullet.y + SHOOTER_CONFIG.BULLET_HEIGHT > enemy.y - enemy.height / 2
        ) {
          bullets.splice(i, 1)
          enemy.health -= bullet.damage

          if (enemy.health <= 0) {
            enemies.splice(j, 1)
            const config = ENEMY_CONFIG[enemy.type]

            explosions.push({
              x: enemy.x,
              y: enemy.y,
              radius: 5,
              alpha: 1,
              color: config.color,
            })

            // 增加分数
            const newScore = this.getState().score + config.score
            this.setState({ score: newScore })
            this._shooterState.killCount++

            // 检查升级
            this.checkLevelUp()

            // 掉落道具
            if (Math.random() < SHOOTER_CONFIG.POWERUP_DROP_RATE) {
              this.spawnPowerUp(enemy.x, enemy.y)
            }

            this.emit('score', { score: newScore })
          }
          break
        }
      }
    }

    // 玩家与道具碰撞
    for (let i = powerUps.length - 1; i >= 0; i--) {
      const powerUp = powerUps[i]
      if (!powerUp) continue

      const dx = playerX - powerUp.x
      const dy = playerY - powerUp.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 30) {
        powerUps.splice(i, 1)
        this.applyPowerUp(powerUp.type)

        explosions.push({
          x: powerUp.x,
          y: powerUp.y,
          radius: 5,
          alpha: 1,
          color: POWERUP_CONFIG[powerUp.type].color,
        })
      }
    }
  }

  /**
   * 检查升级
   */
  private checkLevelUp(): void {
    const newLevel = Math.floor(this._shooterState.killCount / 10) + 1
    if (newLevel > this.getState().level) {
      this.setState({ level: newLevel })
      this._shooterState.baseEnemySpeed += SHOOTER_CONFIG.ENEMY_SPEED_INCREMENT
      this.emit('levelup', { level: newLevel })
    }
  }

  /**
   * 生成道具
   */
  private spawnPowerUp(x: number, y: number): void {
    const types = Object.values(PowerUpType)
    const type = types[Math.floor(Math.random() * types.length)]
    this._shooterState.powerUps.push({ x, y, type })
  }

  /**
   * 应用道具效果
   */
  private applyPowerUp(type: PowerUpType): void {
    switch (type) {
      case PowerUpType.BULLET_UPGRADE:
        if (this._shooterState.bulletLevel < SHOOTER_CONFIG.MAX_BULLET_LEVEL) {
          this._shooterState.bulletLevel++
        }
        break
      case PowerUpType.FIRE_RATE:
        this._shooterState.fireRateBonus = Math.min(100, this._shooterState.fireRateBonus + 20)
        break
      case PowerUpType.BOMB:
        // 清除所有敌人
        const { enemies, explosions } = this._shooterState
        enemies.forEach((enemy) => {
          explosions.push({
            x: enemy.x,
            y: enemy.y,
            radius: 5,
            alpha: 1,
            color: '#ff4444',
          })
          const newScore = this.getState().score + ENEMY_CONFIG[enemy.type].score
          this.setState({ score: newScore })
        })
        enemies.length = 0
        break
    }
  }

  /**
   * 发射子弹
   */
  private fireBullets(): void {
    const levelConfig = BULLET_LEVEL_CONFIG[this._shooterState.bulletLevel - 1]
    const adjustedCooldown = levelConfig.cooldown - this._shooterState.fireRateBonus

    if (this._shooterState.bulletCooldown > 0) return

    const { bullets } = this._shooterState
    const playerX = this.getPlayerX()
    const playerY = this.getPlayerY() - SHOOTER_CONFIG.PLAYER_HEIGHT / 2

    const spread = levelConfig.spread
    const spacing = 15

    for (let i = -spread; i <= spread; i++) {
      bullets.push({
        x: playerX + i * spacing,
        y: playerY,
        damage: levelConfig.damage,
      })
    }

    this._shooterState.bulletCooldown = Math.max(50, adjustedCooldown)
  }

  /* ========== 渲染逻辑 ========== */
  render(ctx: CanvasRenderingContext2D): void {
    const { width, height } = this.getCanvasSize()
    const { bullets, enemies, powerUps, explosions, stars } = this._shooterState
    const playerX = this.getPlayerX()
    const playerY = this.getPlayerY()

    this.clearCanvas(ctx)

    // 绘制星星背景
    ctx.fillStyle = SHOOTER_COLORS.STARS
    stars.forEach((star) => {
      ctx.globalAlpha = 0.5 + Math.random() * 0.5
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.globalAlpha = 1

    if (this._shooterState.showModeSelect && this.getState().status === 'playing') {
      this.drawModeSelect(ctx, width, height)
      return
    }

    this.drawColumnGuides(ctx, width, height)

    // 绘制道具
    powerUps.forEach((powerUp) => {
      const config = POWERUP_CONFIG[powerUp.type]
      ctx.fillStyle = config.color
      ctx.font = 'bold 20px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(config.symbol, powerUp.x, powerUp.y)
    })

    // 绘制子弹
    const bulletColor = this._shooterState.bulletLevel >= 3
      ? SHOOTER_COLORS.BULLET_UPGRADED
      : SHOOTER_COLORS.BULLET
    ctx.fillStyle = bulletColor
    bullets.forEach((bullet) => {
      ctx.beginPath()
      ctx.roundRect(
        bullet.x - SHOOTER_CONFIG.BULLET_WIDTH / 2,
        bullet.y,
        SHOOTER_CONFIG.BULLET_WIDTH,
        SHOOTER_CONFIG.BULLET_HEIGHT,
        3
      )
      ctx.fill()
    })

    // 绘制敌人
    enemies.forEach((enemy) => {
      this.drawEnemy(ctx, enemy)
    })

    // 绘制爆炸效果
    explosions.forEach((explosion) => {
      ctx.globalAlpha = explosion.alpha
      ctx.strokeStyle = explosion.color
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2)
      ctx.stroke()
    })
    ctx.globalAlpha = 1

    this.drawPlayer(ctx, playerX, playerY)
    this.drawHUD(ctx, width)

    if (this.getState().status === 'game_over') {
      this.drawGameOver(ctx, width, height)
    }
  }

  /**
   * 绘制列位置指示线
   */
  private drawColumnGuides(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const columnWidth = width / SHOOTER_CONFIG.COLUMNS
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
    ctx.lineWidth = 1

    for (let i = 0; i <= SHOOTER_CONFIG.COLUMNS; i++) {
      ctx.beginPath()
      ctx.moveTo(i * columnWidth, 0)
      ctx.lineTo(i * columnWidth, height)
      ctx.stroke()
    }
  }

  /**
   * 绘制玩家飞船
   */
  private drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const w = SHOOTER_CONFIG.PLAYER_WIDTH
    const h = SHOOTER_CONFIG.PLAYER_HEIGHT

    // 根据子弹等级改变颜色
    const colors = ['#00ff88', '#00ddff', '#ff88ff']
    ctx.fillStyle = colors[this._shooterState.bulletLevel - 1]

    ctx.beginPath()
    ctx.moveTo(x, y - h / 2)
    ctx.lineTo(x - w / 2, y + h / 2)
    ctx.lineTo(x - w / 4, y + h / 3)
    ctx.lineTo(x + w / 4, y + h / 3)
    ctx.lineTo(x + w / 2, y + h / 2)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = '#00cc66'
    ctx.beginPath()
    ctx.ellipse(x, y, w / 6, h / 4, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = SHOOTER_COLORS.PLAYER_FLAME
    const flameHeight = 8 + Math.random() * 6
    ctx.beginPath()
    ctx.moveTo(x - w / 6, y + h / 3)
    ctx.lineTo(x, y + h / 3 + flameHeight)
    ctx.lineTo(x + w / 6, y + h / 3)
    ctx.closePath()
    ctx.fill()
  }

  /**
   * 绘制敌人
   */
  private drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy): void {
    const { x, y, type, health, maxHealth, width: w, height: h } = enemy
    const config = ENEMY_CONFIG[type]

    ctx.fillStyle = config.color

    // 不同类型敌人有不同形状
    switch (type) {
      case EnemyType.FAST:
        // 三角形快速敌人
        ctx.beginPath()
        ctx.moveTo(x, y - h / 2)
        ctx.lineTo(x - w / 2, y + h / 2)
        ctx.lineTo(x + w / 2, y + h / 2)
        ctx.closePath()
        ctx.fill()
        break

      case EnemyType.TANK:
        // 方形坦克敌人
        ctx.beginPath()
        ctx.roundRect(x - w / 2, y - h / 2, w, h, 8)
        ctx.fill()
        break

      case EnemyType.ELITE:
        // 菱形精英敌人
        ctx.beginPath()
        ctx.moveTo(x, y - h / 2)
        ctx.lineTo(x + w / 2, y)
        ctx.lineTo(x, y + h / 2)
        ctx.lineTo(x - w / 2, y)
        ctx.closePath()
        ctx.fill()
        break

      default:
        // 默认UFO形状
        ctx.beginPath()
        ctx.arc(x, y, w / 2, Math.PI, 0)
        ctx.lineTo(x + w / 2, y + h / 2)
        ctx.lineTo(x - w / 2, y + h / 2)
        ctx.closePath()
        ctx.fill()
    }

    // 绘制眼睛
    if (type !== EnemyType.TANK) {
      ctx.fillStyle = SHOOTER_COLORS.ENEMY_EYE
      ctx.beginPath()
      ctx.arc(x - w / 5, y - h / 8, 3, 0, Math.PI * 2)
      ctx.arc(x + w / 5, y - h / 8, 3, 0, Math.PI * 2)
      ctx.fill()
    }

    // 绘制血条（多血量敌人）
    if (maxHealth > 1) {
      const barWidth = w
      const barHeight = 4
      const healthRatio = health / maxHealth

      ctx.fillStyle = '#333333'
      ctx.fillRect(x - barWidth / 2, y - h / 2 - 8, barWidth, barHeight)

      ctx.fillStyle = healthRatio > 0.5 ? '#00ff88' : healthRatio > 0.25 ? '#ffff00' : '#ff4444'
      ctx.fillRect(x - barWidth / 2, y - h / 2 - 8, barWidth * healthRatio, barHeight)
    }
  }

  /**
   * 绘制HUD
   */
  private drawHUD(ctx: CanvasRenderingContext2D, width: number): void {
    // 左上角 - 发射模式和等级
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(5, 5, 140, 55)

    const { fireMode, bulletLevel, fireRateBonus } = this._shooterState
    const modeText = fireMode === FireMode.AUTO ? '自动' : '手动'
    const modeColor = fireMode === FireMode.AUTO ? '#00ff88' : '#ffff00'

    ctx.fillStyle = modeColor
    ctx.font = '12px Arial'
    ctx.textAlign = 'left'
    ctx.fillText(`模式: ${modeText}`, 12, 20)

    ctx.fillStyle = '#00ffff'
    ctx.fillText(`武器: Lv.${bulletLevel}`, 12, 36)

    if (fireRateBonus > 0) {
      ctx.fillStyle = '#ffff00'
      ctx.fillText(`射速: +${fireRateBonus}%`, 12, 52)
    }

    // 右上角 - 击杀数
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(width - 85, 5, 80, 25)
    ctx.fillStyle = '#ff88ff'
    ctx.font = '12px Arial'
    ctx.textAlign = 'right'
    ctx.fillText(`击杀: ${this._shooterState.killCount}`, width - 12, 22)
  }

  /**
   * 绘制游戏结束画面
   */
  private drawGameOver(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
    ctx.fillRect(0, 0, width, height)

    ctx.fillStyle = SHOOTER_COLORS.TEXT
    ctx.font = 'bold 36px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('游戏结束', width / 2, height / 2 - 40)

    ctx.font = '20px Arial'
    ctx.fillText(`得分: ${this.getState().score}`, width / 2, height / 2 + 10)
    ctx.fillText(`击杀: ${this._shooterState.killCount}`, width / 2, height / 2 + 40)
    ctx.fillText(`武器等级: ${this._shooterState.bulletLevel}`, width / 2, height / 2 + 70)

    ctx.font = '16px Arial'
    ctx.fillStyle = '#aaaaaa'
    ctx.fillText('按 R 重新开始', width / 2, height / 2 + 110)
  }

  /**
   * 绘制模式选择界面
   */
  private drawModeSelect(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'
    ctx.fillRect(0, 0, width, height)

    ctx.fillStyle = SHOOTER_COLORS.TEXT
    ctx.font = 'bold 28px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('选择发射模式', width / 2, height / 2 - 100)

    const manualSelected = this._shooterState.fireMode === FireMode.MANUAL
    ctx.fillStyle = manualSelected ? '#00ff88' : '#666666'
    ctx.font = '20px Arial'
    ctx.fillText('[ 1 ] 手动发射', width / 2, height / 2 - 40)
    ctx.font = '14px Arial'
    ctx.fillStyle = '#aaaaaa'
    ctx.fillText('空格键发射子弹', width / 2, height / 2 - 15)

    const autoSelected = this._shooterState.fireMode === FireMode.AUTO
    ctx.fillStyle = autoSelected ? '#00ff88' : '#666666'
    ctx.font = '20px Arial'
    ctx.fillText('[ 2 ] 自动发射', width / 2, height / 2 + 30)
    ctx.font = '14px Arial'
    ctx.fillStyle = '#aaaaaa'
    ctx.fillText('自动发射，专注移动', width / 2, height / 2 + 55)

    ctx.fillStyle = SHOOTER_COLORS.TEXT
    ctx.font = '14px Arial'
    ctx.fillText('💡 收集道具升级武器！', width / 2, height / 2 + 100)

    ctx.font = '16px Arial'
    ctx.fillText('按 Enter 开始游戏', width / 2, height / 2 + 140)
  }

  /* ========== 输入处理 ========== */
  handleKeyDown(key: string): void {
    const status = this.getState().status

    if (this._shooterState.showModeSelect && status === 'playing') {
      switch (key) {
        case '1':
          this._shooterState.fireMode = FireMode.MANUAL
          break
        case '2':
          this._shooterState.fireMode = FireMode.AUTO
          break
        case 'Enter':
          this._shooterState.showModeSelect = false
          break
      }
      return
    }

    switch (key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        if (this._shooterState.playerColumn > 0) {
          this._shooterState.playerColumn--
        }
        break
      case 'ArrowRight':
      case 'd':
      case 'D':
        if (this._shooterState.playerColumn < SHOOTER_CONFIG.COLUMNS - 1) {
          this._shooterState.playerColumn++
        }
        break
      case ' ':
        if (status === 'playing' && this._shooterState.fireMode === FireMode.MANUAL) {
          this.fireBullets()
        } else if (status === 'paused') {
          this.resume()
        }
        break
      case 'm':
      case 'M':
        if (status === 'playing') {
          this._shooterState.fireMode =
            this._shooterState.fireMode === FireMode.MANUAL ? FireMode.AUTO : FireMode.MANUAL
          this._shooterState.autoFireTimer = 0
        }
        break
      case 'p':
      case 'P':
        if (status === 'playing') {
          this.pause()
        } else if (status === 'paused') {
          this.resume()
        }
        break
      case 'r':
      case 'R':
        if (status === 'game_over') {
          this.reset()
          this.start()
        }
        break
    }
  }

  handleKeyUp(_key: string): void {
    // 列移动不需要处理按键释放
  }
}