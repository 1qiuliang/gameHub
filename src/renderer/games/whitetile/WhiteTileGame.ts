/**
 * 别踩白块游戏
 * @description 经典别踩白块游戏的实现
 */

import { BaseGame, type IGame, type GameMeta, type GameConfig } from '@/core'
import { GameCategory } from '@shared/types'
import { WHITETILE_CONFIG, WHITETILE_COLORS } from './config'

/**
 * 方块状态
 */
interface Tile {
  col: number
  y: number
  isBlack: boolean
  clicked: boolean
  error: boolean
}

/**
 * 游戏状态
 */
interface WhiteTileGameState {
  tiles: Tile[]
  speed: number
  lastTileY: number
  started: boolean
}

/**
 * 别踩白块游戏类
 */
export class WhiteTileGame extends BaseGame implements IGame {
  /* ========== 游戏元数据 ========== */
  readonly meta: GameMeta = {
    id: 'whitetile',
    name: '别踩白块',
    description: '经典的别踩白块游戏，快速点击下落的黑色方块，不要点到白块！',
    icon: '🎹',
    category: GameCategory.ACTION,
    author: 'GameHub',
    version: '1.0.0',
    tags: ['反应', '休闲', '街机'],
    controls: '使用数字键 1-4 或点击对应列的黑色方块',
  }

  /* ========== 游戏配置 ========== */
  readonly config: GameConfig = {
    width: 400,
    height: 600,
    showScore: true,
    showLevel: false,
    showLives: false,
    backgroundColor: WHITETILE_COLORS.BACKGROUND,
  }

  /* ========== 别踩白块特有状态 ========== */
  private _gameState: WhiteTileGameState

  constructor() {
    super()
    this._gameState = this.createGameState()
  }

  /**
   * 获取列宽度
   */
  private get tileWidth(): number {
    return this.config.width / WHITETILE_CONFIG.COLS
  }

  /**
   * 创建初始状态
   */
  private createGameState(): WhiteTileGameState {
    const tiles = this.generateInitialTiles()
    return {
      tiles,
      speed: WHITETILE_CONFIG.INITIAL_SPEED,
      lastTileY: 0,
      started: false,
    }
  }

  /**
   * 生成初始方块
   */
  private generateInitialTiles(): Tile[] {
    const tiles: Tile[] = []
    const { COLS, TILE_HEIGHT, VISIBLE_ROWS } = WHITETILE_CONFIG

    for (let row = 0; row < VISIBLE_ROWS + 2; row++) {
      const blackCol = Math.floor(Math.random() * COLS)
      for (let col = 0; col < COLS; col++) {
        tiles.push({
          col,
          y: row * TILE_HEIGHT - TILE_HEIGHT,
          isBlack: col === blackCol,
          clicked: false,
          error: false,
        })
      }
    }

    return tiles
  }

