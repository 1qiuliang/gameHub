/**
 * 五子棋游戏
 * @description 经典五子棋游戏实现
 */

import { BaseGame, type IGame, type GameMeta, type GameConfig } from '@/core'
import { GameCategory } from '@shared/types'
import { GOMOKU_CONFIG, GOMOKU_COLORS, STAR_POINTS } from './config'

/**
 * 棋子类型
 */
enum Stone {
  EMPTY = 0,
  BLACK = 1,
  WHITE = 2,
}

/**
 * 游戏状态
 */
interface GomokuGameState {
  board: Stone[][]
  currentPlayer: Stone.BLACK | Stone.WHITE
  lastMove: { row: number; col: number } | null
  gameOver: boolean
  winner: Stone | null
  hoverPos: { row: number; col: number } | null
  moveHistory: { row: number; col: number }[]
}

/**
 * 五子棋游戏类
 */
export class GomokuGame extends BaseGame implements IGame {
  /* ========== 游戏元数据 ========== */
  readonly meta: GameMeta = {
    id: 'gomoku',
    name: '五子棋',
    description: '经典五子棋游戏，五子连珠获胜！支持双人对战。',
    icon: '⚫',
    category: GameCategory.PUZZLE,
    author: 'GameHub',
    version: '1.0.0',
    tags: ['策略', '对战', '经典'],
    controls: '点击落子，黑棋先行，Z键悔棋',
  }

  /* ========== 游戏配置 ========== */
  readonly config: GameConfig = {
    width: 580,
    height: 580,
    showScore: true,
    showLevel: false,
    showLives: false,
    backgroundColor: GOMOKU_COLORS.BOARD_BG,
  }

  /* ========== 五子棋特有状态 ========== */
  private _gameState: GomokuGameState

  constructor() {
    super()
    this._gameState = this.createGameState()
  }

  /**
   * 创建初始状态
   */
  private createGameState(): GomokuGameState {
    const size = GOMOKU_CONFIG.BOARD_SIZE
    const board: Stone[][] = []

    for (let row = 0; row < size; row++) {
      board[row] = []
      for (let col = 0; col < size; col++) {
        board[row][col] = Stone.EMPTY
      }
    }

    return {
      board,
      currentPlayer: Stone.BLACK,
      lastMove: null,
      gameOver: false,
      winner: null,
      hoverPos: null,
      moveHistory: [],
    }
  }

  /**
   * 获取棋盘坐标
   */
  private getBoardPosition(x: number, y: number): { row: number; col: number } | null {
    const { BOARD_PADDING, CELL_SIZE, BOARD_SIZE } = GOMOKU_CONFIG

    const col = Math.round((x - BOARD_PADDING) / CELL_SIZE)
    const row = Math.round((y - BOARD_PADDING) / CELL_SIZE)

    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
      return null
    }

