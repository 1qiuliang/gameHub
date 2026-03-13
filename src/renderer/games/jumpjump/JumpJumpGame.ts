/**
 * 跳一跳游戏
 * @description 微信跳一跳风格的蓄力跳跃游戏
 */

import { BaseGame, type IGame, type GameMeta, type GameConfig } from '@/core'
import { GameCategory } from '@shared/types'
import { JUMPJUMP_CONFIG, JUMPJUMP_COLORS } from './config'

/**
 * 平台状态
 */
interface Platform {
  x: number
  y: number
  width: number
  color: string
}

/**
 * 玩家状态
 */
interface Player {
  x: number
  y: number
  vx: number
  vy: number
  onGround: boolean
  jumping: boolean
}

/**
 * 游戏状态
 */
interface JumpJumpGameState {
  player: Player
  platforms: Platform[]
  power: number
  charging: boolean
  cameraY: number
  score: number
  lastPlatformIndex: number
}

/**
 * 跳一跳游戏类
 */
export class JumpJumpGame extends BaseGame implements IGame {
  /* ========== 游戏元数据 ========== */
  readonly meta: GameMeta = {
    id: 'jumpjump',
    name: '跳一跳',
    description: '长按蓄力，跳跃到下一个平台。按得越久跳得越远！',
    icon: '🦘',
    category: GameCategory.ACTION,
    author: 'GameHub',
    version: '1.0.0',
    tags: ['反应', '休闲', '街机'],
    controls: '长按空格或鼠标蓄力，松开跳跃',
  }

  /* ========== 游戏配置 ========== */
  readonly config: GameConfig = {
    width: 400,
    height: 600,
    showScore: true,
    showLevel: false,
    showLives: false,
    backgroundColor: JUMPJUMP_COLORS.BACKGROUND,
  }

  /* ========== 跳一跳特有状态 ========== */
  private _gameState: JumpJumpGameState

  constructor() {
    super()
    this._gameState = this.createGameState()
  }

  /**
   * 创建初始状态
   */
  private createGameState(): JumpJumpGameState {
    const { width } = this.config
    const { PLATFORM_MIN_WIDTH, PLATFORM_MAX_WIDTH, PLATFORM_HEIGHT } = JUMPJUMP_CONFIG

    // 创建初始平台
    const platforms: Platform[] = [
      {
        x: width / 2 - 50,
        y: this.config.height - 100,
        width: 100,
        color: JUMPJUMP_COLORS.PLATFORMS[0],
      },
    ]

    // 生成更多平台
    for (let i = 1; i < 10; i++) {
      platforms.push(this.generatePlatform(platforms[i - 1], i))
    }

    return {
      player: {
        x: width / 2,
        y: this.config.height - 100 - JUMPJUMP_CONFIG.PLAYER_SIZE,
        vx: 0,
        vy: 0,
        onGround: true,
        jumping: false,
      },
      platforms,
      power: 0,
      charging: false,
      cameraY: 0,
      score: 0,
      lastPlatformIndex: 0,
    }
  }