  /**
   * 添加新行
   */
  private addNewRow(): void {
    const { COLS, TILE_HEIGHT } = WHITETILE_CONFIG
    const blackCol = Math.floor(Math.random() * COLS)

    // 找到最上面的方块位置
    let minY = 0
    for (const tile of this._gameState.tiles) {
      minY = Math.min(minY, tile.y)
    }

    for (let col = 0; col < COLS; col++) {
      this._gameState.tiles.push({
        col,
        y: minY - TILE_HEIGHT,
        isBlack: col === blackCol,
        clicked: false,
        error: false,
      })
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

    if (state.status !== 'playing') {
      return
    }

    if (!this._gameState.started) {
      return
    }

    this.updateTiles()
  }

  /**
   * 更新方块位置
   */
  private updateTiles(): void {
    const { tiles, speed } = this._gameState
    const { TILE_HEIGHT } = WHITETILE_CONFIG
    const { height } = this.config

    // 移动所有方块
    for (const tile of tiles) {
      tile.y += speed
    }

    // 移除屏幕下方的方块
    while (tiles.length > 0 && tiles[0].y > height + TILE_HEIGHT) {
      // 检查是否有未点击的黑块离开屏幕
      if (tiles[0].isBlack && !tiles[0].clicked) {
        this.gameOver()
        return
      }
      tiles.shift()
    }

    // 添加新行
    const topTile = tiles[tiles.length - 1]
    if (topTile && topTile.y > -TILE_HEIGHT * 2) {
      this.addNewRow()
    }
  }

  /**
   * 点击处理
   */
  private handleClick(col: number): void {
    if (!this._gameState.started) {
      this._gameState.started = true
    }

    const { tiles } = this._gameState
    const { TILE_HEIGHT } = WHITETILE_CONFIG

    // 找到该列中最下面（y值最大）的未点击方块
    // 这是白块游戏的正确逻辑：玩家应该点击该列最下方的方块
    let targetTile: Tile | null = null
    let maxY = -Infinity

    for (const tile of tiles) {
      if (tile.col !== col || tile.clicked) continue

      // 只点击在屏幕范围内或刚进入屏幕的方块
      if (tile.y < -TILE_HEIGHT || tile.y > this.config.height) {
        continue
      }

      if (tile.y > maxY) {
        maxY = tile.y
        targetTile = tile
      }
    }

    if (!targetTile) {
      // 没找到有效方块，点击空白区域
      return
    }

    if (targetTile.isBlack) {
      // 点击黑块，得分
      targetTile.clicked = true
      const newScore = this.getState().score + 1
      this.setState({ score: newScore })
      this.emit('score', { score: newScore })

      // 更新速度
      const { SPEED_INCREMENT, MAX_SPEED, INITIAL_SPEED } = WHITETILE_CONFIG
      this._gameState.speed = Math.min(
        MAX_SPEED,
        INITIAL_SPEED + Math.floor(newScore / 10) * SPEED_INCREMENT
      )
    } else {
      // 点击白块，游戏结束
      targetTile.error = true
      this.gameOver()
    }
  }

  /* ========== 渲染逻辑 ========== */
  render(ctx: CanvasRenderingContext2D): void {
    const { tiles } = this._gameState
    const { COLS, TILE_HEIGHT } = WHITETILE_CONFIG
    const { width, height } = this.config
    const tileWidth = this.tileWidth

    // 清空画布
    ctx.fillStyle = WHITETILE_COLORS.BACKGROUND
    ctx.fillRect(0, 0, width, height)

    // 绘制方块
    for (const tile of tiles) {
      let color: string

      if (tile.error) {
        color = WHITETILE_COLORS.ERROR_TILE
      } else if (tile.clicked) {
        color = WHITETILE_COLORS.CLICKED_TILE
      } else if (tile.isBlack) {
        color = WHITETILE_COLORS.BLACK_TILE
      } else {
        color = WHITETILE_COLORS.WHITE_TILE
      }

      ctx.fillStyle = color
      ctx.fillRect(tile.col * tileWidth, tile.y, tileWidth, TILE_HEIGHT)
    }

    // 绘制分割线
    ctx.strokeStyle = WHITETILE_COLORS.DIVIDER
    ctx.lineWidth = 1

    // 垂直线
    for (let i = 1; i < COLS; i++) {
      ctx.beginPath()
      ctx.moveTo(i * tileWidth, 0)
      ctx.lineTo(i * tileWidth, height)
      ctx.stroke()
    }

    // 水平线（只画可见的）
    ctx.strokeStyle = 'rgba(189, 195, 199, 0.3)'
    for (let y = 0; y < height + TILE_HEIGHT; y += TILE_HEIGHT) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // 显示提示
    if (!this._gameState.started) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.fillRect(0, 0, width, height)

      ctx.fillStyle = WHITETILE_COLORS.WHITE_TILE
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('点击黑色方块开始', width / 2, height / 2)
      ctx.font = '16px Arial'
      ctx.fillText('使用数字键 1-4 或点击', width / 2, height / 2 + 30)
    }
  }

  /* ========== 输入处理 ========== */
  handleKeyDown(key: string): void {
    const state = this.getState()

    if (state.status !== 'playing') return

    // 数字键 1-4 对应四列
    const colMap: Record<string, number> = {
      '1': 0,
      '2': 1,
      '3': 2,
      '4': 3,
      'd': 0,
      'f': 1,
      'j': 2,
      'k': 3,
    }

    const col = colMap[key.toLowerCase()]
    if (col !== undefined) {
      this.handleClick(col)
    }

    switch (key) {
      case ' ':
        if (state.status === 'playing') {
          this.pause()
        } else if (state.status === 'paused') {
          this.resume()
        }
        break
    }
  }

  handleKeyUp(_key: string): void {
    // 不需要按键释放处理
  }
}