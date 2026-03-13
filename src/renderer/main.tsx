/**
 * 渲染进程入口
 * @description React应用的入口文件
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './styles/index.css'

// 【游戏注册】必须在应用渲染前导入，确保游戏注册完成
import '@/games'

// 【应用挂载】
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
)