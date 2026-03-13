/**
 * 贪吃蛇游戏
 * @description 经典贪吃蛇游戏的实现
 */

import { BaseGame, type IGame, type GameMeta, type GameConfig } from '@/core'
import { GameCategory, Direction, type Position } from '@shared/types'
import { SNAKE_CONFIG, SNAKE_COLORS } from './config'

/**
 * 贪吃蛇游戏状态
 */
interface SnakeGameState {
  /** 蛇身位置数组 */
  snake: Position[]
  /** 蛇头方向 */
  direction: Direction
  /** 下一步方向（用于防止反向移动） */
  nextDirection: Direction
  /** 食物位置 */
  food: Position
  /** 移动速度（毫秒/格） */
  speed: number
  /** 上次移动时间 */
  lastMoveTime: number
  /** 网格数量 */
  gridCount: { x: number; y: number }
}

/**
 * 贪吃蛇游戏类
 */
export class SnakeGame extends BaseGame implements IGame {
  /* ========== 游戏元数据 ========== */
  readonly meta: GameMeta = {
    id: 'snake',
    name: '贪吃蛇',
    description: '经典的贪吃蛇游戏，控制蛇吃掉食物，不断成长。小心不要撞到墙壁或自己的身体！',
    icon: '🐍',
    category: GameCategory.CLASSIC,
    author: 'GameHub',
    version: '1.0.0',
    tags: ['经典', '休闲', '街机'],
    controls: '使用方向键或 WASD 控制蛇的移动方向',
  }

  /* ========== 游戏配置 ========== */
  readonly config: GameConfig = {
    width: 600,
    height: 400,
    showScore: true,
    showLevel: true,
    showLives: false,
    backgroundColor: SNAKE_COLORS.BACKGROUND,
  }

  /* ========== 贪吃蛇特有状态 ========== */
  private _snakeState: SnakeGameState

  /**
   * 构造函数
   */
  constructor() {
    super()
    this._snakeState = this.createSnakeState()
  }

  /**
   * 创建贪吃蛇初始状态
   */
  private createSnakeState(): SnakeGameState {
    const gridCount = {
      x: Math.floor(this.config.width / SNAKE_CONFIG.GRID_SIZE),
      y: Math.floor(this.config.height / SNAKE_CONFIG.GRID_SIZE),
    }

    // 【初始化蛇身】
    const snake: Position[] = []
    const startX = Math.floor(gridCount.x / 2)
    const startY = Math.floor(gridCount.y / 2)

    for (let i = 0; i < SNAKE_CONFIG.INITIAL_LENGTH; i++) {
      snake.push({ x: startX - i, y: startY })
    }

    return {
      snake,
      direction: Direction.RIGHT,
      nextDirection: Direction.RIGHT,
      food: this.generateFood(snake, gridCount),
      speed: SNAKE_CONFIG.INITIAL_SPEED,
      lastMoveTime: 0,
      gridCount,
    }
  }

  /**
   * 生成食物位置
   */
  private generateFood(
    snake: Position[],
    gridCount: { x: number; y: number }
  ): Position {
    let food: Position
    do {
      food = {
        x: Math.floor(Math.random() * gridCount.x),
        y: Math.floor(Math.random() * gridCount.y),
      }
    } while (snake.some((segment) => segment.x === food.x && segment.y === food.y))

    return food
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
    this._snakeState = this.createSnakeState()
  }

  /* ========== 更新逻辑 ========== */
  update(deltaTime: number): void {
    const state = this.getState()

    // 【游戏未运行时跳过】
    if (state.status !== 'playing') {
      return
    }

    // 【更新移动计时】
    this._snakeState.lastMoveTime += deltaTime

    // 【检查是否需要移动】
    if (this._snakeState.lastMoveTime >= this._snakeState.speed) {
      this._snakeState.lastMoveTime = 0
      this.moveSnake()
    }
  }

