/**
 * 打砖块游戏
 * @description 经典打砖块游戏的实现
 */

import { BaseGame, type IGame, type GameMeta, type GameConfig } from '@/core'
import { GameCategory } from '@shared/types'
import { BREAKOUT_CONFIG, BREAKOUT_COLORS } from './config'

/**
 * 砖块状态
 */
interface Brick {
  x: number
  y: number
  width: number
  height: number
  alive: boolean
  color: string
  points: number
}

/**
 * 小球状态
 */
interface Ball {
  x: number
  y: number
  dx: number
  dy: number
  radius: number
}

/**
 * 挡板状态
 */
interface Paddle {
  x: number
  width: number
  height: number
}

/**
 * 游戏状态
 */
interface BreakoutGameState {
  ball: Ball
  paddle: Paddle
  bricks: Brick[]
  leftPressed: boolean
  rightPressed: boolean
}

/**
 * 打砖块游戏类
 */
export class BreakoutGame extends BaseGame implements IGame {
  /* ========== 游戏元数据 ========== */
  readonly meta: GameMeta = {
    id: 'breakout',
    name: '打砖块',
    description: '经典的打砖块游戏，控制挡板弹球击碎所有砖块。小心不要让球掉下去！',
    icon: '🧱',
    category: GameCategory.CLASSIC,
    author: 'GameHub',
    version: '1.0.0',
    tags: ['经典', '休闲', '街机'],
    controls: '使用方向键左右或 A/D 键移动挡板',
  }

  /* ========== 游戏配置 ========== */
  readonly config: GameConfig = {
    width: 600,
    height: 500,
    showScore: true,
    showLevel: true,
    showLives: true,
    backgroundColor: BREAKOUT_COLORS.BACKGROUND,
  }

  /* ========== 打砖块特有状态 ========== */
  private _gameState: BreakoutGameState

  constructor() {
    super()
    this._gameState = this.createBreakoutState()
  }

  /**
   * 创建打砖块初始状态
   */
  private createBreakoutState(): BreakoutGameState {
    const { width } = this.config
    const { PADDLE_WIDTH, PADDLE_HEIGHT, BALL_RADIUS, BALL_SPEED } = BREAKOUT_CONFIG

    return {
      ball: {
        x: width / 2,
        y: this.config.height - 50,
        dx: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
        dy: -BALL_SPEED,
        radius: BALL_RADIUS,
      },
      paddle: {
        x: (width - PADDLE_WIDTH) / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
      },
      bricks: this.createBricks(),
      leftPressed: false,
      rightPressed: false,
    }
  }

