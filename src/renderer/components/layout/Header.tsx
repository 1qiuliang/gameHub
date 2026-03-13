/**
 * 头部组件
 * @description 应用顶部导航栏
 */

import { Link } from 'react-router-dom'
import styles from './Header.module.css'

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>🎮</span>
          <span className={styles.logoText}>GameHub</span>
        </Link>
      </div>

      <nav className={styles.nav}>
        <Link to="/" className={styles.navLink}>
          首页
        </Link>
        <Link to="/settings" className={styles.navLink}>
          设置
        </Link>
      </nav>
    </header>
  )
}

export default Header