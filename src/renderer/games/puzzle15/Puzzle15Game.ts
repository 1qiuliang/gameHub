/**
 * 数字华容道游戏
 * @description 经典的滑动数字拼图游戏
 */

import { BaseGame, type IGame, type GameMeta, type GameConfig } from '@/core'
import { GameCategory } from '@shared/types'
import { PUZZLE15_SIZES, PUZZLE15_CONFIG, PUZZLE15_COLORS } from './config'

/**
 * 方块状态
 */
interface Tile {
  value: number
  x: number
  y: number
  targetX: number
  targetY: number
}

/**
 * 游戏状态
 */
interface Puzzle15GameState {
  tiles: Tile[]
  gridSize: number
  emptyPos: { row: number; col: number }
  moves: number
  solved: boolean
  animating: boolean
}

/**
 * 数字华容道游戏类
 */
export class Puzzle15Game extends BaseGame implements IGame {
  /* ========== 游戏元数据 ========== */
  readonly meta: GameMeta = {
    id: 'puzzle15',
    name: '数字华容道',
    description: '经典滑动拼图游戏，将数字按顺序排列。空格相邻的方块可以滑动。',
    icon: '🔢',
    category: GameCategory.PUZZLE,
    author: 'GameHub',
    version: '1.0.0',
    tags: ['益智', '休闲', '策略'],
    controls: '点击或方向键移动方块，R键重置，1-3切换难度',
  }

  /* ========== 游戏配置 ========== */
  readonly config: GameConfig = {
    width: 340,
    height: 340,
    showScore: true,
    showLevel: false,
    showLives: false,
    backgroundColor: PUZZLE15_COLORS.BACKGROUND,
  }

  /* ========== 数字华容道特有状态 ========== */
  private _gameState: Puzzle15GameState
  private _difficulty: keyof typeof PUZZLE15_SIZES

  constructor() {
    super()
    this._difficulty = 'medium'
    this._gameState = this.createGameState()
    this.updateConfigSize()
  }

  /**
   * 更新配置尺寸
   */
  private updateConfigSize(): void {
    const size = PUZZLE15_SIZES[this._difficulty].size
    const { TILE_SIZE, TILE_GAP } = PUZZLE15_CONFIG
    const totalSize = size * TILE_SIZE + (size + 1) * TILE_GAP
    this.config.width = totalSize
    this.config.height = totalSize
  }

