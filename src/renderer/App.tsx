/**
 * 应用主组件
 * @description 负责路由配置和全局布局
 */

import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import GamePage from './pages/GamePage'
import Settings from './pages/Settings'

const App: React.FC = () => {
  return (
    <Layout>
      <Routes>
        {/* 主页面 - 游戏选择 */}
        <Route path="/" element={<Home />} />
        {/* 游戏运行页面 */}
        <Route path="/game/:gameId" element={<GamePage />} />
        {/* 设置页面 */}
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  )
}

export default App