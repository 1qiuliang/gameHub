/**
 * 太空射击游戏
 * @description 经典太空射击游戏，控制飞船消灭入侵的敌人
 */

import { BaseGame, type IGame, type GameMeta, type GameConfig } from '@/core'
import { GameCategory, type Position } from '@shared/types'
import { SHOOTER_CONFIG, SHOOTER_COLORS, FireMode } from './config'

/**
 * 子弹接口
 */
interface Bullet {
  x: number
  y: number
}

/**
 * 敌人接口
 */
interface Enemy {
  x: number
  y: number
  speed: number
}

/**
 * 爆炸效果接口
 */
interface Explosion {
  x: number
  y: number
  radius: number
  alpha: number
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
}

/**
 * 太空射击游戏类
 */
export class ShooterGame extends BaseGame implements IGame {
  /* ========== 游戏元数据 ========== */
  readonly meta: GameMeta = {
    id: 'shooter',
    name: '太空射击',
    description: '经典太空射击游戏！驾驶你的战机消灭入侵的外星敌人，保卫地球！',
    icon: '🚀',
    category: GameCategory.ACTION,
    author: 'GameHub',
    version: '1.0.0',
    tags: ['射击', '动作', '街机'],
    controls: '方向键/A/D 移动，空格发射(手动模式)，M 切换发射模式',
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

    // 初始化星星背景
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
      explosions: [],
      stars,
      bulletCooldown: 0,
      autoFireTimer: 0,
      enemySpawnTimer: 0,
      baseEnemySpeed: SHOOTER_CONFIG.ENEMY_SPEED,
      fireMode: FireMode.MANUAL,
      showModeSelect: true,
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

    // 【游戏未运行时跳过】
    if (state.status !== 'playing') {
      return
    }

    // 【更新星星背景】
    this.updateStars()

    // 【显示模式选择时跳过游戏逻辑】
    if (this._shooterState.showModeSelect) {
      return
    }

    // 【更新子弹冷却】
    if (this._shooterState.bulletCooldown > 0) {
      this._shooterState.bulletCooldown -= deltaTime
    }

    // 【自动发射逻辑】
    if (this._shooterState.fireMode === FireMode.AUTO) {
      this._shooterState.autoFireTimer += deltaTime
      if (this._shooterState.autoFireTimer >= SHOOTER_CONFIG.AUTO_FIRE_INTERVAL) {
        this._shooterState.autoFireTimer = 0
        this.fireBullet()
      }
    }

    // 【更新敌人生成】
    this._shooterState.enemySpawnTimer += deltaTime
    if (this._shooterState.enemySpawnTimer >= SHOOTER_CONFIG.ENEMY_SPAWN_INTERVAL) {
      this._shooterState.enemySpawnTimer = 0
      this.spawnEnemy()
    }

    // 【更新子弹】
    this.updateBullets()

    // 【更新敌人】
    this.updateEnemies()

    // 【更新爆炸效果】
    this.updateExplosions()

    // 【碰撞检测】
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
   * 生成敌人
   */
  private spawnEnemy(): void {
    const { width } = this.getCanvasSize()
    const halfWidth = SHOOTER_CONFIG.ENEMY_WIDTH / 2

    this._shooterState.enemies.push({
      x: halfWidth + Math.random() * (width - SHOOTER_CONFIG.ENEMY_WIDTH),
      y: -SHOOTER_CONFIG.ENEMY_HEIGHT,
      speed: this._shooterState.baseEnemySpeed + Math.random() * 1.5,
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

      // 敌人到达底部，游戏结束
      if (enemies[i].y > height) {
        this.gameOver()
        return
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
      explosions[i].alpha -= 0.05
      if (explosions[i].alpha <= 0) {
        explosions.splice(i, 1)
      }
    }
  }

  /**
   * 碰撞检测
   */
  private checkCollisions(): void {
    const { bullets, enemies, explosions } = this._shooterState

    for (let i = bullets.length - 1; i >= 0; i--) {
      for (let j = enemies.length - 1; j >= 0; j--) {
        const bullet = bullets[i]
        const enemy = enemies[j]

        if (!bullet || !enemy) continue

        // 简单的矩形碰撞检测
        if (
          bullet.x - SHOOTER_CONFIG.BULLET_WIDTH / 2 < enemy.x + SHOOTER_CONFIG.ENEMY_WIDTH / 2 &&
          bullet.x + SHOOTER_CONFIG.BULLET_WIDTH / 2 > enemy.x - SHOOTER_CONFIG.ENEMY_WIDTH / 2 &&
          bullet.y < enemy.y + SHOOTER_CONFIG.ENEMY_HEIGHT / 2 &&
          bullet.y + SHOOTER_CONFIG.BULLET_HEIGHT > enemy.y - SHOOTER_CONFIG.ENEMY_HEIGHT / 2
        ) {
          // 移除子弹和敌人
          bullets.splice(i, 1)
          enemies.splice(j, 1)

          // 添加爆炸效果
          explosions.push({
            x: enemy.x,
            y: enemy.y,
            radius: 5,
            alpha: 1,
          })

          // 增加分数
          const newScore = this.getState().score + 10
          this.setState({ score: newScore })

          // 升级检查
          const newLevel = Math.floor(newScore / 100) + 1
          if (newLevel > this.getState().level) {
            this.setState({ level: newLevel })
            this._shooterState.baseEnemySpeed += SHOOTER_CONFIG.ENEMY_SPEED_INCREMENT
          }

          this.emit('score', { score: newScore })
          break
        }
      }
    }
  }

  /**
   * 发射子弹
   */
  private fireBullet(): void {
    if (this._shooterState.bulletCooldown > 0) return

    const { player, bullets } = this._shooterState
    bullets.push({
      x: player.x,
      y: player.y - SHOOTER_CONFIG.PLAYER_HEIGHT / 2,
    })

    this._shooterState.bulletCooldown = SHOOTER_CONFIG.BULLET_COOLDOWN
  }

  /* ========== 渲染逻辑 ========== */
  render(ctx: CanvasRenderingContext2D): void {
    const { width, height } = this.getCanvasSize()
    const { player, bullets, enemies, explosions, stars } = this._shooterState

    // 【清空画布】
    this.clearCanvas(ctx)

    // 【绘制星星背景】
    ctx.fillStyle = SHOOTER_COLORS.STARS
    stars.forEach((star) => {
      ctx.globalAlpha = 0.5 + Math.random() * 0.5
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.globalAlpha = 1

    // 【显示模式选择界面】
    if (this._shooterState.showModeSelect && this.getState().status === 'playing') {
      this.drawModeSelect(ctx, width, height)
      return
    }

    // 【绘制子弹】
    ctx.fillStyle = SHOOTER_COLORS.BULLET
    bullets.forEach((bullet) => {
      ctx.beginPath()
      ctx.roundRect(
        bullet.x - SHOOTER_CONFIG.BULLET_WIDTH / 2,
        bullet.y,
        SHOOTER_CONFIG.BULLET_WIDTH,
        SHOOTER_CONFIG.BULLET_HEIGHT,
        2
      )
      ctx.fill()
    })

    // 【绘制敌人】
    enemies.forEach((enemy) => {
      this.drawEnemy(ctx, enemy.x, enemy.y)
    })

    // 【绘制爆炸效果】
    explosions.forEach((explosion) => {
      ctx.globalAlpha = explosion.alpha
      ctx.strokeStyle = SHOOTER_COLORS.EXPLOSION
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2)
      ctx.stroke()
    })
    ctx.globalAlpha = 1

    // 【绘制玩家飞船】
    this.drawPlayer(ctx, player.x, player.y)

    // 【绘制发射模式指示】
    this.drawFireModeIndicator(ctx, width)

    // 【绘制游戏结束画面】
    if (this.getState().status === 'game_over') {
      this.drawGameOver(ctx, width, height)
    }
  }

  /**
   * 绘制玩家飞船
   */
  private drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const w = SHOOTER_CONFIG.PLAYER_WIDTH
    const h = SHOOTER_CONFIG.PLAYER_HEIGHT

    ctx.fillStyle = SHOOTER_COLORS.PLAYER

    // 飞船主体
    ctx.beginPath()
    ctx.moveTo(x, y - h / 2)
    ctx.lineTo(x - w / 2, y + h / 2)
    ctx.lineTo(x - w / 4, y + h / 3)
    ctx.lineTo(x + w / 4, y + h / 3)
    ctx.lineTo(x + w / 2, y + h / 2)
    ctx.closePath()
    ctx.fill()

    // 飞船座舱
    ctx.fillStyle = '#00cc66'
    ctx.beginPath()
    ctx.ellipse(x, y, w / 6, h / 4, 0, 0, Math.PI * 2)
    ctx.fill()

    // 引擎火焰
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
  private drawEnemy(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const w = SHOOTER_CONFIG.ENEMY_WIDTH
    const h = SHOOTER_CONFIG.ENEMY_HEIGHT

    // 敌人主体（外星人飞船形状）
    ctx.fillStyle = SHOOTER_COLORS.ENEMY
    ctx.beginPath()
    // 顶部圆弧
    ctx.arc(x, y, w / 2, Math.PI, 0)
    // 底部
    ctx.lineTo(x + w / 2, y + h / 2)
    ctx.lineTo(x - w / 2, y + h / 2)
    ctx.closePath()
    ctx.fill()

    // 眼睛
    ctx.fillStyle = SHOOTER_COLORS.ENEMY_EYE
    ctx.beginPath()
    ctx.arc(x - w / 5, y - h / 6, 4, 0, Math.PI * 2)
    ctx.arc(x + w / 5, y - h / 6, 4, 0, Math.PI * 2)
    ctx.fill()

    // 瞳孔
    ctx.fillStyle = '#000000'
    ctx.beginPath()
    ctx.arc(x - w / 5, y - h / 6, 2, 0, Math.PI * 2)
    ctx.arc(x + w / 5, y - h / 6, 2, 0, Math.PI * 2)
    ctx.fill()
  }

  /**
   * 绘制游戏结束画面
   */
  private drawGameOver(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(0, 0, width, height)

    ctx.fillStyle = SHOOTER_COLORS.TEXT
    ctx.font = 'bold 36px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('游戏结束', width / 2, height / 2 - 20)

    ctx.font = '18px Arial'
    ctx.fillText(`最终得分: ${this.getState().score}`, width / 2, height / 2 + 20)
    ctx.fillText('按 R 重新开始', width / 2, height / 2 + 50)
  }

  /**
   * 绘制模式选择界面
   */
  private drawModeSelect(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
    ctx.fillRect(0, 0, width, height)

    ctx.fillStyle = SHOOTER_COLORS.TEXT
    ctx.font = 'bold 28px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('选择发射模式', width / 2, height / 2 - 80)

    // 手动模式选项
    const manualSelected = this._shooterState.fireMode === FireMode.MANUAL
    ctx.fillStyle = manualSelected ? '#00ff88' : '#666666'
    ctx.font = '20px Arial'
    ctx.fillText('[ 1 ] 手动发射', width / 2, height / 2 - 20)
    ctx.font = '14px Arial'
    ctx.fillStyle = '#aaaaaa'
    ctx.fillText('空格键发射子弹', width / 2, height / 2 + 5)

    // 自动模式选项
    const autoSelected = this._shooterState.fireMode === FireMode.AUTO
    ctx.fillStyle = autoSelected ? '#00ff88' : '#666666'
    ctx.font = '20px Arial'
    ctx.fillText('[ 2 ] 自动发射', width / 2, height / 2 + 50)
    ctx.font = '14px Arial'
    ctx.fillStyle = '#aaaaaa'
    ctx.fillText('自动发射子弹，专注移动', width / 2, height / 2 + 75)

    // 确认提示
    ctx.fillStyle = SHOOTER_COLORS.TEXT
    ctx.font = '16px Arial'
    ctx.fillText('按 Enter 确认开始游戏', width / 2, height / 2 + 130)
  }

  /**
   * 绘制发射模式指示器
   */
  private drawFireModeIndicator(ctx: CanvasRenderingContext2D, width: number): void {
    const { fireMode } = this._shooterState
    const modeText = fireMode === FireMode.AUTO ? '自动发射' : '手动发射'
    const modeColor = fireMode === FireMode.AUTO ? '#00ff88' : '#ffff00'

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(5, 5, 120, 25)

    ctx.fillStyle = modeColor
    ctx.font = '14px Arial'
    ctx.textAlign = 'left'
    ctx.fillText(modeText, 12, 22)

    ctx.fillStyle = '#888888'
    ctx.font = '10px Arial'
    ctx.fillText('按 M 切换', 12, 50)
  }

  /* ========== 输入处理 ========== */
  handleKeyDown(key: string): void {
    const status = this.getState().status

    // 【模式选择界面按键】
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

    // 【移动控制】
    switch (key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        this._shooterState.moveDirection.left = true
        break
      case 'ArrowRight':
      case 'd':
      case 'D':
        this._shooterState.moveDirection.right = true
        break
      case ' ':
        // 手动模式下空格发射子弹
        if (status === 'playing' && this._shooterState.fireMode === FireMode.MANUAL) {
          this.fireBullet()
        } else if (status === 'paused') {
          this.resume()
        }
        break
      case 'm':
      case 'M':
        // M键切换发射模式
        if (status === 'playing') {
          this._shooterState.fireMode =
            this._shooterState.fireMode === FireMode.MANUAL ? FireMode.AUTO : FireMode.MANUAL
          this._shooterState.autoFireTimer = 0
        }
        break
      case 'p':
      case 'P':
        // P键暂停
        if (status === 'playing') {
          this.pause()
        } else if (status === 'paused') {
          this.resume()
        }
        break
      case 'r':
      case 'R':
        // R键重新开始
        if (status === 'game_over') {
          this.reset()
          this.start()
        }
        break
    }
  }

  handleKeyUp(key: string): void {
    switch (key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        this._shooterState.moveDirection.left = false
        break
      case 'ArrowRight':
      case 'd':
      case 'D':
        this._shooterState.moveDirection.right = false
        break
    }
  }
}