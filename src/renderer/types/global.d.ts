/**
 * Web端类型定义
 * @description 定义Web环境的全局类型
 */

// 全局 API 类型（Web端为空对象）
interface Window {
  api?: {
    platform: string
    send: (channel: string, data: unknown) => void
    receive: (channel: string, callback: (...args: unknown[]) => void) => void
    getAppVersion: () => Promise<string>
  }
}