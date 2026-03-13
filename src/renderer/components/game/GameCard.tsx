/**
 * 游戏卡片组件
 * @description 展示游戏信息和快捷入口
 */

import { Link } from 'react-router-dom'
import type { GameMeta } from '@/core/interfaces'
import { GameCategory } from '@shared/types'
import styles from './GameCard.module.css'

interface GameCardProps {
  /** 游戏元数据 */
  meta: GameMeta
  /** 最高分 */
  highScore?: number
}

/**
 * 获取分类显示名称
 */
const getCategoryName = (category: GameCategory): string => {
  const names: Record<GameCategory, string> = {
    [GameCategory.CLASSIC]: '经典',
    [GameCategory.PUZZLE]: '益智',
    [GameCategory.ACTION]: '动作',
  }
  return names[category] || category
}

const GameCard: React.FC<GameCardProps> = ({ meta, highScore }) => {
  return (
    <Link to={`/game/${meta.id}`} className={styles.card}>
      <div className={styles.iconWrapper}>
        <span className={styles.icon}>{meta.icon}</span>
      </div>

      <div className={styles.info}>
        <h3 className={styles.name}>{meta.name}</h3>
        <p className={styles.description}>{meta.description}</p>

        <div className={styles.meta}>
          <span className={styles.category}>{getCategoryName(meta.category)}</span>
          {highScore !== undefined && highScore > 0 && (
            <span className={styles.highScore}>最高分: {highScore}</span>
          )}
        </div>
      </div>

      <div className={styles.playButton}>
        <span>开始游戏</span>
      </div>
    </Link>
  )
}

export default GameCard