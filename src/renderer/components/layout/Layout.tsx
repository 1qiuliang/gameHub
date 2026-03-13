/**
 * 布局组件
 * @description 应用的整体布局框架
 */

import Header from './Header'
import styles from './Layout.module.css'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>{children}</main>
    </div>
  )
}

export default Layout