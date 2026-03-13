/**
 * 游戏注册中心
 * @description 自动注册所有游戏到游戏中心
 */

import { gameRegistry } from '@/core'

// 【导入游戏】
import { SnakeGame } from './snake'
import { Game2048 } from './game2048'
import { ShooterGame } from './shooter'

// 【注册游戏】
gameRegistry.register(SnakeGame)
gameRegistry.register(Game2048)
gameRegistry.register(ShooterGame)

// 【导出注册中心】
export { gameRegistry }