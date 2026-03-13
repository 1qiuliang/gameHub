/**
 * 输入管理器
 * @description 统一管理键盘输入，提供按键状态查询和事件回调
 */

/**
 * 按键回调函数类型
 */
type KeyCallback = () => void

/**
 * 按键绑定配置
 */
interface KeyBinding {
  /** 按键回调 */
  callback: KeyCallback
  /** 是否只触发一次 */
  once?: boolean
}

/**
 * 输入管理器类
 * @description 单例模式，全局管理键盘输入
 */
class InputManagerImpl {
  /** 当前按下的按键 */
  private _pressedKeys: Set<string> = new Set()
  /** 本帧刚按下的按键 */
  private _justPressedKeys: Set<string> = new Set()
  /** 本帧刚释放的按键 */
  private _justReleasedKeys: Set<string> = new Set()
  /** 按键绑定映射 */
  private _keyBindings: Map<string, KeyBinding[]> = new Map()
  /** 是否已初始化 */
  private _initialized: boolean = false

  /**
   * 初始化输入管理器
   * @description 绑定全局键盘事件监听
   */
  init(): void {
    if (this._initialized) {
      console.warn('[InputManager] 已经初始化')
      return
    }

    window.addEventListener('keydown', this.handleKeyDown.bind(this))
    window.addEventListener('keyup', this.handleKeyUp.bind(this))
    window.addEventListener('blur', this.handleBlur.bind(this))

    this._initialized = true
    console.log('[InputManager] 初始化完成')
  }

  /**
   * 销毁输入管理器
   */
  destroy(): void {
    window.removeEventListener('keydown', this.handleKeyDown.bind(this))
    window.removeEventListener('keyup', this.handleKeyUp.bind(this))
    window.removeEventListener('blur', this.handleBlur.bind(this))

    this._pressedKeys.clear()
    this._justPressedKeys.clear()
    this._justReleasedKeys.clear()
    this._keyBindings.clear()
    this._initialized = false
  }

  /**
   * 处理按键按下
   */
  private handleKeyDown(event: KeyboardEvent): void {
    const key = event.key.toLowerCase()

    // 防止重复触发
    if (!this._pressedKeys.has(key)) {
      this._pressedKeys.add(key)
      this._justPressedKeys.add(key)

      // 触发绑定的回调
      this.triggerCallbacks(key)
    }

    // 阻止某些默认行为（如方向键滚动页面）
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
      event.preventDefault()
    }
  }

  /**
   * 处理按键释放
   */
  private handleKeyUp(event: KeyboardEvent): void {
    const key = event.key.toLowerCase()
    this._pressedKeys.delete(key)
    this._justReleasedKeys.add(key)
  }

  /**
   * 处理窗口失焦
   */
  private handleBlur(): void {
    // 清除所有按键状态
    this._pressedKeys.clear()
  }

  /**
   * 触发按键绑定的回调
   */
  private triggerCallbacks(key: string): void {
    const bindings = this._keyBindings.get(key)
    if (!bindings) return

    bindings.forEach((binding, index) => {
      binding.callback()
      if (binding.once) {
        bindings.splice(index, 1)
      }
    })
  }

  /* ========== 状态查询 ========== */

  /**
   * 检查按键是否被按住
   * @param key - 按键名称（不区分大小写）
   */
  isKeyDown(key: string): boolean {
    return this._pressedKeys.has(key.toLowerCase())
  }

  /**
   * 检查按键是否刚被按下（本帧）
   * @param key - 按键名称
   */
  isKeyJustPressed(key: string): boolean {
    return this._justPressedKeys.has(key.toLowerCase())
  }

  /**
   * 检查按键是否刚被释放（本帧）
   * @param key - 按键名称
   */
  isKeyJustReleased(key: string): boolean {
    return this._justReleasedKeys.has(key.toLowerCase())
  }

  /**
   * 获取所有当前按下的按键
   */
  getPressedKeys(): string[] {
    return Array.from(this._pressedKeys)
  }

  /* ========== 按键绑定 ========== */

  /**
   * 绑定按键回调
   * @param key - 按键名称
   * @param callback - 回调函数
   * @param once - 是否只触发一次
   */
  onKeyPress(key: string, callback: KeyCallback, once: boolean = false): void {
    const normalizedKey = key.toLowerCase()
    if (!this._keyBindings.has(normalizedKey)) {
      this._keyBindings.set(normalizedKey, [])
    }
    this._keyBindings.get(normalizedKey)!.push({ callback, once })
  }

  /**
   * 移除按键绑定
   * @param key - 按键名称
   * @param callback - 要移除的回调函数
   */
  offKeyPress(key: string, callback: KeyCallback): void {
    const normalizedKey = key.toLowerCase()
    const bindings = this._keyBindings.get(normalizedKey)
    if (!bindings) return

    const index = bindings.findIndex((b) => b.callback === callback)
    if (index !== -1) {
      bindings.splice(index, 1)
    }
  }

  /**
   * 清除所有按键绑定
   */
  clearBindings(): void {
    this._keyBindings.clear()
  }

  /* ========== 帧更新 ========== */

  /**
   * 更新输入状态
   * @description 每帧调用，清除"刚按下/刚释放"状态
   */
  update(): void {
    this._justPressedKeys.clear()
    this._justReleasedKeys.clear()
  }

  /* ========== 方向键别名 ========== */

  /**
   * 检查上方向键是否按下
   */
  isUp(): boolean {
    return this.isKeyDown('ArrowUp') || this.isKeyDown('w')
  }

  /**
   * 检查下方向键是否按下
   */
  isDown(): boolean {
    return this.isKeyDown('ArrowDown') || this.isKeyDown('s')
  }

  /**
   * 检查左方向键是否按下
   */
  isLeft(): boolean {
    return this.isKeyDown('ArrowLeft') || this.isKeyDown('a')
  }

  /**
   * 检查右方向键是否按下
   */
  isRight(): boolean {
    return this.isKeyDown('ArrowRight') || this.isKeyDown('d')
  }

  /**
   * 检查确认键是否按下
   */
  isConfirm(): boolean {
    return this.isKeyDown('Enter') || this.isKeyDown(' ')
  }

  /**
   * 检查取消键是否按下
   */
  isCancel(): boolean {
    return this.isKeyDown('Escape')
  }
}

// 【导出单例】
export const inputManager = new InputManagerImpl()