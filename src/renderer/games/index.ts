/**
 * 游戏注册中心
 * @description 自动注册所有游戏到游戏中心
 */

import { gameRegistry } from '@/core'

// 【导入游戏】
import { SnakeGame } from './snake'
import { Game2048 } from './game2048'
import { ShooterGame } from './shooter'
import { BreakoutGame } from './breakout'
import { FlappyBirdGame } from './flappybird'
import { WhiteTileGame } from './whitetile'
import { ReactionGame } from './reaction'
import { MinesweeperGame } from './minesweeper'
import { Match3Game } from './match3'
import { JumpJumpGame } from './jumpjump'
import { GomokuGame } from './gomoku'
import { Puzzle15Game } from './puzzle15'

// 【注册游戏】
gameRegistry.register(SnakeGame)
gameRegistry.register(Game2048)
gameRegistry.register(ShooterGame)
gameRegistry.register(BreakoutGame)
gameRegistry.register(FlappyBirdGame)
gameRegistry.register(WhiteTileGame)
gameRegistry.register(ReactionGame)
gameRegistry.register(MinesweeperGame)
gameRegistry.register(Match3Game)
gameRegistry.register(JumpJumpGame)
gameRegistry.register(GomokuGame)
gameRegistry.register(Puzzle15Game)

// 【导出注册中心】
export { gameRegistry }