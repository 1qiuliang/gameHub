/**
 * Electron 主进程入口
 * @description 负责创建和管理应用窗口，处理系统级事件
 */

import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'

/**
 * 创建主窗口
 */
function createWindow(): void {
  // 【窗口配置】
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    title: 'GameHub - 游戏中心',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  // 【窗口就绪事件】
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // 【外部链接处理】
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // 【开发工具快捷键】
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12') {
      mainWindow.webContents.toggleDevTools()
      event.preventDefault()
    }
  })

  // 【加载页面】
  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// 【应用生命周期】
app.whenReady().then(() => {
  // 设置应用用户模型ID（Windows）
  app.setAppUserModelId('com.gamehub')

  createWindow()

  // macOS激活应用时重新创建窗口
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 所有窗口关闭时退出应用（macOS除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})