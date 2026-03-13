/**
 * 设置页面
 * @description 应用设置和游戏配置
 */

import styles from './Settings.module.css'

const Settings: React.FC = () => {
  return (
    <div className={styles.settings}>
      <h1 className={styles.title}>设置</h1>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>音量设置</h2>
        <div className={styles.settingItem}>
          <label>主音量</label>
          <input type="range" min="0" max="100" defaultValue="80" />
        </div>
        <div className={styles.settingItem}>
          <label>音效</label>
          <input type="range" min="0" max="100" defaultValue="100" />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>显示设置</h2>
        <div className={styles.settingItem}>
          <label>主题</label>
          <select defaultValue="dark">
            <option value="dark">深色模式</option>
            <option value="light" disabled>
              浅色模式（即将推出）
            </option>
          </select>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>关于</h2>
        <div className={styles.aboutInfo}>
          <p>
            <strong>GameHub</strong> v1.0.0
          </p>
          <p>一个可扩展的游戏集合中心</p>
          <p className={styles.copyright}>© 2024 GameHub Team</p>
        </div>
      </div>
    </div>
  )
}

export default Settings