/**
 * Electron 预加载脚本
 * @description 暴露安全的API给渲染进程，作为主进程和渲染进程的桥梁
 */

import { contextBridge, ipcRenderer } from 'electron'

// 【自定义API】
const api = {
  // 平台信息
  platform: process.platform,

  // IPC通信
  send: (channel: string, data: unknown) => {
    const validChannels = ['toMain']
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },

  receive: (channel: string, callback: (...args: unknown[]) => void) => {
    const validChannels = ['fromMain']
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (_event, ...args) => callback(...args))
    }
  },

  // 应用信息
  getAppVersion: () => ipcRenderer.invoke('get-app-version')
}

// 【暴露API到渲染进程】
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error('预加载脚本暴露API失败:', error)
  }
} else {
  // @ts-ignore
  window.api = api
}