  /**
   * 移动蛇
   */
  private moveSnake(): void {
    const { snake, gridCount } = this._snakeState

    // 【更新方向】
    this._snakeState.direction = this._snakeState.nextDirection

    // 【计算新蛇头位置】
    const head = snake[0]
    const direction = this._snakeState.direction
    let newHead: Position

    switch (direction) {
      case Direction.UP:
        newHead = { x: head.x, y: head.y - 1 }
        break
      case Direction.DOWN:
        newHead = { x: head.x, y: head.y + 1 }
        break
      case Direction.LEFT:
        newHead = { x: head.x - 1, y: head.y }
        break
      case Direction.RIGHT:
        newHead = { x: head.x + 1, y: head.y }
        break
      default:
        newHead = head
    }

    // 【碰撞检测 - 墙壁】
    if (
      newHead.x < 0 ||
      newHead.x >= gridCount.x ||
      newHead.y < 0 ||
      newHead.y >= gridCount.y
    ) {
      this.gameOver()
      return
    }

    // 【碰撞检测 - 自身】
    if (snake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
      this.gameOver()
      return
    }

    // 【添加新蛇头】
    snake.unshift(newHead)

    // 【检查是否吃到食物】
    if (newHead.x === this._snakeState.food.x && newHead.y === this._snakeState.food.y) {
      this.onEatFood()
    } else {
      // 没吃到食物，移除蛇尾
      snake.pop()
    }
  }

  /**
   * 吃到食物处理
   */
  private onEatFood(): void {
    // 【更新分数】
    const newScore = this.getState().score + 10
    this.setState({ score: newScore })

    // 【升级检查】
    const newLevel = Math.floor(newScore / 100) + 1
    if (newLevel > this.getState().level) {
      this.setState({ level: newLevel })
      // 加速
      this._snakeState.speed = Math.max(
        SNAKE_CONFIG.MIN_SPEED,
        this._snakeState.speed - SNAKE_CONFIG.SPEED_INCREMENT
      )
    }

    // 【生成新食物】
    this._snakeState.food = this.generateFood(this._snakeState.snake, this._snakeState.gridCount)

    // 【触发事件】
    this.emit('score', { score: newScore })
  }

  /* ========== 渲染逻辑 ========== */
  render(ctx: CanvasRenderingContext2D): void {
    const { width, height } = this.getCanvasSize()
    const { snake, food, gridCount } = this._snakeState
    const gridSize = SNAKE_CONFIG.GRID_SIZE

    // 【清空画布】
    this.clearCanvas(ctx)

    // 【绘制网格】
    ctx.strokeStyle = SNAKE_COLORS.GRID
    ctx.lineWidth = 1
    for (let x = 0; x <= gridCount.x; x++) {
      ctx.beginPath()
      ctx.moveTo(x * gridSize, 0)
      ctx.lineTo(x * gridSize, height)
      ctx.stroke()
    }
    for (let y = 0; y <= gridCount.y; y++) {
      ctx.beginPath()
      ctx.moveTo(0, y * gridSize)
      ctx.lineTo(width, y * gridSize)
      ctx.stroke()
    }

    // 【绘制食物】
    ctx.fillStyle = SNAKE_COLORS.FOOD
    ctx.beginPath()
    const foodCenterX = food.x * gridSize + gridSize / 2
    const foodCenterY = food.y * gridSize + gridSize / 2
    ctx.arc(foodCenterX, foodCenterY, gridSize / 2 - 2, 0, Math.PI * 2)
    ctx.fill()

    // 【绘制蛇】
    snake.forEach((segment, index) => {
      const x = segment.x * gridSize
      const y = segment.y * gridSize

      // 蛇头颜色不同
      ctx.fillStyle = index === 0 ? SNAKE_COLORS.SNAKE_HEAD : SNAKE_COLORS.SNAKE_BODY

      // 绘制圆角矩形
      const padding = 1
      ctx.beginPath()
      ctx.roundRect(
        x + padding,
        y + padding,
        gridSize - padding * 2,
        gridSize - padding * 2,
        4
      )
      ctx.fill()
    })
  }

  /* ========== 输入处理 ========== */
  handleKeyDown(key: string): void {
    const currentDirection = this._snakeState.direction

    // 【方向控制】
    switch (key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        // 防止反向移动
        if (currentDirection !== Direction.DOWN) {
          this._snakeState.nextDirection = Direction.UP
        }
        break
      case 'ArrowDown':
      case 's':
      case 'S':
        if (currentDirection !== Direction.UP) {
          this._snakeState.nextDirection = Direction.DOWN
        }
        break
      case 'ArrowLeft':
      case 'a':
      case 'A':
        if (currentDirection !== Direction.RIGHT) {
          this._snakeState.nextDirection = Direction.LEFT
        }
        break
      case 'ArrowRight':
      case 'd':
      case 'D':
        if (currentDirection !== Direction.LEFT) {
          this._snakeState.nextDirection = Direction.RIGHT
        }
        break
      case ' ':
        // 空格暂停/继续
        const status = this.getState().status
        if (status === 'playing') {
          this.pause()
        } else if (status === 'paused') {
          this.resume()
        }
        break
    }
  }

  handleKeyUp(_key: string): void {
    // 贪吃蛇不需要按键释放处理
  }
}