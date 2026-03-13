/**
 * 游戏运行页面
 * @description 游戏的实际运行页面，负责加载和运行游戏
 */

import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { GameContainer } from '@/components'
import { gameRegistry } from '@/core'
import type { IGame } from '@/core/interfaces'
import styles from './GamePage.module.css'

const GamePage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const [game, setGame] = useState<IGame | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 【加载游戏】
  useEffect(() => {
    if (!gameId) {
      setError('游戏ID不存在')
      return
    }

    const gameInstance = gameRegistry.get(gameId)
    if (!gameInstance) {
      setError(`游戏 "${gameId}" 不存在`)
      return
    }

    setGame(gameInstance)
    setError(null)
  }, [gameId])

  // 【返回首页】
  const handleBack = () => {
    navigate('/')
  }

  // 【错误状态】
  if (error) {
    return (
      <div className={styles.error}>
        <h2>出错了</h2>
        <p>{error}</p>
        <Link to="/" className={styles.backLink}>
          返回首页
        </Link>
      </div>
    )
  }

  // 【加载中】
  if (!game) {
    return (
      <div className={styles.loading}>
        <p>加载游戏中...</p>
      </div>
    )
  }

  // 【游戏运行】
  return (
    <div className={styles.gamePage}>
      <div className={styles.header}>
        <button onClick={handleBack} className={styles.backBtn}>
          ← 返回
        </button>
        <h1 className={styles.gameTitle}>{game.meta.name}</h1>
        <p className={styles.gameDesc}>{game.meta.description}</p>
      </div>

      <GameContainer game={game} />

      {game.meta.controls && (
        <div className={styles.controls}>
          <h3>操作说明</h3>
          <p>{game.meta.controls}</p>
        </div>
      )}
    </div>
  )
}

export default GamePage