  /**
   * 生成新平台
   */
  private generatePlatform(prevPlatform: Platform, index: number): Platform {
    const { width } = this.config
    const { PLATFORM_MIN_WIDTH, PLATFORM_MAX_WIDTH, PLATFORM_HEIGHT, PLATFORM_GAP_MIN, PLATFORM_GAP_MAX } =
      JUMPJUMP_CONFIG

    const gap = PLATFORM_GAP_MIN + Math.random() * (PLATFORM_GAP_MAX - PLATFORM_GAP_MIN)
    const newWidth = PLATFORM_MIN_WIDTH + Math.random() * (PLATFORM_MAX_WIDTH - PLATFORM_MIN_WIDTH)

    // 随机方向（左或右）
    const direction = Math.random() > 0.5 ? 1 : -1
    let newX = prevPlatform.x + direction * gap

    // 边界检查
    newX = Math.max(0, Math.min(width - newWidth, newX))

    return {
      x: newX,
      y: prevPlatform.y - 100,
      width: newWidth,
      color: JUMPJUMP_COLORS.PLATFORMS[index % JUMPJUMP_COLORS.PLATFORMS.length],
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
    this._gameState = this.createGameState()
  }

  /* ========== 更新逻辑 ========== */
  update(_deltaTime: number): void {
    const state = this.getState()
    if (state.status !== 'playing') return

    this.updatePlayer()
    this.updateCamera()

    if (this._gameState.charging) {
      this.updatePower()
    }
  }

  /**
   * 更新玩家
   */
  private updatePlayer(): void {
    const { player, platforms } = this._gameState
    const { GRAVITY, PLAYER_SIZE, PLATFORM_HEIGHT } = JUMPJUMP_CONFIG
    const { height } = this.config

    if (player.jumping) {
      // 应用重力
      player.vy += GRAVITY
      player.x += player.vx
      player.y += player.vy

      // 检查平台碰撞
      for (let i = 0; i < platforms.length; i++) {
        const platform = platforms[i]
        const platformScreenY = platform.y - this._gameState.cameraY

        // 只检测下落时的碰撞
        if (player.vy > 0) {
          const playerBottom = player.y + PLAYER_SIZE
          const playerCenterX = player.x

          if (
            playerBottom >= platformScreenY &&
            playerBottom <= platformScreenY + PLATFORM_HEIGHT + player.vy &&
            playerCenterX >= platform.x &&
            playerCenterX <= platform.x + platform.width
          ) {
            // 落在平台上
            player.y = platformScreenY - PLAYER_SIZE
            player.vy = 0
            player.vx = 0
            player.onGround = true
            player.jumping = false

            // 计分
            if (i > this._gameState.lastPlatformIndex) {
              const points = i - this._gameState.lastPlatformIndex
              const newScore = this.getState().score + points
              this.setState({ score: newScore })
              this.emit('score', { score: newScore })
              this._gameState.lastPlatformIndex = i
            }
            break
          }
        }
      }

      // 检查是否掉落
      if (player.y > height + 100) {
        this.gameOver()
      }
    }
  }

  /**
   * 更新相机
   */
  private updateCamera(): void {
    const { player, platforms, cameraY } = this._gameState

    // 当玩家跳到一定高度时，相机跟随
    const targetCameraY = player.y + cameraY - this.config.height * 0.6
    if (targetCameraY < cameraY) {
      this._gameState.cameraY += (targetCameraY - cameraY) * 0.1
    }

    // 生成新平台
    const lastPlatform = platforms[platforms.length - 1]
    if (lastPlatform.y - cameraY > -200) {
      platforms.push(this.generatePlatform(lastPlatform, platforms.length))
    }

    // 移除屏幕下方的平台
    while (platforms.length > 0 && platforms[0].y - cameraY > this.config.height + 100) {
      platforms.shift()
      this._gameState.lastPlatformIndex = Math.max(0, this._gameState.lastPlatformIndex - 1)
    }
  }

  /**
   * 更新蓄力
   */
  private updatePower(): void {
    const { power } = this._gameState
    if (power < JUMPJUMP_CONFIG.MAX_POWER) {
      this._gameState.power += 1
    }
  }

  /**
   * 执行跳跃
   */
  private jump(): void {
    const { player, power } = this._gameState
    if (!player.onGround || player.jumping) return

    const { JUMP_POWER_FACTOR, MAX_POWER } = JUMPJUMP_CONFIG
    const jumpPower = power * JUMP_POWER_FACTOR

    // 向右上方跳跃
    player.vx = jumpPower * 1.2
    player.vy = -jumpPower * 0.8
    player.onGround = false
    player.jumping = true
    this._gameState.power = 0
    this._gameState.charging = false
  }

  /* ========== 渲染逻辑 ========== */
  render(ctx: CanvasRenderingContext2D): void {
    const { width, height } = this.config
    const { player, platforms, power, cameraY } = this._gameState
    const { PLAYER_SIZE, PLATFORM_HEIGHT } = JUMPJUMP_CONFIG

    // 清空画布
    ctx.fillStyle = JUMPJUMP_COLORS.BACKGROUND
    ctx.fillRect(0, 0, width, height)

    // 绘制平台
    for (const platform of platforms) {
      const screenY = platform.y - cameraY
      if (screenY > height + 50 || screenY < -50) continue

      ctx.fillStyle = platform.color
      ctx.fillRect(platform.x, screenY, platform.width, PLATFORM_HEIGHT)

      // 平台阴影
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
      ctx.fillRect(platform.x + 3, screenY + PLATFORM_HEIGHT, platform.width, 5)
    }

    // 绘制玩家
    ctx.fillStyle = JUMPJUMP_COLORS.PLAYER
    ctx.beginPath()
    ctx.arc(player.x, player.y + PLAYER_SIZE / 2, PLAYER_SIZE / 2, 0, Math.PI * 2)
    ctx.fill()

    // 玩家眼睛
    ctx.fillStyle = JUMPJUMP_COLORS.PLAYER_EYE
    ctx.beginPath()
    ctx.arc(player.x + 5, player.y + PLAYER_SIZE / 2 - 3, 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(player.x + 5, player.y + PLAYER_SIZE / 2 + 3, 4, 0, Math.PI * 2)
    ctx.fill()

    // 绘制蓄力条
    if (this._gameState.charging && power > 0) {
      const barWidth = 100
      const barHeight = 15
      const barX = (width - barWidth) / 2
      const barY = height - 50

      ctx.fillStyle = JUMPJUMP_COLORS.POWER_BAR_BG
      ctx.fillRect(barX, barY, barWidth, barHeight)

      ctx.fillStyle = JUMPJUMP_COLORS.POWER_BAR
      ctx.fillRect(barX, barY, (power / JUMPJUMP_CONFIG.MAX_POWER) * barWidth, barHeight)

      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.strokeRect(barX, barY, barWidth, barHeight)
    }

    // 提示
    if (player.onGround && !this._gameState.charging) {
      ctx.fillStyle = JUMPJUMP_COLORS.TEXT
      ctx.font = '16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('长按蓄力', width / 2, height - 30)
    }
  }

  /* ========== 输入处理 ========== */
  handleKeyDown(key: string): void {
    const state = this.getState()
    if (state.status !== 'playing') return

    if (key === ' ' && !this._gameState.charging && this._gameState.player.onGround) {
      this._gameState.charging = true
    }
  }

  handleKeyUp(key: string): void {
    if (key === ' ' && this._gameState.charging) {
      this.jump()
    }
  }

  /**
   * 处理鼠标按下
   */
  handleMouseDown(): void {
    const state = this.getState()
    if (state.status !== 'playing') return

    if (!this._gameState.charging && this._gameState.player.onGround) {
      this._gameState.charging = true
    }
  }

  /**
   * 处理鼠标释放
   */
  handleMouseUp(): void {
    if (this._gameState.charging) {
      this.jump()
    }
  }
}