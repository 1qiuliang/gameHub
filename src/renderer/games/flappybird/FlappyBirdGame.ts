/**
 * Flappy Bird 游戏
 * @description 经典 Flappy Bird 游戏的实现
 */

import { BaseGame, type IGame, type GameMeta, type GameConfig } from '@/core'
import { GameCategory } from '@shared/types'
import { FLAPPY_CONFIG, FLAPPY_COLORS } from './config'

/**
 * 小鸟状态
 */
interface Bird {
  x: number
  y: number
  velocity: number
  rotation: number
}

/**
 * 管道状态
 */
interface Pipe {
  x: number
  gapY: number
  passed: boolean
}

/**
 * 游戏状态
 */
interface FlappyGameState {
  bird: Bird
  pipes: Pipe[]
  groundOffset: number
  started: boolean
}

/**
 * Flappy Bird 游戏类
 */
export class FlappyBirdGame extends BaseGame implements IGame {
  /* ========== 游戏元数据 ========== */
  readonly meta: GameMeta = {
    id: 'flappybird',
    name: 'Flappy Bird',
    description: '经典 Flappy Bird 游戏，点击或按空格让小鸟跳跃，躲避管道障碍！',
    icon: '🐦',
    category: GameCategory.ACTION,
    author: 'GameHub',
    version: '1.0.0',
    tags: ['动作', '休闲', '反应'],
    controls: '点击屏幕或按空格键让小鸟跳跃',
  }

  /* ========== 游戏配置 ========== */
  readonly config: GameConfig = {
    width: 400,
    height: 600,
    showScore: true,
    showLevel: false,
    showLives: false,
    backgroundColor: FLAPPY_COLORS.BACKGROUND,
  }

  /* ========== Flappy Bird 特有状态 ========== */
  private _gameState: FlappyGameState

  constructor() {
    super()
    this._gameState = this.createFlappyState()
  }

