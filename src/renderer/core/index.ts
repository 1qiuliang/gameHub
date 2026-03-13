/**
 * 核心模块统一导出
 * @description 导出核心接口、基类、注册中心和引擎模块
 */

// 接口
export * from './interfaces'

// 基类
export { BaseGame } from './BaseGame'

// 注册中心
export { gameRegistry } from './GameRegistry'

// 渲染引擎
export { CanvasRenderer } from './renderer'

// 输入管理
export { inputManager } from './input'

// 音效管理
export { audioManager } from './audio'