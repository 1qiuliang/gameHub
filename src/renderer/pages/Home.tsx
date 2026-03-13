/**
 * 主页面
 * @description 游戏选择的主界面，展示所有游戏
 */

import { useMemo } from 'react'
import { GameCard } from '@/components'
import { gameRegistry } from '@/core'
import { GameCategory } from '@shared/types'
import styles from './Home.module.css'

const Home: React.FC = () => {
  // 【获取游戏列表】
  const games = useMemo(() => gameRegistry.getAllMeta(), [])

  // 【按分类分组】
  const classicGames = useMemo(
    () => games.filter((g) => g.category === GameCategory.CLASSIC),
    [games]
  )
  const puzzleGames = useMemo(
    () => games.filter((g) => g.category === GameCategory.PUZZLE),
    [games]
  )
  const actionGames = useMemo(
    () => games.filter((g) => g.category === GameCategory.ACTION),
    [games]
  )

  return (
    <div className={styles.home}>
      {/* 页面标题 */}
      <div className={styles.header}>
        <h1 className={styles.title}>欢迎来到 GameHub</h1>
        <p className={styles.subtitle}>选择一款游戏开始你的冒险之旅</p>
      </div>

      {/* 经典游戏 */}
      {classicGames.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🎮 经典游戏</h2>
          <div className={styles.gameGrid}>
            {classicGames.map((meta) => (
              <GameCard key={meta.id} meta={meta} />
            ))}
          </div>
        </section>
      )}

      {/* 益智游戏 */}
      {puzzleGames.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🧩 益智游戏</h2>
          <div className={styles.gameGrid}>
            {puzzleGames.map((meta) => (
              <GameCard key={meta.id} meta={meta} />
            ))}
          </div>
        </section>
      )}

      {/* 动作游戏 */}
      {actionGames.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🎯 动作游戏</h2>
          <div className={styles.gameGrid}>
            {actionGames.map((meta) => (
              <GameCard key={meta.id} meta={meta} />
            ))}
          </div>
        </section>
      )}

      {/* 空状态 */}
      {games.length === 0 && (
        <div className={styles.empty}>
          <p>暂无游戏，请添加游戏到游戏中心</p>
        </div>
      )}
    </div>
  )
}

export default Home