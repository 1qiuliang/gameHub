"use strict";
const electron = require("electron");
const api = {
  // 平台信息
  platform: process.platform,
  // IPC通信
  send: (channel, data) => {
    const validChannels = ["toMain"];
    if (validChannels.includes(channel)) {
      electron.ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, callback) => {
    const validChannels = ["fromMain"];
    if (validChannels.includes(channel)) {
      electron.ipcRenderer.on(channel, (_event, ...args) => callback(...args));
    }
  },
  // 应用信息
  getAppVersion: () => electron.ipcRenderer.invoke("get-app-version")
};
if (process.contextIsolated) {
  try {
    electron.contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error("预加载脚本暴露API失败:", error);
  }
} else {
  window.api = api;
}
