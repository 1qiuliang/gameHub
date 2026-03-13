/**
 * 扫雷游戏
 * @description 经典扫雷游戏的实现
 */

import { BaseGame, type IGame, type GameMeta, type GameConfig } from '@/core'
import { GameCategory } from '@shared/types'
import { MINESWEEPER_DIFFICULTY, MINESWEEPER_CONFIG, MINESWEEPER_COLORS } from './config'

/**
 * 单元格状态
 */
interface Cell {
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  adjacentMines: number
  isExploded: boolean
}

/**
 * 游戏状态
 */
interface MinesweeperGameState {
  grid: Cell[][]
  rows: number
  cols: number
  totalMines: number
  flagsPlaced: number
  revealedCount: number
  firstClick: boolean
  gameOver: boolean
  won: boolean
}

/**
 * 扫雷游戏类
 */
export class MinesweeperGame extends BaseGame implements IGame {
  /* ========== 游戏元数据 ========== */
  readonly meta: GameMeta = {
    id: 'minesweeper',
    name: '扫雷',
    description: '经典的Windows扫雷游戏，找出所有地雷，不要踩到它们！',
    icon: '💣',
    category: GameCategory.PUZZLE,
    author: 'GameHub',
    version: '1.0.0',
    tags: ['益智', '经典', '策略'],
    controls: '左键揭开格子，右键标记地雷，R键重新开始',
  }

  /* ========== 游戏配置 ========== */
  readonly config: GameConfig = {
    width: 270,
    height: 270,
    showScore: true,
    showLevel: false,
    showLives: false,
    backgroundColor: MINESWEEPER_COLORS.BACKGROUND,
  }

  /* ========== 扫雷特有状态 ========== */
  private _gameState: MinesweeperGameState
  private _difficulty: keyof typeof MINESWEEPER_DIFFICULTY

  constructor() {
    super()
    this._difficulty = MINESWEEPER_CONFIG.DEFAULT_DIFFICULTY
    this._gameState = this.createGameState()
    this.updateConfigSize()
  }

  /**
   * 更新配置尺寸
   */
  private updateConfigSize(): void {
    const diff = MINESWEEPER_DIFFICULTY[this._difficulty]
    this.config.width = diff.cols * MINESWEEPER_CONFIG.CELL_SIZE
    this.config.height = diff.rows * MINESWEEPER_CONFIG.CELL_SIZE
  }

  /**
   * 创建初始状态
   */
  private createGameState(): MinesweeperGameState {
    const diff = MINESWEEPER_DIFFICULTY[this._difficulty]
    const grid: Cell[][] = []

    for (let row = 0; row < diff.rows; row++) {
      grid[row] = []
      for (let col = 0; col < diff.cols; col++) {
        grid[row][col] = {
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          adjacentMines: 0,
          isExploded: false,
        }
      }
    }

    return {
      grid,
      rows: diff.rows,
      cols: diff.cols,
      totalMines: diff.mines,
      flagsPlaced: 0,
      revealedCount: 0,
      firstClick: true,
      gameOver: false,
      won: false,
    }
  }

  /**
   * 放置地雷（避开首次点击位置）
   */
  private placeMines(excludeRow: number, excludeCol: number): void {
    const { grid, rows, cols, totalMines } = this._gameState
    let placed = 0

    while (placed < totalMines) {
      const row = Math.floor(Math.random() * rows)
      const col = Math.floor(Math.random() * cols)

      // 避开首次点击位置及其周围
      if (Math.abs(row - excludeRow) <= 1 && Math.abs(col - excludeCol) <= 1) {
        continue
      }

      if (!grid[row][col].isMine) {
        grid[row][col].isMine = true
        placed++
      }
    }

    // 计算相邻地雷数
    this.calculateAdjacentMines()
  }

