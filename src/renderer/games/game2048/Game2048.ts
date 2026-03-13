/**
 * 2048游戏
 * @description 经典益智游戏2048的实现
 */

import { BaseGame, type IGame, type GameMeta, type GameConfig } from '@/core'
import { GameCategory, Direction } from '@shared/types'
import {
  GAME2048_CONFIG,
  GAME2048_COLORS,
  TILE_COLORS,
  CANVAS_SIZE,
} from './config'

/**
 * 方块接口
 */
interface Tile {
  value: number
  x: number
  y: number
  isNew?: boolean
  isMerged?: boolean
  /** 动画进度 0-1 */
  animProgress: number
}

/**
 * 游戏状态
 */
interface Game2048State {
  /** 网格数据 */
  grid: (Tile | null)[][]
  /** 分数 */
  score: number
  /** 最高方块值 */
  maxTile: number
  /** 是否可以继续移动 */
  canMove: boolean
}

/**
 * 2048游戏类
 */
export class Game2048 extends BaseGame implements IGame {
  /* ========== 游戏元数据 ========== */
  readonly meta: GameMeta = {
    id: 'game2048',
    name: '2048',
    description:
      '经典的数字益智游戏！使用方向键移动方块，相同数字的方块会合并。目标是合成2048！',
    icon: '🎯',
    category: GameCategory.PUZZLE,
    author: 'GameHub',
    version: '1.0.0',
    tags: ['益智', '数字', '策略'],
    controls: '使用方向键或 WASD 移动所有方块',
  }

  /* ========== 游戏配置 ========== */
  readonly config: GameConfig = {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    showScore: true,
    showLevel: false,
    showLives: false,
    backgroundColor: GAME2048_COLORS.BACKGROUND,
  }

  /* ========== 游戏状态 ========== */
  private _gameState: Game2048State

  constructor() {
    super()
    this._gameState = this.createGame2048State()
  }

  /**
   * 创建初始游戏状态
   */
  private createGame2048State(): Game2048State {
    const grid: (Tile | null)[][] = []
    for (let i = 0; i < GAME2048_CONFIG.GRID_SIZE; i++) {
      grid.push(new Array(GAME2048_CONFIG.GRID_SIZE).fill(null))
    }

    return {
      grid,
      score: 0,
      maxTile: 0,
      canMove: true,
    }
  }

  /**
   * 初始化状态
   */
  protected createInitialState() {
    return {
      ...super.createInitialState(),
      score: 0,
      level: 1,
      lives: 0,
    }
  }

  /**
   * 重写开始方法 - 确保初始化方块
   */
  start(): void {
    // 如果网格为空，初始化方块
    let hasTiles = false
    for (let y = 0; y < GAME2048_CONFIG.GRID_SIZE; y++) {
      for (let x = 0; x < GAME2048_CONFIG.GRID_SIZE; x++) {
        if (this._gameState.grid[y][x]) {
          hasTiles = true
          break
        }
      }
      if (hasTiles) break
    }

    if (!hasTiles) {
      this.addRandomTile()
      this.addRandomTile()
    }

    super.start()
  }

  /**
   * 重置游戏
   */
  reset(): void {
    super.reset()
    this._gameState = this.createGame2048State()
    this.addRandomTile()
    this.addRandomTile()
  }

  /* ========== 更新逻辑 ========== */
  update(deltaTime: number): void {
    const state = this.getState()
    if (state.status !== 'playing') {
      return
    }

    // 更新动画进度
    this.updateAnimations(deltaTime)
  }