  /**
   * 创建砖块阵列
   */
  private createBricks(): Brick[] {
    const { width } = this.config
    const { BRICK_ROWS, BRICK_COLS, BRICK_HEIGHT, BRICK_PADDING, BRICK_OFFSET_TOP } =
      BREAKOUT_CONFIG

    const brickWidth =
      (width - BRICK_PADDING * (BRICK_COLS + 1)) / BRICK_COLS
    const bricks: Brick[] = []

    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        bricks.push({
          x: col * (brickWidth + BRICK_PADDING) + BRICK_PADDING,
          y: row * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP,
          width: brickWidth,
          height: BRICK_HEIGHT,
          alive: true,
          color: BREAKOUT_COLORS.BRICKS[row % BREAKOUT_COLORS.BRICKS.length],
          points: (BRICK_ROWS - row) * 10,
        })
      }
    }

    return bricks
  }

  /* ========== 重写初始化状态 ========== */
  protected createInitialState() {
    return {
      ...super.createInitialState(),
      score: 0,
      level: 1,
      lives: BREAKOUT_CONFIG.INITIAL_LIVES,
    }
  }

  /* ========== 重写重置 ========== */
  reset(): void {
    super.reset()
    this._gameState = this.createBreakoutState()
  }

  /* ========== 更新逻辑 ========== */
  update(deltaTime: number): void {
    const state = this.getState()

    if (state.status !== 'playing') {
      return
    }

    // 限制最大帧时间，防止切换标签页后瞬移
    const dt = Math.min(deltaTime, 32) / 16

    this.movePaddle(dt)
    this.moveBall(dt)
    this.checkCollisions()
  }

  /**
   * 移动挡板
   */
  private movePaddle(dt: number): void {
    const { paddle, leftPressed, rightPressed } = this._gameState
    const { width } = this.config
    const { PADDLE_SPEED } = BREAKOUT_CONFIG

    if (leftPressed && paddle.x > 0) {
      paddle.x -= PADDLE_SPEED * dt
    }
    if (rightPressed && paddle.x + paddle.width < width) {
      paddle.x += PADDLE_SPEED * dt
    }
  }

  /**
   * 移动小球
   */
  private moveBall(dt: number): void {
    const { ball, paddle } = this._gameState
    const { width, height } = this.config

    ball.x += ball.dx * dt
    ball.y += ball.dy * dt

    // 左右墙壁碰撞
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > width) {
      ball.dx = -ball.dx
      ball.x = Math.max(ball.radius, Math.min(width - ball.radius, ball.x))
    }

    // 顶部墙壁碰撞
    if (ball.y - ball.radius < 0) {
      ball.dy = -ball.dy
      ball.y = ball.radius
    }

    // 底部 - 失去生命
    if (ball.y + ball.radius > height) {
      this.loseLife()
    }

    // 挡板碰撞
    if (
      ball.y + ball.radius > height - paddle.height - 10 &&
      ball.y + ball.radius < height - 10 &&
      ball.x > paddle.x &&
      ball.x < paddle.x + paddle.width
    ) {
      // 根据碰撞位置调整角度
      const hitPos = (ball.x - paddle.x) / paddle.width
      const angle = (hitPos - 0.5) * Math.PI * 0.6 // -54° to 54°
      const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy)

      ball.dx = Math.sin(angle) * speed
      ball.dy = -Math.abs(Math.cos(angle) * speed)
      ball.y = height - paddle.height - 10 - ball.radius
    }
  }

  /**
   * 检查碰撞
   */
  private checkCollisions(): void {
    const { ball, bricks } = this._gameState

    for (const brick of bricks) {
      if (!brick.alive) continue

      if (
        ball.x + ball.radius > brick.x &&
        ball.x - ball.radius < brick.x + brick.width &&
        ball.y + ball.radius > brick.y &&
        ball.y - ball.radius < brick.y + brick.height
      ) {
        brick.alive = false
        ball.dy = -ball.dy

        // 加分
        const newScore = this.getState().score + brick.points
        this.setState({ score: newScore })
        this.emit('score', { score: newScore })

        // 检查是否清空所有砖块
        if (bricks.every((b) => !b.alive)) {
          this.nextLevel()
        }
        break
      }
    }
  }

  /**
   * 失去生命
   */
  private loseLife(): void {
    const currentLives = this.getState().lives - 1
    this.setState({ lives: currentLives })

    if (currentLives <= 0) {
      this.gameOver()
    } else {
      // 重置小球和挡板位置
      this.resetBallAndPaddle()
    }
  }

  /**
   * 重置小球和挡板
   */
  private resetBallAndPaddle(): void {
    const { width } = this.config
    const { PADDLE_WIDTH, BALL_RADIUS, BALL_SPEED } = BREAKOUT_CONFIG

    this._gameState.ball = {
      x: width / 2,
      y: this.config.height - 50,
      dx: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
      dy: -BALL_SPEED,
      radius: BALL_RADIUS,
    }

    this._gameState.paddle.x = (width - PADDLE_WIDTH) / 2
  }

  /**
   * 下一关
   */
  private nextLevel(): void {
    const newLevel = this.getState().level + 1
    this.setState({ level: newLevel })
    this.emit('levelup', { level: newLevel })

    // 重置砖块
    this._gameState.bricks = this.createBricks()
    this.resetBallAndPaddle()

    // 稍微加速
    const speed = this._gameState.ball.dx > 0 ? 1 : -1
    this._gameState.ball.dx = speed * (BREAKOUT_CONFIG.BALL_SPEED + newLevel * 0.5)
    this._gameState.ball.dy = -(BREAKOUT_CONFIG.BALL_SPEED + newLevel * 0.5)
  }

  /* ========== 渲染逻辑 ========== */
  render(ctx: CanvasRenderingContext2D): void {
    const { ball, paddle, bricks } = this._gameState
    const { height } = this.config

    // 清空画布
    this.clearCanvas(ctx)

    // 绘制砖块
    for (const brick of bricks) {
      if (!brick.alive) continue

      ctx.fillStyle = brick.color
      ctx.beginPath()
      ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 4)
      ctx.fill()

      // 砖块高光
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.fillRect(brick.x, brick.y, brick.width, brick.height / 3)
    }

    // 绘制挡板
    ctx.fillStyle = BREAKOUT_COLORS.PADDLE
    ctx.beginPath()
    ctx.roundRect(paddle.x, height - paddle.height - 10, paddle.width, paddle.height, 5)
    ctx.fill()

    // 挡板高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.fillRect(paddle.x, height - paddle.height - 10, paddle.width, paddle.height / 2)

    // 绘制小球
    ctx.fillStyle = BREAKOUT_COLORS.BALL
    ctx.beginPath()
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
    ctx.fill()

    // 小球光晕
    const gradient = ctx.createRadialGradient(
      ball.x - ball.radius / 3,
      ball.y - ball.radius / 3,
      0,
      ball.x,
      ball.y,
      ball.radius
    )
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
    ctx.fill()
  }

  /* ========== 输入处理 ========== */
  handleKeyDown(key: string): void {
    const state = this.getState()

    switch (key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        this._gameState.leftPressed = true
        break
      case 'ArrowRight':
      case 'd':
      case 'D':
        this._gameState.rightPressed = true
        break
      case ' ':
        if (state.status === 'playing') {
          this.pause()
        } else if (state.status === 'paused') {
          this.resume()
        }
        break
    }
  }

  handleKeyUp(key: string): void {
    switch (key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        this._gameState.leftPressed = false
        break
      case 'ArrowRight':
      case 'd':
      case 'D':
        this._gameState.rightPressed = false
        break
    }
  }
}