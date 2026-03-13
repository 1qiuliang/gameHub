/**
 * 消消乐游戏
 * @description 经典三消游戏实现
 */

import { BaseGame, type IGame, type GameMeta, type GameConfig } from '@/core'
import { GameCategory } from '@shared/types'
import { GEM_TYPES, MATCH3_CONFIG, MATCH3_COLORS } from './config'

/**
 * 宝石状态
 */
interface Gem {
  type: number
  x: number
  y: number
  targetY: number
  falling: boolean
  matched: boolean
}

/**
 * 游戏状态
 */
interface Match3GameState {
  grid: (Gem | null)[][]
  selected: { row: number; col: number } | null
  animating: boolean
  combo: number
}

/**
 * 消消乐游戏类
 */
export class Match3Game extends BaseGame implements IGame {
  /* ========== 游戏元数据 ========== */
  readonly meta: GameMeta = {
    id: 'match3',
    name: '消消乐',
    description: '经典三消游戏，交换相邻宝石使三个或更多相同宝石连成一线消除！',
    icon: '💎',
    category: GameCategory.PUZZLE,
    author: 'GameHub',
    version: '1.0.0',
    tags: ['益智', '休闲', '消除'],
    controls: '点击选择宝石，再点击相邻宝石交换，或使用方向键移动选择',
  }

  /* ========== 游戏配置 ========== */
  readonly config: GameConfig = {
    width: 400,
    height: 400,
    showScore: true,
    showLevel: false,
    showLives: false,
    backgroundColor: MATCH3_COLORS.BACKGROUND,
  }

  /* ========== 消消乐特有状态 ========== */
  private _gameState: Match3GameState
  private _gridOffset: { x: number; y: number }

  constructor() {
    super()
    this._gridOffset = { x: 0, y: 0 }
    this._gameState = this.createGameState()
  }

  /**
   * 创建初始状态
   */
  private createGameState(): Match3GameState {
    const size = MATCH3_CONFIG.GRID_SIZE
    const grid: (Gem | null)[][] = []

    // 初始化空网格
    for (let row = 0; row < size; row++) {
      grid[row] = []
      for (let col = 0; col < size; col++) {
        grid[row][col] = null
      }
    }

    return {
      grid,
      selected: null,
      animating: false,
      combo: 0,
    }
  }

  /**
   * 填充网格
   */
  private fillGrid(): void {
    const size = MATCH3_CONFIG.GRID_SIZE
    const { grid } = this._gameState

    // 填充所有空格
    for (let col = 0; col < size; col++) {
      // 从底部开始填充
      let emptySpaces = 0
      for (let row = size - 1; row >= 0; row--) {
        if (grid[row][col] === null) {
          emptySpaces++
        }
      }

      for (let row = size - 1; row >= 0; row--) {
        if (grid[row][col] === null) {
          // 创建新宝石，从上方掉落
          const type = this.getRandomGemType(row, col)
          grid[row][col] = {
            type,
            x: col,
            y: -emptySpaces,
            targetY: row,
            falling: true,
            matched: false,
          }
          emptySpaces--
        }
      }
    }

    this._gameState.animating = true
  }

  /**
   * 获取随机宝石类型（避免初始匹配）
   */
  private getRandomGemType(row: number, col: number): number {
    const size = MATCH3_CONFIG.GRID_SIZE
    const { grid } = this._gameState
    const maxType = GEM_TYPES.length

    let type: number
    let attempts = 0

    do {
      type = Math.floor(Math.random() * maxType)
      attempts++

      // 检查水平方向是否已有两个相同
      if (col >= 2) {
        const left1 = grid[row][col - 1]
        const left2 = grid[row][col - 2]
        if (left1 && left2 && left1.type === type && left2.type === type) {
          continue
        }
      }

      // 检查垂直方向是否已有两个相同
      if (row >= 2) {
        const up1 = grid[row - 1]?.[col]
        const up2 = grid[row - 2]?.[col]
        if (up1 && up2 && up1.type === type && up2.type === type) {
          continue
        }
      }

      break
    } while (attempts < 100)

    return type
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
    this.fillGrid()
    // 清除初始匹配
    setTimeout(() => this.processMatches(), 100)
  }

  /* ========== 更新逻辑 ========== */
  update(_deltaTime: number): void {
    const state = this.getState()
    if (state.status !== 'playing') return

    if (this._gameState.animating) {
      this.updateAnimations()
    }
  }

