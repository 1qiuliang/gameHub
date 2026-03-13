/**
 * 音效管理器
 * @description 统一管理游戏音效的加载、播放和控制
 */

/**
 * 音效配置
 */
interface SoundOptions {
  /** 是否循环播放 */
  loop?: boolean
  /** 音量 (0-1) */
  volume?: number
  /** 播放速率 */
  playbackRate?: number
}

/**
 * 音效实例
 */
interface SoundInstance {
  /** 音频缓冲 */
  buffer: AudioBuffer
  /** 音频源节点 */
  source: AudioBufferSourceNode | null
  /** 增益节点 */
  gainNode: GainNode
  /** 是否正在播放 */
  isPlaying: boolean
}

/**
 * 音效管理器类
 * @description 单例模式，全局管理音频资源
 */
class AudioManagerImpl {
  /** 音频上下文 */
  private _context: AudioContext | null = null
  /** 音效映射 */
  private _sounds: Map<string, SoundInstance> = new Map()
  /** 主音量 */
  private _masterVolume: number = 1.0
  /** 是否静音 */
  private _muted: boolean = false
  /** 是否已初始化 */
  private _initialized: boolean = false

  /**
   * 初始化音效管理器
   */
  async init(): Promise<void> {
    if (this._initialized) {
      return
    }

    try {
      this._context = new AudioContext()
      this._initialized = true
      console.log('[AudioManager] 初始化完成')
    } catch (error) {
      console.error('[AudioManager] 初始化失败:', error)
    }
  }

  /**
   * 获取音频上下文
   */
  private getContext(): AudioContext {
    if (!this._context) {
      throw new Error('[AudioManager] 音频上下文未初始化')
    }
    // 恢复挂起的上下文
    if (this._context.state === 'suspended') {
      this._context.resume()
    }
    return this._context
  }

  /**
   * 加载音效
   * @param id - 音效标识
   * @param url - 音效文件URL
   */
  async load(id: string, url: string): Promise<void> {
    const context = this.getContext()

    try {
      // 【加载音频文件】
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await context.decodeAudioData(arrayBuffer)

      // 【创建增益节点】
      const gainNode = context.createGain()
      gainNode.connect(context.destination)

      // 【存储音效】
      this._sounds.set(id, {
        buffer: audioBuffer,
        source: null,
        gainNode,
        isPlaying: false,
      })

      console.log(`[AudioManager] 音效加载成功: ${id}`)
    } catch (error) {
      console.error(`[AudioManager] 音效加载失败: ${id}`, error)
    }
  }

  /**
   * 从Base64加载音效
   * @param id - 音效标识
   * @param base64 - Base64编码的音频数据
   */
  async loadFromBase64(id: string, base64: string): Promise<void> {
    const context = this.getContext()

    try {
      // 【解码Base64】
      const binaryString = atob(base64)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }

      const audioBuffer = await context.decodeAudioData(bytes.buffer)

      // 【创建增益节点】
      const gainNode = context.createGain()
      gainNode.connect(context.destination)

      this._sounds.set(id, {
        buffer: audioBuffer,
        source: null,
        gainNode,
        isPlaying: false,
      })

      console.log(`[AudioManager] 音效加载成功(Base64): ${id}`)
    } catch (error) {
      console.error(`[AudioManager] 音效加载失败(Base64): ${id}`, error)
    }
  }

  /**
   * 播放音效
   * @param id - 音效标识
   * @param options - 播放选项
   */
  play(id: string, options: SoundOptions = {}): void {
    const sound = this._sounds.get(id)
    if (!sound) {
      console.warn(`[AudioManager] 音效不存在: ${id}`)
      return
    }

    const context = this.getContext()

    // 【停止正在播放的实例】
    if (sound.source) {
      try {
        sound.source.stop()
      } catch {
        // 忽略已停止的错误
      }
    }

    // 【创建新的音频源】
    const source = context.createBufferSource()
    source.buffer = sound.buffer
    source.loop = options.loop ?? false
    source.playbackRate.value = options.playbackRate ?? 1

    // 【连接节点】
    source.connect(sound.gainNode)

    // 【设置音量】
    const volume = (options.volume ?? 1) * this._masterVolume * (this._muted ? 0 : 1)
    sound.gainNode.gain.value = volume

    // 【播放结束回调】
    source.onended = () => {
      sound.isPlaying = false
      sound.source = null
    }

    // 【开始播放】
    source.start(0)
    sound.source = source
    sound.isPlaying = true
  }

  /**
   * 停止音效
   * @param id - 音效标识
   */
  stop(id: string): void {
    const sound = this._sounds.get(id)
    if (!sound || !sound.source) {
      return
    }

    try {
      sound.source.stop()
      sound.source = null
      sound.isPlaying = false
    } catch {
      // 忽略错误
    }
  }

  /**
   * 停止所有音效
   */
  stopAll(): void {
    this._sounds.forEach((sound) => {
      if (sound.source) {
        try {
          sound.source.stop()
        } catch {
          // 忽略错误
        }
        sound.source = null
        sound.isPlaying = false
      }
    })
  }

  /**
   * 设置单个音效音量
   * @param id - 音效标识
   * @param volume - 音量 (0-1)
   */
  setVolume(id: string, volume: number): void {
    const sound = this._sounds.get(id)
    if (sound) {
      sound.gainNode.gain.value = Math.max(0, Math.min(1, volume)) * this._masterVolume
    }
  }

  /**
   * 设置主音量
   * @param volume - 音量 (0-1)
   */
  setMasterVolume(volume: number): void {
    this._masterVolume = Math.max(0, Math.min(1, volume))
  }

  /**
   * 获取主音量
   */
  getMasterVolume(): number {
    return this._masterVolume
  }

  /**
   * 静音
   */
  mute(): void {
    this._muted = true
    this._sounds.forEach((sound) => {
      sound.gainNode.gain.value = 0
    })
  }

  /**
   * 取消静音
   */
  unmute(): void {
    this._muted = false
    this._sounds.forEach((sound) => {
      sound.gainNode.gain.value = this._masterVolume
    })
  }

  /**
   * 切换静音状态
   */
  toggleMute(): boolean {
    if (this._muted) {
      this.unmute()
    } else {
      this.mute()
    }
    return this._muted
  }

  /**
   * 检查是否静音
   */
  isMuted(): boolean {
    return this._muted
  }

  /**
   * 检查音效是否正在播放
   * @param id - 音效标识
   */
  isPlaying(id: string): boolean {
    return this._sounds.get(id)?.isPlaying ?? false
  }

  /**
   * 卸载音效
   * @param id - 音效标识
   */
  unload(id: string): void {
    this.stop(id)
    this._sounds.delete(id)
  }

  /**
   * 卸载所有音效
   */
  unloadAll(): void {
    this.stopAll()
    this._sounds.clear()
  }

  /**
   * 销毁音效管理器
   */
  destroy(): void {
    this.unloadAll()
    if (this._context) {
      this._context.close()
      this._context = null
    }
    this._initialized = false
  }
}

// 【导出单例】
export const audioManager = new AudioManagerImpl()