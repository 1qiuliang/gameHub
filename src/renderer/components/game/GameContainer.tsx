/**
 * 游戏容器组件
 * @description 提供游戏运行的Canvas容器和状态UI
 */

import { useEffect, useRef, useCallback, useState } from 'react'
import type { IGame } from '@/core/interfaces'
import { GameStatus } from '@shared/types'
import styles from './GameContainer.module.css'

interface GameContainerProps {
  /** 游戏实例 */
  game: IGame
}

const GameContainer: React.FC<GameContainerProps> = ({ game }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // 【使用React状态追踪游戏状态，确保UI同步更新】
  const [gameState, setGameState] = useState(game.getState())

  /**
   * 初始化游戏
   */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // 【订阅状态变化】
    const handleStateChange = () => {
      setGameState(game.getState())
    }

    // 监听游戏事件以更新UI
    game.on('start', handleStateChange)
    game.on('pause', handleStateChange)
    game.on('resume', handleStateChange)
    game.on('gameover', handleStateChange)
    game.on('reset', handleStateChange)
    game.on('score', handleStateChange)

    // 【绑定键盘事件】
    const handleKeyDown = (e: KeyboardEvent) => {
      game.handleKeyDown(e.key)
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      game.handleKeyUp(e.key)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    // 【异步初始化游戏】
    let mounted = true
    const initGame = async () => {
      await game.init(canvas)
      if (mounted) {
        // 【初始渲染】在IDLE状态绘制初始画面
        const ctx = canvas.getContext('2d')
        if (ctx) {
          game.render(ctx)
        }
      }
    }
    initGame()

    return () => {
      mounted = false
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      game.destroy()
    }
  }, [game])

  /**
   * 处理开始游戏
   */
  const handleStart = useCallback(() => {
    game.start()
    setGameState(game.getState())
  }, [game])

  /**
   * 处理暂停/继续
   */
  const handlePauseResume = useCallback(() => {
    if (gameState.status === GameStatus.PLAYING) {
      game.pause()
    } else if (gameState.status === GameStatus.PAUSED) {
      game.resume()
    }
    setGameState(game.getState())
  }, [game, gameState.status])

  /**
   * 处理重新开始
   */
  const handleRestart = useCallback(() => {
    game.reset()
    game.start()
    setGameState(game.getState())
  }, [game])

  /**
   * 格式化时间
   */
  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={styles.container}>
      {/* 游戏信息栏 */}
      <div className={styles.infoBar}>
        {game.config.showScore !== false && (
          <div className={styles.infoItem}>
            <span className={styles.label}>分数</span>
            <span className={styles.value}>{gameState.score}</span>
          </div>
        )}
        {game.config.showLevel !== false && (
          <div className={styles.infoItem}>
            <span className={styles.label}>等级</span>
            <span className={styles.value}>{gameState.level}</span>
          </div>
        )}
        {game.config.showLives && (
          <div className={styles.infoItem}>
            <span className={styles.label}>生命</span>
            <span className={styles.value}>{gameState.lives}</span>
          </div>
        )}
        {gameState.status === GameStatus.PLAYING && (
          <div className={styles.controls}>
            <button onClick={handlePauseResume} className={styles.controlBtn}>
              暂停
            </button>
            <button onClick={handleRestart} className={styles.controlBtn}>
              重新开始
            </button>
          </div>
        )}
      </div>

      {/* 游戏画布 */}
      <div className={styles.canvasWrapper}>
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>

      {/* 开始界面 */}
      {gameState.status === GameStatus.IDLE && (
        <div className={styles.overlay}>
          <div className={styles.overlayContent}>
            <h2>{game.meta.name}</h2>
            <p className={styles.description}>{game.meta.description}</p>
            {game.meta.controls && (
              <p className={styles.controls_hint}>{game.meta.controls}</p>
            )}
            <button onClick={handleStart} className={styles.startBtn}>
              开始游戏
            </button>
          </div>
        </div>
      )}

      {/* 暂停遮罩 */}
      {gameState.status === GameStatus.PAUSED && (
        <div className={styles.overlay}>
          <div className={styles.overlayContent}>
            <h2>游戏暂停</h2>
            <p>按 空格键 或点击继续按钮恢复游戏</p>
            <div className={styles.overlayButtons}>
              <button onClick={handlePauseResume} className={styles.startBtn}>
                继续游戏
              </button>
              <button onClick={handleRestart} className={styles.controlBtn}>
                重新开始
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 游戏结束遮罩 */}
      {gameState.status === GameStatus.GAME_OVER && (
        <div className={styles.overlay}>
          <div className={styles.overlayContent}>
            <h2 className={styles.gameOverTitle}>游戏结束</h2>
            <div className={styles.summary}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>最终得分</span>
                <span className={styles.summaryValue}>{gameState.score}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>最高等级</span>
                <span className={styles.summaryValue}>{gameState.level}</span>
              </div>
              {gameState.elapsedTime > 0 && (
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>游戏时长</span>
                  <span className={styles.summaryValue}>
                    {formatTime(gameState.elapsedTime)}
                  </span>
                </div>
              )}
              {gameState.highScore > 0 && (
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>历史最高</span>
                  <span className={styles.summaryValue + ' ' + styles.highlight}>
                    {gameState.highScore}
                  </span>
                </div>
              )}
            </div>
            <div className={styles.overlayButtons}>
              <button onClick={handleRestart} className={styles.startBtn}>
                再来一局
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GameContainer