  /**
   * 创建初始状态
   */
  private createFlappyState(): FlappyGameState {
    return {
      bird: {
        x: 80,
        y: this.config.height / 2,
        velocity: 0,
        rotation: 0,
      },
      pipes: [],
      groundOffset: 0,
      started: false,
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
    this._gameState = this.createFlappyState()
  }

  /* ========== 更新逻辑 ========== */
  update(deltaTime: number): void {
    const state = this.getState()

    if (state.status !== 'playing') {
      return
    }

    // 游戏未开始时，小鸟悬浮
    if (!this._gameState.started) {
      return
    }

    // 限制最大帧时间，防止切换标签页后瞬移
    const dt = Math.min(deltaTime, 32) / 16

    this.updateBird(dt)
    this.updatePipes(dt)
    this.updateGround(dt)
    this.checkCollisions()
  }

  /**
   * 更新小鸟
   */
  private updateBird(dt: number): void {
    const { bird } = this._gameState
    const { GRAVITY, BIRD_SIZE } = FLAPPY_CONFIG
    const { height } = this.config
    const groundY = height - FLAPPY_CONFIG.GROUND_HEIGHT

    // 应用重力
    bird.velocity += GRAVITY * dt
    bird.y += bird.velocity * dt

    // 旋转角度根据速度
    bird.rotation = Math.min(Math.max(bird.velocity * 3, -30), 90)

    // 检查地面碰撞
    if (bird.y + BIRD_SIZE / 2 > groundY) {
      bird.y = groundY - BIRD_SIZE / 2
      this.gameOver()
    }

    // 检查顶部
    if (bird.y - BIRD_SIZE / 2 < 0) {
      bird.y = BIRD_SIZE / 2
      bird.velocity = 0
    }
  }

  /**
   * 更新管道
   */
  private updatePipes(dt: number): void {
    const { pipes } = this._gameState
    const { PIPE_SPEED, PIPE_SPAWN_INTERVAL, PIPE_GAP, PIPE_WIDTH } = FLAPPY_CONFIG
    const { width, height } = this.config
    const groundY = height - FLAPPY_CONFIG.GROUND_HEIGHT

    // 移动管道
    for (const pipe of pipes) {
      pipe.x -= PIPE_SPEED * dt
    }

    // 移除屏幕外的管道
    while (pipes.length > 0 && pipes[0].x + PIPE_WIDTH < 0) {
      pipes.shift()
    }

    // 生成新管道
    const lastPipe = pipes[pipes.length - 1]
    if (!lastPipe || lastPipe.x < width - PIPE_SPAWN_INTERVAL) {
      const minGapY = PIPE_GAP / 2 + 50
      const maxGapY = groundY - PIPE_GAP / 2 - 50
      pipes.push({
        x: width,
        gapY: minGapY + Math.random() * (maxGapY - minGapY),
        passed: false,
      })
    }

    // 检查得分
    for (const pipe of pipes) {
      if (!pipe.passed && pipe.x + PIPE_WIDTH < this._gameState.bird.x) {
        pipe.passed = true
        const newScore = this.getState().score + 1
        this.setState({ score: newScore })
        this.emit('score', { score: newScore })
      }
    }
  }

  /**
   * 更新地面
   */
  private updateGround(dt: number): void {
    this._gameState.groundOffset += FLAPPY_CONFIG.PIPE_SPEED * dt
    if (this._gameState.groundOffset >= 24) {
      this._gameState.groundOffset = 0
    }
  }

  /**
   * 检查碰撞
   */
  private checkCollisions(): void {
    const { bird, pipes } = this._gameState
    const { BIRD_SIZE, PIPE_WIDTH, PIPE_GAP } = FLAPPY_CONFIG

    for (const pipe of pipes) {
      // 小鸟边界框
      const birdLeft = bird.x - BIRD_SIZE / 2 + 5
      const birdRight = bird.x + BIRD_SIZE / 2 - 5
      const birdTop = bird.y - BIRD_SIZE / 2 + 5
      const birdBottom = bird.y + BIRD_SIZE / 2 - 5

      // 管道边界框
      const pipeLeft = pipe.x
      const pipeRight = pipe.x + PIPE_WIDTH
      const gapTop = pipe.gapY - PIPE_GAP / 2
      const gapBottom = pipe.gapY + PIPE_GAP / 2

      // 检查是否在管道x范围内
      if (birdRight > pipeLeft && birdLeft < pipeRight) {
        // 检查是否碰到上管道或下管道
        if (birdTop < gapTop || birdBottom > gapBottom) {
          this.gameOver()
          return
        }
      }
    }
  }

  /**
   * 跳跃
   */
  private jump(): void {
    if (!this._gameState.started) {
      this._gameState.started = true
    }
    this._gameState.bird.velocity = FLAPPY_CONFIG.JUMP_FORCE
  }

  /* ========== 渲染逻辑 ========== */
  render(ctx: CanvasRenderingContext2D): void {
    const { bird, pipes, groundOffset } = this._gameState
    const { width, height } = this.config
    const { GROUND_HEIGHT, PIPE_WIDTH, PIPE_GAP } = FLAPPY_CONFIG
    const groundY = height - GROUND_HEIGHT

    // 清空画布 - 天空背景
    ctx.fillStyle = FLAPPY_COLORS.BACKGROUND
    ctx.fillRect(0, 0, width, height)

    // 绘制云朵
    this.drawClouds(ctx)

    // 绘制管道
    for (const pipe of pipes) {
      this.drawPipe(ctx, pipe, groundY)
    }

    // 绘制地面
    this.drawGround(ctx, groundY, groundOffset)

    // 绘制小鸟
    this.drawBird(ctx, bird)

    // 显示提示
    if (!this._gameState.started) {
      ctx.fillStyle = FLAPPY_COLORS.TEXT
      ctx.font = 'bold 20px Arial'
      ctx.textAlign = 'center'
      ctx.strokeStyle = FLAPPY_COLORS.TEXT_STROKE
      ctx.lineWidth = 3
      ctx.strokeText('点击或按空格开始', width / 2, height / 2 + 80)
      ctx.fillText('点击或按空格开始', width / 2, height / 2 + 80)
    }
  }

  /**
   * 绘制云朵
   */
  private drawClouds(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = FLAPPY_COLORS.CLOUD

    // 简单的云朵
    const clouds = [
      { x: 50, y: 80, scale: 1 },
      { x: 200, y: 120, scale: 0.8 },
      { x: 320, y: 60, scale: 0.6 },
    ]

    for (const cloud of clouds) {
      ctx.beginPath()
      ctx.arc(cloud.x, cloud.y, 25 * cloud.scale, 0, Math.PI * 2)
      ctx.arc(cloud.x + 20 * cloud.scale, cloud.y - 10, 20 * cloud.scale, 0, Math.PI * 2)
      ctx.arc(cloud.x + 40 * cloud.scale, cloud.y, 25 * cloud.scale, 0, Math.PI * 2)
      ctx.arc(cloud.x + 20 * cloud.scale, cloud.y + 5, 20 * cloud.scale, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  /**
   * 绘制管道
   */
  private drawPipe(ctx: CanvasRenderingContext2D, pipe: Pipe, groundY: number): void {
    const { PIPE_WIDTH, PIPE_GAP } = FLAPPY_CONFIG
    const gapTop = pipe.gapY - PIPE_GAP / 2
    const gapBottom = pipe.gapY + PIPE_GAP / 2

    // 上管道
    ctx.fillStyle = FLAPPY_COLORS.PIPE
    ctx.fillRect(pipe.x, 0, PIPE_WIDTH, gapTop)

    // 上管道帽
    ctx.fillRect(pipe.x - 5, gapTop - 30, PIPE_WIDTH + 10, 30)

    // 下管道
    ctx.fillRect(pipe.x, gapBottom, PIPE_WIDTH, groundY - gapBottom)

    // 下管道帽
    ctx.fillRect(pipe.x - 5, gapBottom, PIPE_WIDTH + 10, 30)

    // 管道边框
    ctx.strokeStyle = FLAPPY_COLORS.PIPE_BORDER
    ctx.lineWidth = 3
    ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, gapTop)
    ctx.strokeRect(pipe.x - 5, gapTop - 30, PIPE_WIDTH + 10, 30)
    ctx.strokeRect(pipe.x, gapBottom, PIPE_WIDTH, groundY - gapBottom)
    ctx.strokeRect(pipe.x - 5, gapBottom, PIPE_WIDTH + 10, 30)
  }

  /**
   * 绘制地面
   */
  private drawGround(ctx: CanvasRenderingContext2D, groundY: number, offset: number): void {
    const { width, height } = this.config

    // 地面主体
    ctx.fillStyle = FLAPPY_COLORS.GROUND
    ctx.fillRect(0, groundY, width, height - groundY)

    // 草皮
    ctx.fillStyle = FLAPPY_COLORS.GRASS
    ctx.fillRect(0, groundY, width, 15)

    // 地面纹理
    ctx.fillStyle = 'rgba(0,0,0,0.1)'
    for (let x = -offset; x < width; x += 24) {
      ctx.fillRect(x, groundY + 20, 12, 10)
    }
  }

  /**
   * 绘制小鸟
   */
  private drawBird(ctx: CanvasRenderingContext2D, bird: Bird): void {
    const { BIRD_SIZE } = FLAPPY_CONFIG

    ctx.save()
    ctx.translate(bird.x, bird.y)
    ctx.rotate((bird.rotation * Math.PI) / 180)

    // 身体
    ctx.fillStyle = FLAPPY_COLORS.BIRD
    ctx.beginPath()
    ctx.ellipse(0, 0, BIRD_SIZE / 2, BIRD_SIZE / 2.5, 0, 0, Math.PI * 2)
    ctx.fill()

    // 翅膀
    ctx.fillStyle = FLAPPY_COLORS.BIRD_WING
    ctx.beginPath()
    ctx.ellipse(-5, 3, BIRD_SIZE / 4, BIRD_SIZE / 5, -0.3, 0, Math.PI * 2)
    ctx.fill()

    // 眼睛
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(8, -5, 6, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#000000'
    ctx.beginPath()
    ctx.arc(10, -5, 3, 0, Math.PI * 2)
    ctx.fill()

    // 嘴巴
    ctx.fillStyle = FLAPPY_COLORS.BIRD_BEAK
    ctx.beginPath()
    ctx.moveTo(BIRD_SIZE / 2 - 5, 0)
    ctx.lineTo(BIRD_SIZE / 2 + 8, 3)
    ctx.lineTo(BIRD_SIZE / 2 - 5, 6)
    ctx.closePath()
    ctx.fill()

    ctx.restore()
  }

  /* ========== 输入处理 ========== */
  handleKeyDown(key: string): void {
    const state = this.getState()

    switch (key) {
      case ' ':
      case 'ArrowUp':
      case 'w':
      case 'W':
        if (state.status === 'playing') {
          this.jump()
        }
        break
    }
  }

  handleKeyUp(_key: string): void {
    // 不需要按键释放处理
  }
}