    return { row, col }
  }

  /**
   * 落子
   */
  private placeStone(row: number, col: number): void {
    const { board, currentPlayer, gameOver } = this._gameState

    if (gameOver || board[row][col] !== Stone.EMPTY) {
      return
    }

    board[row][col] = currentPlayer
    this._gameState.lastMove = { row, col }
    this._gameState.moveHistory.push({ row, col })

    // 检查胜利
    if (this.checkWin(row, col, currentPlayer)) {
      this._gameState.gameOver = true
      this._gameState.winner = currentPlayer
      this.gameOver()
      return
    }

    // 检查平局
    if (this._gameState.moveHistory.length === GOMOKU_CONFIG.BOARD_SIZE ** 2) {
      this._gameState.gameOver = true
      this.gameOver()
      return
    }

    // 切换玩家
    this._gameState.currentPlayer =
      currentPlayer === Stone.BLACK ? Stone.WHITE : Stone.BLACK
  }

  /**
   * 悔棋
   */
  private undoMove(): void {
    const { board, moveHistory, gameOver } = this._gameState

    if (moveHistory.length === 0 || gameOver) return

    const lastMove = moveHistory.pop()!
    board[lastMove.row][lastMove.col] = Stone.EMPTY

    this._gameState.currentPlayer =
      this._gameState.currentPlayer === Stone.BLACK ? Stone.WHITE : Stone.BLACK

    this._gameState.lastMove = moveHistory.length > 0 ? moveHistory[moveHistory.length - 1] : null
  }

  /**
   * 检查胜利
   */
  private checkWin(row: number, col: number, player: Stone): boolean {
    const { board } = this._gameState
    const size = GOMOKU_CONFIG.BOARD_SIZE
    const directions = [
      [0, 1],   // 水平
      [1, 0],   // 垂直
      [1, 1],   // 对角线
      [1, -1],  // 反对角线
    ]

    for (const [dr, dc] of directions) {
      let count = 1

      // 正向计数
      for (let i = 1; i < 5; i++) {
        const r = row + dr * i
        const c = col + dc * i
        if (r < 0 || r >= size || c < 0 || c >= size || board[r][c] !== player) break
        count++
      }

      // 反向计数
      for (let i = 1; i < 5; i++) {
        const r = row - dr * i
        const c = col - dc * i
        if (r < 0 || r >= size || c < 0 || c >= size || board[r][c] !== player) break
        count++
      }

      if (count >= 5) return true
    }

    return false
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
    // 五子棋是事件驱动的
  }

  /* ========== 渲染逻辑 ========== */
  render(ctx: CanvasRenderingContext2D): void {
    const { width, height } = this.config
    const { BOARD_PADDING, CELL_SIZE, BOARD_SIZE, STONE_RADIUS } = GOMOKU_CONFIG

    // 绘制棋盘背景
    ctx.fillStyle = GOMOKU_COLORS.BOARD_BG
    ctx.fillRect(0, 0, width, height)

    // 绘制棋盘线条
    ctx.strokeStyle = GOMOKU_COLORS.BOARD_LINE
    ctx.lineWidth = 1

    for (let i = 0; i < BOARD_SIZE; i++) {
      const pos = BOARD_PADDING + i * CELL_SIZE

      // 横线
      ctx.beginPath()
      ctx.moveTo(BOARD_PADDING, pos)
      ctx.lineTo(BOARD_PADDING + (BOARD_SIZE - 1) * CELL_SIZE, pos)
      ctx.stroke()

      // 竖线
      ctx.beginPath()
      ctx.moveTo(pos, BOARD_PADDING)
      ctx.lineTo(pos, BOARD_PADDING + (BOARD_SIZE - 1) * CELL_SIZE)
      ctx.stroke()
    }

    // 绘制星位点
    ctx.fillStyle = GOMOKU_COLORS.STAR_POINT
    for (const point of STAR_POINTS) {
      const x = BOARD_PADDING + point.col * CELL_SIZE
      const y = BOARD_PADDING + point.row * CELL_SIZE
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fill()
    }

    // 绘制棋子
    const { board, lastMove, hoverPos, gameOver, currentPlayer } = this._gameState

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const stone = board[row][col]
        if (stone === Stone.EMPTY) continue

        const x = BOARD_PADDING + col * CELL_SIZE
        const y = BOARD_PADDING + row * CELL_SIZE

        this.drawStone(ctx, x, y, stone === Stone.BLACK)

        // 最后落子标记
        if (lastMove && lastMove.row === row && lastMove.col === col) {
          ctx.strokeStyle = GOMOKU_COLORS.LAST_MOVE
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(x, y, STONE_RADIUS - 3, 0, Math.PI * 2)
          ctx.stroke()
        }
      }
    }

    // 绘制悬停提示
    if (hoverPos && !gameOver && board[hoverPos.row][hoverPos.col] === Stone.EMPTY) {
      const x = BOARD_PADDING + hoverPos.col * CELL_SIZE
      const y = BOARD_PADDING + hoverPos.row * CELL_SIZE

      ctx.globalAlpha = 0.4
      this.drawStone(ctx, x, y, currentPlayer === Stone.BLACK)
      ctx.globalAlpha = 1
    }

    // 游戏结束提示
    if (gameOver) {
      this.drawGameOverOverlay(ctx)
    }
  }

  /**
   * 绘制棋子
   */
  private drawStone(ctx: CanvasRenderingContext2D, x: number, y: number, isBlack: boolean): void {
    const { STONE_RADIUS } = GOMOKU_CONFIG

    // 阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.beginPath()
    ctx.arc(x + 2, y + 2, STONE_RADIUS, 0, Math.PI * 2)
    ctx.fill()

    // 棋子
    const gradient = ctx.createRadialGradient(
      x - STONE_RADIUS / 3,
      y - STONE_RADIUS / 3,
      0,
      x,
      y,
      STONE_RADIUS
    )

    if (isBlack) {
      gradient.addColorStop(0, '#555555')
      gradient.addColorStop(1, GOMOKU_COLORS.BLACK_STONE)
    } else {
      gradient.addColorStop(0, '#ffffff')
      gradient.addColorStop(1, '#cccccc')
    }

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x, y, STONE_RADIUS, 0, Math.PI * 2)
    ctx.fill()
  }

  /**
   * 绘制游戏结束遮罩
   */
  private drawGameOverOverlay(ctx: CanvasRenderingContext2D): void {
    const { width, height } = this.config
    const { winner } = this._gameState

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(0, 0, width, height)

    ctx.fillStyle = GOMOKU_COLORS.WHITE_STONE
    ctx.font = 'bold 32px Arial'
    ctx.textAlign = 'center'

    if (winner === Stone.BLACK) {
      ctx.fillText('⚫ 黑棋胜利！', width / 2, height / 2 - 15)
    } else if (winner === Stone.WHITE) {
      ctx.fillText('⚪ 白棋胜利！', width / 2, height / 2 - 15)
    } else {
      ctx.fillText('平局！', width / 2, height / 2 - 15)
    }

    ctx.font = '16px Arial'
    ctx.fillText('按 R 重新开始', width / 2, height / 2 + 20)
  }

  /* ========== 输入处理 ========== */
  handleKeyDown(key: string): void {
    if (key === 'r' || key === 'R') {
      this.reset()
    } else if (key === 'z' || key === 'Z') {
      this.undoMove()
    }
  }

  handleKeyUp(_key: string): void {}

  /**
   * 处理点击
   */
  handleClick(x: number, y: number): void {
    const state = this.getState()
    if (state.status !== 'playing' || this._gameState.gameOver) return

    const pos = this.getBoardPosition(x, y)
    if (pos) {
      this.placeStone(pos.row, pos.col)
    }
  }

  /**
   * 处理鼠标移动
   */
  handleMouseMove(x: number, y: number): void {
    const pos = this.getBoardPosition(x, y)
    this._gameState.hoverPos = pos
  }
}