  /**
   * 更新动画
   */
  private updateAnimations(deltaTime: number): void {
    const { GRID_SIZE } = GAME2048_CONFIG
    // deltaTime 是毫秒，我们希望动画在约 150ms 内完成
    // 所以 animSpeed = 1 / 150 ≈ 0.0067
    const animSpeed = 0.006

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const tile = this._gameState.grid[y][x]
        if (tile && tile.animProgress < 1) {
          tile.animProgress = Math.min(1, tile.animProgress + deltaTime * animSpeed)
        }
      }
    }
  }

  /**
   * 添加随机方块
   */
  private addRandomTile(): void {
    const emptyCells: { x: number; y: number }[] = []

    for (let y = 0; y < GAME2048_CONFIG.GRID_SIZE; y++) {
      for (let x = 0; x < GAME2048_CONFIG.GRID_SIZE; x++) {
        if (!this._gameState.grid[y][x]) {
          emptyCells.push({ x, y })
        }
      }
    }

    if (emptyCells.length === 0) return

    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)]
    const value = Math.random() < GAME2048_CONFIG.FOUR_PROBABILITY ? 4 : 2

    this._gameState.grid[randomCell.y][randomCell.x] = {
      value,
      x: randomCell.x,
      y: randomCell.y,
      isNew: true,
      animProgress: 0.2, // 初始可见，然后动画完成
    }

    // 更新最大方块
    if (value > this._gameState.maxTile) {
      this._gameState.maxTile = value
    }
  }

  /**
   * 移动方块
   */
  private move(direction: Direction): boolean {
    const { GRID_SIZE } = GAME2048_CONFIG
    let moved = false
    let scoreGain = 0

    // 清除标记
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const tile = this._gameState.grid[y][x]
        if (tile) {
          tile.isMerged = false
          tile.isNew = false
        }
      }
    }

    /**
     * 处理一行或一列的移动
     * @param cells 单元格值数组
     * @returns [新值数组, 是否有移动, 是否有合并]
     */
    const processLine = (cells: (number | null)[]): { values: (number | null)[]; merged: boolean[] } => {
      // 过滤非空值
      const values = cells.filter((v): v is number => v !== null)

      // 合并相同值
      const result: (number | null)[] = []
      const merged: boolean[] = []
      let i = 0

      while (i < values.length) {
        if (i + 1 < values.length && values[i] === values[i + 1]) {
          // 合并
          const newVal = values[i] * 2
          result.push(newVal)
          merged.push(true)
          scoreGain += newVal
          if (newVal > this._gameState.maxTile) {
            this._gameState.maxTile = newVal
          }
          i += 2
        } else {
          result.push(values[i])
          merged.push(false)
          i++
        }
      }

      // 填充空位
      while (result.length < GRID_SIZE) {
        result.push(null)
        merged.push(false)
      }

      return { values: result, merged }
    }

    // 检查是否有变化
    const hasChanged = (old: (number | null)[], newVals: (number | null)[]): boolean => {
      for (let i = 0; i < GRID_SIZE; i++) {
        if (old[i] !== newVals[i]) return true
      }
      return false
    }

    // 处理行移动（左右）
    if (direction === Direction.LEFT || direction === Direction.RIGHT) {
      for (let row = 0; row < GRID_SIZE; row++) {
        // 获取当前行的值
        const oldValues: (number | null)[] = []
        for (let col = 0; col < GRID_SIZE; col++) {
          oldValues.push(this._gameState.grid[row][col]?.value ?? null)
        }

        // 根据方向处理
        const valuesToProcess = direction === Direction.LEFT
          ? oldValues
          : [...oldValues].reverse()

        const { values: newValues, merged } = processLine(valuesToProcess)

        // 恢复方向
        const finalValues = direction === Direction.LEFT
          ? newValues
          : [...newValues].reverse()
        const finalMerged = direction === Direction.LEFT
          ? merged
          : [...merged].reverse()

        // 检查是否有变化
        if (hasChanged(oldValues, finalValues)) {
          moved = true

          // 更新网格
          for (let col = 0; col < GRID_SIZE; col++) {
            this._gameState.grid[row][col] = finalValues[col] !== null
              ? {
                  value: finalValues[col]!,
                  x: col,
                  y: row,
                  isMerged: finalMerged[col],
                  animProgress: finalMerged[col] ? 0.3 : 1,
                }
              : null
          }
        }
      }
    }

    // 处理列移动（上下）
    if (direction === Direction.UP || direction === Direction.DOWN) {
      for (let col = 0; col < GRID_SIZE; col++) {
        // 获取当前列的值
        const oldValues: (number | null)[] = []
        for (let row = 0; row < GRID_SIZE; row++) {
          oldValues.push(this._gameState.grid[row][col]?.value ?? null)
        }

        // 根据方向处理
        const valuesToProcess = direction === Direction.UP
          ? oldValues
          : [...oldValues].reverse()

        const { values: newValues, merged } = processLine(valuesToProcess)

        // 恢复方向
        const finalValues = direction === Direction.UP
          ? newValues
          : [...newValues].reverse()
        const finalMerged = direction === Direction.UP
          ? merged
          : [...merged].reverse()

        // 检查是否有变化
        if (hasChanged(oldValues, finalValues)) {
          moved = true

          // 更新网格
          for (let row = 0; row < GRID_SIZE; row++) {
            this._gameState.grid[row][col] = finalValues[row] !== null
              ? {
                  value: finalValues[row]!,
                  x: col,
                  y: row,
                  isMerged: finalMerged[row],
                  animProgress: finalMerged[row] ? 0.3 : 1,
                }
              : null
          }
        }
      }
    }

    if (moved) {
      // 更新分数
      this._gameState.score += scoreGain
      this.setState({ score: this._gameState.score })

      // 添加新方块
      this.addRandomTile()

      // 检查游戏是否结束
      if (!this.canMove()) {
        this._gameState.canMove = false
        this.gameOver()
      }

      // 触发分数事件
      this.emit('score', { score: this._gameState.score })
    }

    return moved
  }

  /**
   * 检查是否还能移动
   */
  private canMove(): boolean {
    const { GRID_SIZE } = GAME2048_CONFIG
    const { grid } = this._gameState

    // 检查是否有空格
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (!grid[y][x]) return true
      }
    }

    // 检查是否有相邻相同的方块
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const current = grid[y][x]?.value
        if (current) {
          // 检查右边
          if (x < GRID_SIZE - 1 && grid[y][x + 1]?.value === current) {
            return true
          }
          // 检查下边
          if (y < GRID_SIZE - 1 && grid[y + 1][x]?.value === current) {
            return true
          }
        }
      }
    }

    return false
  }

  /* ========== 渲染逻辑 ========== */
  render(ctx: CanvasRenderingContext2D): void {
    const { GRID_SIZE, CELL_SIZE, CELL_GAP } = GAME2048_CONFIG

    // 清空画布
    this.clearCanvas(ctx)

    // 绘制网格背景
    ctx.fillStyle = GAME2048_COLORS.GRID_BG
    ctx.beginPath()
    ctx.roundRect(0, 0, CANVAS_SIZE, CANVAS_SIZE, 6)
    ctx.fill()

    // 绘制空格子
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const cellX = CELL_GAP + x * (CELL_SIZE + CELL_GAP)
        const cellY = CELL_GAP + y * (CELL_SIZE + CELL_GAP)

        ctx.fillStyle = GAME2048_COLORS.CELL_EMPTY
        ctx.beginPath()
        ctx.roundRect(cellX, cellY, CELL_SIZE, CELL_SIZE, 6)
        ctx.fill()
      }
    }

    // 绘制方块
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const tile = this._gameState.grid[y][x]
        if (tile) {
          this.drawTile(ctx, tile)
        }
      }
    }
  }

  /**
   * 绘制单个方块（带动画效果）
   */
  private drawTile(ctx: CanvasRenderingContext2D, tile: Tile): void {
    const { CELL_SIZE, CELL_GAP } = GAME2048_CONFIG

    // 计算动画缩放
    let scale = 1
    let glowOpacity = 0

    if (tile.isNew && tile.animProgress < 1) {
      // 新方块：从小变大
      scale = this.easeOutBack(tile.animProgress)
    } else if (tile.isMerged && tile.animProgress < 1) {
      // 合并方块：弹跳效果 + 发光
      const bounce = Math.sin(tile.animProgress * Math.PI)
      scale = 1 + bounce * 0.2
      glowOpacity = bounce * 0.5
    }

    const centerX = CELL_GAP + tile.x * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2
    const centerY = CELL_GAP + tile.y * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2

    // 绘制发光效果（合并时）
    if (glowOpacity > 0) {
      const colors = TILE_COLORS[tile.value] || TILE_COLORS[8192]
      ctx.save()
      ctx.shadowColor = colors.bg
      ctx.shadowBlur = 20 * glowOpacity
      ctx.fillStyle = `rgba(255, 255, 255, ${glowOpacity * 0.3})`
      ctx.beginPath()
      ctx.roundRect(
        centerX - (CELL_SIZE / 2) * scale,
        centerY - (CELL_SIZE / 2) * scale,
        CELL_SIZE * scale,
        CELL_SIZE * scale,
        6
      )
      ctx.fill()
      ctx.restore()
    }

    // 计算实际绘制位置
    const actualSize = CELL_SIZE * scale
    const x = centerX - actualSize / 2
    const y = centerY - actualSize / 2

    // 获取颜色
    const colors = TILE_COLORS[tile.value] || TILE_COLORS[8192]

    // 绘制方块背景
    ctx.fillStyle = colors.bg
    ctx.beginPath()
    ctx.roundRect(x, y, actualSize, actualSize, 6 * scale)
    ctx.fill()

    // 绘制数字（只在缩放足够大时）
    if (scale > 0.5) {
      ctx.fillStyle = colors.text
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // 根据数字大小调整字体
      const baseFontSize = tile.value >= 1000 ? 28 : tile.value >= 100 ? 36 : 44
      const fontSize = baseFontSize * scale
      ctx.font = `bold ${fontSize}px Arial`

      ctx.globalAlpha = Math.min(1, scale)
      ctx.fillText(tile.value.toString(), centerX, centerY)
      ctx.globalAlpha = 1
    }
  }

  /**
   * 缓动函数：弹性效果
   */
  private easeOutBack(t: number): number {
    const c1 = 1.70158
    const c3 = c1 + 1
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
  }

  /* ========== 输入处理 ========== */
  handleKeyDown(key: string): void {
    const state = this.getState()
    if (state.status !== 'playing') {
      return
    }

    let direction: Direction | null = null

    switch (key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        direction = Direction.UP
        break
      case 'ArrowDown':
      case 's':
      case 'S':
        direction = Direction.DOWN
        break
      case 'ArrowLeft':
      case 'a':
      case 'A':
        direction = Direction.LEFT
        break
      case 'ArrowRight':
      case 'd':
      case 'D':
        direction = Direction.RIGHT
        break
      case ' ':
        // 空格暂停/继续
        const status = this.getState().status
        if (status === 'playing') {
          this.pause()
        } else if (status === 'paused') {
          this.resume()
        }
        return
    }

    if (direction) {
      this.move(direction)
    }
  }

  handleKeyUp(_key: string): void {
    // 2048不需要按键释放处理
  }
}