  /**
   * 计算相邻地雷数
   */
  private calculateAdjacentMines(): void {
    const { grid, rows, cols } = this._gameState

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (grid[row][col].isMine) continue

        let count = 0
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = row + dr
            const nc = col + dc
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc].isMine) {
              count++
            }
          }
        }
        grid[row][col].adjacentMines = count
      }
    }
  }

  /**
   * 揭开格子
   */
  private revealCell(row: number, col: number): void {
    const { grid, rows, cols } = this._gameState

    if (row < 0 || row >= rows || col < 0 || col >= cols) return
    const cell = grid[row][col]
    if (cell.isRevealed || cell.isFlagged) return

    cell.isRevealed = true
    this._gameState.revealedCount++

    // 踩到地雷
    if (cell.isMine) {
      cell.isExploded = true
      this.revealAllMines()
      this.endGame(false)
      return
    }

    // 空格子，递归揭开周围
    if (cell.adjacentMines === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          this.revealCell(row + dr, col + dc)
        }
      }
    }

    // 检查胜利
    this.checkWin()
  }

  /**
   * 切换旗帜
   */
  private toggleFlag(row: number, col: number): void {
    const { grid, totalMines } = this._gameState
    const cell = grid[row][col]

    if (cell.isRevealed) return

    if (cell.isFlagged) {
      cell.isFlagged = false
      this._gameState.flagsPlaced--
    } else if (this._gameState.flagsPlaced < totalMines) {
      cell.isFlagged = true
      this._gameState.flagsPlaced++
    }

    // 更新分数显示（剩余地雷数）
    this.setState({ score: totalMines - this._gameState.flagsPlaced })
  }

  /**
   * 揭开所有地雷
   */
  private revealAllMines(): void {
    const { grid, rows, cols } = this._gameState

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (grid[row][col].isMine) {
          grid[row][col].isRevealed = true
        }
      }
    }
  }

  /**
   * 检查胜利
   */
  private checkWin(): void {
    const { rows, cols, totalMines, revealedCount } = this._gameState
    const totalCells = rows * cols

    if (revealedCount === totalCells - totalMines) {
      this.endGame(true)
    }
  }

  /**
   * 结束游戏
   */
  private endGame(won: boolean): void {
    this._gameState.gameOver = true
    this._gameState.won = won
    this.gameOver()
  }

  /* ========== 重写初始化状态 ========== */
  protected createInitialState() {
    // 注意：此方法在父类构造函数中调用，此时 this._difficulty 还未初始化
    // 所以使用默认配置值
    const diff = MINESWEEPER_DIFFICULTY[MINESWEEPER_CONFIG.DEFAULT_DIFFICULTY]
    return {
      ...super.createInitialState(),
      score: diff.mines,
      level: 1,
      lives: 0,
    }
  }

  /* ========== 重写重置 ========== */
  reset(): void {
    super.reset()
    this._gameState = this.createGameState()
    const diff = MINESWEEPER_DIFFICULTY[this._difficulty]
    this.setState({ score: diff.mines })
  }

  /* ========== 更新逻辑 ========== */
  update(_deltaTime: number): void {
    // 扫雷是事件驱动的，不需要持续更新
  }

  /* ========== 渲染逻辑 ========== */
  render(ctx: CanvasRenderingContext2D): void {
    const { grid, rows, cols } = this._gameState
    const cellSize = MINESWEEPER_CONFIG.CELL_SIZE

    // 清空画布
    ctx.fillStyle = MINESWEEPER_COLORS.BACKGROUND
    ctx.fillRect(0, 0, this.config.width, this.config.height)

    // 绘制每个格子
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        this.drawCell(ctx, row, col, grid[row][col], cellSize)
      }
    }

    // 游戏结束提示
    if (this._gameState.gameOver) {
      this.drawGameOverOverlay(ctx)
    }
  }

  /**
   * 绘制单元格
   */
  private drawCell(ctx: CanvasRenderingContext2D, row: number, col: number, cell: Cell, size: number): void {
    const x = col * size
    const y = row * size
    const padding = 2

    if (cell.isRevealed) {
      // 已揭开的格子
      if (cell.isMine) {
        ctx.fillStyle = cell.isExploded ? MINESWEEPER_COLORS.EXPLODED : MINESWEEPER_COLORS.REVEALED
        ctx.fillRect(x, y, size, size)
        // 绘制地雷
        this.drawMine(ctx, x + size / 2, y + size / 2, size / 3)
      } else {
        ctx.fillStyle = MINESWEEPER_COLORS.REVEALED
        ctx.fillRect(x, y, size, size)
        // 绘制数字
        if (cell.adjacentMines > 0) {
          ctx.fillStyle = MINESWEEPER_COLORS.NUMBERS[cell.adjacentMines - 1]
          ctx.font = `bold ${size - 8}px Arial`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(String(cell.adjacentMines), x + size / 2, y + size / 2 + 1)
        }
      }
    } else {
      // 未揭开的格子 - 3D效果
      ctx.fillStyle = MINESWEEPER_COLORS.HIDDEN
      ctx.fillRect(x, y, size, size)

      // 高亮边
      ctx.fillStyle = MINESWEEPER_COLORS.BORDER_LIGHT
      ctx.fillRect(x, y, size - 1, 1)
      ctx.fillRect(x, y, 1, size - 1)

      // 阴影边
      ctx.fillStyle = MINESWEEPER_COLORS.BORDER_DARK
      ctx.fillRect(x + 1, y + size - 1, size - 1, 1)
      ctx.fillRect(x + size - 1, y + 1, 1, size - 1)

      // 旗帜
      if (cell.isFlagged) {
        this.drawFlag(ctx, x + size / 2, y + size / 2, size / 3)
      }
    }

    // 网格线
    ctx.strokeStyle = '#808080'
    ctx.lineWidth = 0.5
    ctx.strokeRect(x, y, size, size)
  }

  /**
   * 绘制地雷
   */
  private drawMine(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
    ctx.fillStyle = MINESWEEPER_COLORS.MINE
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()

    // 刺
    ctx.lineWidth = 2
    ctx.strokeStyle = MINESWEEPER_COLORS.MINE
    for (let i = 0; i < 8; i++) {
      const angle = (i * 45 * Math.PI) / 180
      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(angle) * r * 0.7, cy + Math.sin(angle) * r * 0.7)
      ctx.lineTo(cx + Math.cos(angle) * r * 1.3, cy + Math.sin(angle) * r * 1.3)
      ctx.stroke()
    }

    // 高光
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(cx - r * 0.3, cy - r * 0.3, r * 0.25, 0, Math.PI * 2)
    ctx.fill()
  }

  /**
   * 绘制旗帜
   */
  private drawFlag(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void {
    // 旗杆
    ctx.fillStyle = '#333'
    ctx.fillRect(cx - 1, cy - size, 2, size * 2)

    // 旗帜
    ctx.fillStyle = MINESWEEPER_COLORS.FLAG
    ctx.beginPath()
    ctx.moveTo(cx, cy - size)
    ctx.lineTo(cx + size, cy - size / 2)
    ctx.lineTo(cx, cy)
    ctx.closePath()
    ctx.fill()
  }

  /**
   * 绘制游戏结束遮罩
   */
  private drawGameOverOverlay(ctx: CanvasRenderingContext2D): void {
    const { width, height } = this.config

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(0, 0, width, height)

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 24px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    if (this._gameState.won) {
      ctx.fillText('🎉 胜利！', width / 2, height / 2 - 15)
    } else {
      ctx.fillText('💥 游戏结束', width / 2, height / 2 - 15)
    }

    ctx.font = '14px Arial'
    ctx.fillText('按 R 重新开始', width / 2, height / 2 + 15)
  }

  /* ========== 输入处理 ========== */
  handleKeyDown(key: string): void {
    const state = this.getState()

    if (key === 'r' || key === 'R') {
      this.reset()
      return
    }

    if (state.status !== 'playing') return

    // 切换难度
    if (key === '1') {
      this._difficulty = 'easy'
      this.updateConfigSize()
      this.reset()
    } else if (key === '2') {
      this._difficulty = 'medium'
      this.updateConfigSize()
      this.reset()
    } else if (key === '3') {
      this._difficulty = 'hard'
      this.updateConfigSize()
      this.reset()
    }
  }

  handleKeyUp(_key: string): void {}

  /**
   * 处理鼠标点击
   */
  handleClick(x: number, y: number, isRightClick: boolean): void {
    const state = this.getState()
    if (state.status !== 'playing' || this._gameState.gameOver) return

    const cellSize = MINESWEEPER_CONFIG.CELL_SIZE
    const col = Math.floor(x / cellSize)
    const row = Math.floor(y / cellSize)

    if (row < 0 || row >= this._gameState.rows || col < 0 || col >= this._gameState.cols) {
      return
    }

    if (isRightClick) {
      this.toggleFlag(row, col)
    } else {
      if (this._gameState.firstClick) {
        this._gameState.firstClick = false
        this.placeMines(row, col)
      }
      this.revealCell(row, col)
    }
  }
}