  /**
   * 更新动画
   */
  private updateAnimations(): void {
    const size = MATCH3_CONFIG.GRID_SIZE
    const { grid } = this._gameState
    let stillAnimating = false

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const gem = grid[row][col]
        if (!gem) continue

        if (gem.falling) {
          gem.y += MATCH3_CONFIG.FALL_SPEED / 100
          if (gem.y >= gem.targetY) {
            gem.y = gem.targetY
            gem.falling = false
          } else {
            stillAnimating = true
          }
        }
      }
    }

    if (!stillAnimating) {
      this._gameState.animating = false
      // 检查是否有新的匹配
      this.processMatches()
    }
  }

  /**
   * 处理匹配
   */
  private processMatches(): void {
    const matches = this.findMatches()
    if (matches.length === 0) {
      this._gameState.combo = 0
      return
    }

    this._gameState.combo++
    this.removeMatches(matches)
    this.dropGems()
    this.fillGrid()
  }

  /**
   * 查找所有匹配
   */
  private findMatches(): { row: number; col: number }[] {
    const size = MATCH3_CONFIG.GRID_SIZE
    const { grid } = this._gameState
    const matches = new Set<string>()

    // 水平匹配
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size - 2; col++) {
        const gem = grid[row][col]
        const gem1 = grid[row][col + 1]
        const gem2 = grid[row][col + 2]

        if (gem && gem1 && gem2 && gem.type === gem1.type && gem1.type === gem2.type) {
          matches.add(`${row},${col}`)
          matches.add(`${row},${col + 1}`)
          matches.add(`${row},${col + 2}`)

          // 检查更长的匹配
          for (let c = col + 3; c < size; c++) {
            if (grid[row][c]?.type === gem.type) {
              matches.add(`${row},${c}`)
            } else break
          }
        }
      }
    }

    // 垂直匹配
    for (let col = 0; col < size; col++) {
      for (let row = 0; row < size - 2; row++) {
        const gem = grid[row][col]
        const gem1 = grid[row + 1][col]
        const gem2 = grid[row + 2][col]

        if (gem && gem1 && gem2 && gem.type === gem1.type && gem1.type === gem2.type) {
          matches.add(`${row},${col}`)
          matches.add(`${row + 1},${col}`)
          matches.add(`${row + 2},${col}`)

          for (let r = row + 3; r < size; r++) {
            if (grid[r][col]?.type === gem.type) {
              matches.add(`${r},${col}`)
            } else break
          }
        }
      }
    }

    return Array.from(matches).map((s) => {
      const [row, col] = s.split(',').map(Number)
      return { row, col }
    })
  }

  /**
   * 移除匹配的宝石
   */
  private removeMatches(matches: { row: number; col: number }[]): void {
    const { grid } = this._gameState
    let points = 0

    for (const { row, col } of matches) {
      if (grid[row][col]) {
        grid[row][col] = null
        points += 10 * this._gameState.combo
      }
    }

    const newScore = this.getState().score + points
    this.setState({ score: newScore })
    this.emit('score', { score: newScore })
  }

  /**
   * 宝石下落
   */
  private dropGems(): void {
    const size = MATCH3_CONFIG.GRID_SIZE
    const { grid } = this._gameState

    for (let col = 0; col < size; col++) {
      let emptyRow = size - 1

      for (let row = size - 1; row >= 0; row--) {
        if (grid[row][col] !== null) {
          if (row !== emptyRow) {
            grid[emptyRow][col] = grid[row][col]!
            grid[emptyRow][col]!.targetY = emptyRow
            grid[emptyRow][col]!.falling = true
            grid[row][col] = null
          }
          emptyRow--
        }
      }
    }

    this._gameState.animating = true
  }

  /**
   * 尝试交换宝石
   */
  private trySwap(row1: number, col1: number, row2: number, col2: number): void {
    const { grid, animating } = this._gameState
    if (animating) return

    const gem1 = grid[row1][col1]
    const gem2 = grid[row2][col2]

    if (!gem1 || !gem2) return

    // 交换
    grid[row1][col1] = gem2
    grid[row2][col2] = gem1
    gem1.x = col2
    gem1.y = row2
    gem2.x = col1
    gem2.y = row1

    // 检查是否形成匹配
    const matches = this.findMatches()
    if (matches.length === 0) {
      // 无效交换，换回来
      grid[row1][col1] = gem1
      grid[row2][col2] = gem2
      gem1.x = col1
      gem1.y = row1
      gem2.x = col2
      gem2.y = row2
    } else {
      // 有效交换，处理匹配
      this.processMatches()
    }

    this._gameState.selected = null
  }

  /* ========== 渲染逻辑 ========== */
  render(ctx: CanvasRenderingContext2D): void {
    const { width, height } = this.config
    const size = MATCH3_CONFIG.GRID_SIZE
    const gemSize = MATCH3_CONFIG.GEM_SIZE

    // 计算偏移使网格居中
    this._gridOffset.x = (width - size * gemSize) / 2
    this._gridOffset.y = (height - size * gemSize) / 2

    // 清空画布
    ctx.fillStyle = MATCH3_COLORS.BACKGROUND
    ctx.fillRect(0, 0, width, height)

    // 绘制网格背景
    ctx.fillStyle = MATCH3_COLORS.GRID_BG
    ctx.fillRect(
      this._gridOffset.x,
      this._gridOffset.y,
      size * gemSize,
      size * gemSize
    )

    // 绘制宝石
    const { grid, selected } = this._gameState

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const gem = grid[row][col]
        if (!gem) continue

        const x = this._gridOffset.x + gem.x * gemSize + gemSize / 2
        const y = this._gridOffset.y + gem.y * gemSize + gemSize / 2

        this.drawGem(ctx, x, y, gem.type, gemSize * 0.4)

        // 绘制选中边框
        if (selected && selected.row === row && selected.col === col) {
          ctx.strokeStyle = MATCH3_COLORS.SELECTED
          ctx.lineWidth = 3
          ctx.strokeRect(
            this._gridOffset.x + col * gemSize + 2,
            this._gridOffset.y + row * gemSize + 2,
            gemSize - 4,
            gemSize - 4
          )
        }
      }
    }
  }

  /**
   * 绘制宝石
   */
  private drawGem(ctx: CanvasRenderingContext2D, x: number, y: number, type: number, r: number): void {
    const gemType = GEM_TYPES[type]
    ctx.fillStyle = gemType.color

    switch (gemType.shape) {
      case 'circle':
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
        break

      case 'diamond':
        ctx.beginPath()
        ctx.moveTo(x, y - r)
        ctx.lineTo(x + r, y)
        ctx.lineTo(x, y + r)
        ctx.lineTo(x - r, y)
        ctx.closePath()
        ctx.fill()
        break

      case 'square':
        ctx.fillRect(x - r * 0.8, y - r * 0.8, r * 1.6, r * 1.6)
        break

      case 'triangle':
        ctx.beginPath()
        ctx.moveTo(x, y - r)
        ctx.lineTo(x + r * 0.9, y + r * 0.7)
        ctx.lineTo(x - r * 0.9, y + r * 0.7)
        ctx.closePath()
        ctx.fill()
        break

      case 'star':
        this.drawStar(ctx, x, y, 5, r, r * 0.5)
        break

      case 'hexagon':
        ctx.beginPath()
        for (let i = 0; i < 6; i++) {
          const angle = (i * 60 - 30) * (Math.PI / 180)
          const px = x + r * Math.cos(angle)
          const py = y + r * Math.sin(angle)
          if (i === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        }
        ctx.closePath()
        ctx.fill()
        break
    }

    // 高光效果
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.beginPath()
    ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.3, 0, Math.PI * 2)
    ctx.fill()
  }

  /**
   * 绘制星形
   */
  private drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerR: number, innerR: number): void {
    ctx.beginPath()
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR
      const angle = (i * 36 - 90) * (Math.PI / 180)
      const x = cx + r * Math.cos(angle)
      const y = cy + r * Math.sin(angle)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.fill()
  }

  /* ========== 输入处理 ========== */
  handleKeyDown(key: string): void {
    const state = this.getState()
    if (state.status !== 'playing' || this._gameState.animating) return

    const { selected } = this._gameState
    const size = MATCH3_CONFIG.GRID_SIZE

    if (!selected) {
      this._gameState.selected = { row: 3, col: 3 }
      return
    }

    let newRow = selected.row
    let newCol = selected.col

    switch (key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        newRow = Math.max(0, selected.row - 1)
        break
      case 'ArrowDown':
      case 's':
      case 'S':
        newRow = Math.min(size - 1, selected.row + 1)
        break
      case 'ArrowLeft':
      case 'a':
      case 'A':
        newCol = Math.max(0, selected.col - 1)
        break
      case 'ArrowRight':
      case 'd':
      case 'D':
        newCol = Math.min(size - 1, selected.col + 1)
        break
      case ' ':
      case 'Enter':
        if (selected) {
          this.trySwap(selected.row, selected.col, newRow, newCol)
        }
        return
    }

    // 如果按住Shift则交换
    if (newRow !== selected.row || newCol !== selected.col) {
      this._gameState.selected = { row: newRow, col: newCol }
    }
  }

  handleKeyUp(_key: string): void {}

  /**
   * 处理点击
   */
  handleClick(x: number, y: number): void {
    const state = this.getState()
    if (state.status !== 'playing' || this._gameState.animating) return

    const size = MATCH3_CONFIG.GRID_SIZE
    const gemSize = MATCH3_CONFIG.GEM_SIZE

    const col = Math.floor((x - this._gridOffset.x) / gemSize)
    const row = Math.floor((y - this._gridOffset.y) / gemSize)

    if (row < 0 || row >= size || col < 0 || col >= size) return

    const { selected } = this._gameState

    if (!selected) {
      this._gameState.selected = { row, col }
    } else {
      // 检查是否相邻
      const isAdjacent =
        (Math.abs(selected.row - row) === 1 && selected.col === col) ||
        (Math.abs(selected.col - col) === 1 && selected.row === row)

      if (isAdjacent) {
        this.trySwap(selected.row, selected.col, row, col)
      } else {
        this._gameState.selected = { row, col }
      }
    }
  }
}