/**
 * 游戏注册中心
 * @description 管理所有游戏的注册、查询和生命周期
 */

import type { IGame, GameConstructor } from './interfaces/IGame'
import { GameCategory } from '@shared/types'

/**
 * 游戏注册项
 */
interface GameRegistration {
  /** 游戏类构造器 */
  constructor: GameConstructor
  /** 游戏实例（懒加载） */
  instance: IGame | null
}

/**
 * 游戏注册中心
 * @description 单例模式，统一管理所有游戏插件
 */
class GameRegistryImpl {
  /** 游戏注册表 */
  private _games: Map<string, GameRegistration> = new Map()

  /**
   * 注册游戏
   * @param GameClass - 游戏类构造器
   * @description 注册一个游戏类，实际实例延迟到首次访问时创建
   */
  register(GameClass: GameConstructor): void {
    // 创建临时实例获取元数据
    const tempInstance = new GameClass()
    const meta = tempInstance.meta

    if (this._games.has(meta.id)) {
      console.warn(`[GameRegistry] 游戏 "${meta.id}" 已存在，将被覆盖`)
    }

    this._games.set(meta.id, {
      constructor: GameClass,
      instance: null,
    })

    console.log(`[GameRegistry] 游戏注册成功: ${meta.name} (${meta.id})`)
  }

  /**
   * 注销游戏
   * @param gameId - 游戏ID
   */
  unregister(gameId: string): boolean {
    const registration = this._games.get(gameId)
    if (!registration) {
      return false
    }

    // 销毁实例
    if (registration.instance) {
      registration.instance.destroy()
    }

    this._games.delete(gameId)
    console.log(`[GameRegistry] 游戏已注销: ${gameId}`)
    return true
  }

  /**
   * 获取游戏实例
   * @param gameId - 游戏ID
   * @returns 游戏实例，不存在则返回undefined
   */
  get(gameId: string): IGame | undefined {
    const registration = this._games.get(gameId)
    if (!registration) {
      return undefined
    }

    // 【懒加载】首次访问时创建实例
    if (!registration.instance) {
      registration.instance = new registration.constructor()
    }

    return registration.instance
  }

  /**
   * 获取所有游戏元数据
   * @returns 游戏元数据数组
   */
  getAllMeta(): Array<IGame['meta']> {
    const metas: Array<IGame['meta']> = []

    this._games.forEach((registration) => {
      if (registration.instance) {
        metas.push(registration.instance.meta)
      } else {
        // 创建临时实例获取元数据
        const temp = new registration.constructor()
        metas.push(temp.meta)
      }
    })

    return metas
  }

  /**
   * 按分类获取游戏元数据
   * @param category - 游戏分类
   * @returns 该分类下的游戏元数据数组
   */
  getByCategory(category: GameCategory): Array<IGame['meta']> {
    return this.getAllMeta().filter((meta) => meta.category === category)
  }

  /**
   * 搜索游戏
   * @param keyword - 搜索关键词
   * @returns 匹配的游戏元数据数组
   */
  search(keyword: string): Array<IGame['meta']> {
    const lowerKeyword = keyword.toLowerCase()
    return this.getAllMeta().filter((meta) => {
      return (
        meta.name.toLowerCase().includes(lowerKeyword) ||
        meta.description.toLowerCase().includes(lowerKeyword) ||
        meta.tags?.some((tag) => tag.toLowerCase().includes(lowerKeyword))
      )
    })
  }

  /**
   * 检查游戏是否存在
   * @param gameId - 游戏ID
   */
  has(gameId: string): boolean {
    return this._games.has(gameId)
  }

  /**
   * 获取游戏数量
   */
  get size(): number {
    return this._games.size
  }

  /**
   * 清空所有游戏
   */
  clear(): void {
    this._games.forEach((registration) => {
      if (registration.instance) {
        registration.instance.destroy()
      }
    })
    this._games.clear()
    console.log('[GameRegistry] 所有游戏已清空')
  }
}

// 【导出单例】
export const gameRegistry = new GameRegistryImpl()