  /**
   * 创建初始状态
   */
  private createGameState(): Puzzle15GameState {
    const size = PUZZLE15_SIZES[this._difficulty].size
    const tiles = this.generateSolvablePuzzle(size)

    // 找到空白位置
    let emptyPos = { row: 0, col: 0 }
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (tiles[row * size + col].value === 0) {
          emptyPos = { row, col }
        }
      }
    }

    return {
      tiles,
      gridSize: size,
      emptyPos,
      moves: 0,
      solved: false,
      animating: false,
    }
  }

  /**
   * 生成可解的拼图
   */
  private generateSolvablePuzzle(size: number): Tile[] {
    const { TILE_SIZE, TILE_GAP } = PUZZLE15_CONFIG
    const totalNumbers = size * size
    const numbers = Array.from({ length: totalNumbers }, (_, i) => i)

    // Fisher-Yates 洗牌
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[numbers[i], numbers[j]] = [numbers[j], numbers[i]]
    }

    // 检查是否可解，如果不可解则交换两个非空方块
    if (!this.isSolvable(numbers, size)) {
      // 找到前两个非空方块并交换
      const idx1 = numbers.findIndex((n) => n !== 0)
      const idx2 = numbers.findIndex((n, i) => n !== 0 && i > idx1)
      ;[numbers[idx1], numbers[idx2]] = [numbers[idx2], numbers[idx1]]
    }

    // 创建方块
    const tiles: Tile[] = []
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const value = numbers[row * size + col]
        tiles.push({
          value,
          x: TILE_GAP + col * (TILE_SIZE + TILE_GAP),
          y: TILE_GAP + row * (TILE_SIZE + TILE_GAP),
          targetX: TILE_GAP + col * (TILE_SIZE + TILE_GAP),
          targetY: TILE_GAP + row * (TILE_SIZE + TILE_GAP),
        })
      }
    }

    return tiles
  }

  /**
   * 检查拼图是否可解
   */
  private isSolvable(numbers: number[], size: number): boolean {
    let inversions = 0

    for (let i = 0; i < numbers.length - 1; i++) {
      for (let j = i + 1; j < numbers.length; j++) {
        if (numbers[i] && numbers[j] && numbers[i] > numbers[j]) {
          inversions++
        }
      }
    }

    if (size % 2 === 1) {
      // 奇数尺寸：逆序数必须是偶数
      return inversions % 2 === 0
    } else {
      // 偶数尺寸：逆序数 + 空白所在行（从底部数）的奇偶性
      const emptyRow = Math.floor(numbers.indexOf(0) / size)
      const emptyRowFromBottom = size - emptyRow
      return (inversions + emptyRowFromBottom) % 2 === 1
    }
  }

  /**
   * 移动方块
   */
  private moveTile(row: number, col: number): boolean {
    const { tiles, emptyPos, gridSize, animating, solved } = this._gameState
    if (animating || solved) return false

    // 检查是否与空白相邻
    const isAdjacent =
      (Math.abs(row - emptyPos.row) === 1 && col === emptyPos.col) ||
      (Math.abs(col - emptyPos.col) === 1 && row === emptyPos.row)

    if (!isAdjacent) return false

    const { TILE_SIZE, TILE_GAP } = PUZZLE15_CONFIG
    const tileIndex = row * gridSize + col
    const emptyIndex = emptyPos.row * gridSize + emptyPos.col

    // 交换方块位置
    const tile = tiles[tileIndex]
    const emptyTile = tiles[emptyIndex]

    // 更新目标位置
    tile.targetX = emptyTile.x
    tile.targetY = emptyTile.y
    emptyTile.x = tile.x
    emptyTile.y = tile.y
    emptyTile.targetX = tile.x
    emptyTile.targetY = tile.y

    // 交换数组位置
    tiles[tileIndex] = emptyTile
    tiles[emptyIndex] = tile

    // 更新空白位置
    this._gameState.emptyPos = { row, col }
    this._gameState.moves++
    this._gameState.animating = true

    // 更新分数（步数）
    this.setState({ score: this._gameState.moves })

    return true
  }

  /**
   * 检查是否完成
   */
  private checkSolved(): boolean {
    const { tiles, gridSize } = this._gameState
    const total = gridSize * gridSize

    for (let i = 0; i < total - 1; i++) {
      if (tiles[i].value !== i + 1) return false
    }

    return tiles[total - 1].value === 0
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

    // 更新动画
    if (this._gameState.animating) {
      const { tiles } = this._gameState
      const { ANIMATION_SPEED } = PUZZLE15_CONFIG
      let stillAnimating = false

      for (const tile of tiles) {
        if (tile.x !== tile.targetX || tile.y !== tile.targetY) {
          const dx = tile.targetX - tile.x
          const dy = tile.targetY - tile.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < ANIMATION_SPEED) {
            tile.x = tile.targetX
            tile.y = tile.targetY
          } else {
            tile.x += (dx / dist) * ANIMATION_SPEED
            tile.y += (dy / dist) * ANIMATION_SPEED
            stillAnimating = true
          }
        }
      }

      if (!stillAnimating) {
        this._gameState.animating = false

        // 检查是否完成
        if (this.checkSolved()) {
          this._gameState.solved = true
          this.gameOver()
        }
      }
    }
  }

  /* ========== 渲染逻辑 ========== */
  render(ctx: CanvasRenderingContext2D): void {
    const { width, height } = this.config
    const { tiles, gridSize, solved } = this._gameState
    const { TILE_SIZE, TILE_GAP } = PUZZLE15_CONFIG

    // 清空画布
    ctx.fillStyle = PUZZLE15_COLORS.BACKGROUND
    ctx.fillRect(0, 0, width, height)

    // 绘制空白位置背景
    ctx.fillStyle = PUZZLE15_COLORS.EMPTY
    const emptyIndex = tiles.findIndex((t) => t.value === 0)
    const emptyTile = tiles[emptyIndex]
    ctx.fillRect(emptyTile.x, emptyTile.y, TILE_SIZE, TILE_SIZE)

    // 绘制方块
    for (const tile of tiles) {
      if (tile.value === 0) continue

      const isCorrectPosition = this.isCorrectPosition(tile, gridSize)

      ctx.fillStyle = solved
        ? PUZZLE15_COLORS.COMPLETED
        : isCorrectPosition
        ? PUZZLE15_COLORS.COMPLETED
        : PUZZLE15_COLORS.TILE_BG

      // 绘制方块
      ctx.beginPath()
      ctx.roundRect(tile.x, tile.y, TILE_SIZE, TILE_SIZE, 8)
      ctx.fill()

      // 绘制数字
      ctx.fillStyle = PUZZLE15_COLORS.TEXT
      ctx.font = `bold ${TILE_SIZE * 0.4}px Arial`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(
        String(tile.value),
        tile.x + TILE_SIZE / 2,
        tile.y + TILE_SIZE / 2
      )
    }

    // 完成提示
    if (solved) {
      this.drawSolvedOverlay(ctx)
    }
  }

  /**
   * 检查方块是否在正确位置
   */
  private isCorrectPosition(tile: Tile, gridSize: number): boolean {
    const index = tilesIndexOfValue(tile.value, gridSize)
    const expectedRow = Math.floor(index / gridSize)
    const expectedCol = index % gridSize
    const currentRow = Math.round(tile.targetY / (PUZZLE15_CONFIG.TILE_SIZE + PUZZLE15_CONFIG.TILE_GAP))
    const currentCol = Math.round(tile.targetX / (PUZZLE15_CONFIG.TILE_SIZE + PUZZLE15_CONFIG.TILE_GAP))

    return currentRow === expectedRow && currentCol === expectedCol
  }

  /**
   * 根据值获取正确索引
   */
  private tilesIndexOfValue(value: number, gridSize: number): number {
    return value === 0 ? gridSize * gridSize - 1 : value - 1
  }

  /**
   * 绘制完成遮罩
   */
  private drawSolvedOverlay(ctx: CanvasRenderingContext2D): void {
    const { width, height } = this.config

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(0, 0, width, height)

    ctx.fillStyle = PUZZLE15_COLORS.TEXT
    ctx.font = 'bold 28px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('🎉 完成！', width / 2, height / 2 - 20)

    ctx.font = '18px Arial'
    ctx.fillText(`步数: ${this._gameState.moves}`, width / 2, height / 2 + 15)
    ctx.font = '14px Arial'
    ctx.fillText('按 R 重新开始', width / 2, height / 2 + 45)
  }

  /* ========== 输入处理 ========== */
  handleKeyDown(key: string): void {
    const state = this.getState()
    if (state.status !== 'playing') return

    const { emptyPos, gridSize, solved, animating } = this._gameState
    if (solved || animating) return

    let targetRow = emptyPos.row
    let targetCol = emptyPos.col

    switch (key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        targetRow = Math.min(gridSize - 1, emptyPos.row + 1)
        break
      case 'ArrowDown':
      case 's':
      case 'S':
        targetRow = Math.max(0, emptyPos.row - 1)
        break
      case 'ArrowLeft':
      case 'a':
      case 'A':
        targetCol = Math.min(gridSize - 1, emptyPos.col + 1)
        break
      case 'ArrowRight':
      case 'd':
      case 'D':
        targetCol = Math.max(0, emptyPos.col - 1)
        break
      case 'r':
      case 'R':
        this.reset()
        return
      case '1':
        this._difficulty = 'easy'
        this.updateConfigSize()
        this.reset()
        return
      case '2':
        this._difficulty = 'medium'
        this.updateConfigSize()
        this.reset()
        return
      case '3':
        this._difficulty = 'hard'
        this.updateConfigSize()
        this.reset()
        return
    }

    if (targetRow !== emptyPos.row || targetCol !== emptyPos.col) {
      this.moveTile(targetRow, targetCol)
    }
  }

  handleKeyUp(_key: string): void {}

  /**
   * 处理点击
   */
  handleClick(x: number, y: number): void {
    const state = this.getState()
    if (state.status !== 'playing') return

    const { gridSize, solved, animating } = this._gameState
    if (solved || animating) return

    const { TILE_SIZE, TILE_GAP } = PUZZLE15_CONFIG

    const col = Math.floor((x - TILE_GAP) / (TILE_SIZE + TILE_GAP))
    const row = Math.floor((y - TILE_GAP) / (TILE_SIZE + TILE_GAP))

    if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) return

    this.moveTile(row, col)
  }
}