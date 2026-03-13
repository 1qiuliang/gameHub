/**
 * Canvas 渲染器
 * @description 封装 Canvas 2D 绑定的常用方法，提供便捷的绘制接口
 */

import type { ColorConfig } from '@shared/types'

/**
 * 文本样式配置
 */
export interface TextStyle {
  /** 字体大小 */
  size?: number
  /** 字体粗细 */
  weight?: string
  /** 字体族 */
  family?: string
  /** 文本颜色 */
  color?: string
  /** 水平对齐 */
  align?: 'left' | 'center' | 'right'
  /** 垂直对齐 */
  baseline?: 'top' | 'middle' | 'bottom'
}

/**
 * 矩形样式配置
 */
export interface RectStyle {
  /** 填充颜色 */
  fillColor?: string
  /** 边框颜色 */
  strokeColor?: string
  /** 边框宽度 */
  strokeWidth?: number
  /** 圆角半径 */
  radius?: number
}

/**
 * Canvas 渲染器类
 * @description 提供统一的 Canvas 绑定 API
 */
export class CanvasRenderer {
  constructor(private ctx: CanvasRenderingContext2D) {}

  /* ========== 基础方法 ========== */

  /**
   * 清空画布
   * @param width - 画布宽度
   * @param height - 画布高度
   * @param color - 背景颜色
   */
  clear(width: number, height: number, color: string = '#1a1a2e'): void {
    this.ctx.fillStyle = color
    this.ctx.fillRect(0, 0, width, height)
  }

  /**
   * 保存当前状态
   */
  save(): void {
    this.ctx.save()
  }

  /**
   * 恢复之前的状态
   */
  restore(): void {
    this.ctx.restore()
  }

  /* ========== 颜色设置 ========== */

  /**
   * 设置填充颜色
   */
  setFillColor(color: string): void {
    this.ctx.fillStyle = color
  }

  /**
   * 设置边框颜色
   */
  setStrokeColor(color: string): void {
    this.ctx.strokeStyle = color
  }

  /**
   * 设置透明度
   */
  setGlobalAlpha(alpha: number): void {
    this.ctx.globalAlpha = Math.max(0, Math.min(1, alpha))
  }

  /* ========== 形状绘制 ========== */

  /**
   * 绘制矩形
   */
  drawRect(x: number, y: number, width: number, height: number, style: RectStyle = {}): void {
    const { fillColor, strokeColor, strokeWidth, radius } = style

    this.save()

    // 【圆角矩形】
    if (radius && radius > 0) {
      this.ctx.beginPath()
      this.ctx.roundRect(x, y, width, height, radius)
      if (fillColor) {
        this.ctx.fillStyle = fillColor
        this.ctx.fill()
      }
      if (strokeColor && strokeWidth) {
        this.ctx.strokeStyle = strokeColor
        this.ctx.lineWidth = strokeWidth
        this.ctx.stroke()
      }
    } else {
      // 【普通矩形】
      if (fillColor) {
        this.ctx.fillStyle = fillColor
        this.ctx.fillRect(x, y, width, height)
      }
      if (strokeColor && strokeWidth) {
        this.ctx.strokeStyle = strokeColor
        this.ctx.lineWidth = strokeWidth
        this.ctx.strokeRect(x, y, width, height)
      }
    }

    this.restore()
  }

  /**
   * 绘制圆形
   */
  drawCircle(
    x: number,
    y: number,
    radius: number,
    fillColor?: string,
    strokeColor?: string,
    strokeWidth?: number
  ): void {
    this.save()
    this.ctx.beginPath()
    this.ctx.arc(x, y, radius, 0, Math.PI * 2)

    if (fillColor) {
      this.ctx.fillStyle = fillColor
      this.ctx.fill()
    }
    if (strokeColor && strokeWidth) {
      this.ctx.strokeStyle = strokeColor
      this.ctx.lineWidth = strokeWidth
      this.ctx.stroke()
    }

    this.restore()
  }

  /**
   * 绘制线条
   */
  drawLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    width: number = 1
  ): void {
    this.save()
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = width
    this.ctx.beginPath()
    this.ctx.moveTo(x1, y1)
    this.ctx.lineTo(x2, y2)
    this.ctx.stroke()
    this.restore()
  }

  /**
   * 绘制多边形
   */
  drawPolygon(
    points: Array<{ x: number; y: number }>,
    fillColor?: string,
    strokeColor?: string,
    strokeWidth?: number
  ): void {
    if (points.length < 3) return

    this.save()
    this.ctx.beginPath()
    this.ctx.moveTo(points[0].x, points[0].y)

    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y)
    }

    this.ctx.closePath()

    if (fillColor) {
      this.ctx.fillStyle = fillColor
      this.ctx.fill()
    }
    if (strokeColor && strokeWidth) {
      this.ctx.strokeStyle = strokeColor
      this.ctx.lineWidth = strokeWidth
      this.ctx.stroke()
    }

    this.restore()
  }

  /* ========== 文本绘制 ========== */

  /**
   * 绘制文本
   */
  drawText(text: string, x: number, y: number, style: TextStyle = {}): void {
    const {
      size = 16,
      weight = 'normal',
      family = 'sans-serif',
      color = '#ffffff',
      align = 'left',
      baseline = 'top',
    } = style

    this.save()
    this.ctx.font = `${weight} ${size}px ${family}`
    this.ctx.fillStyle = color
    this.ctx.textAlign = align
    this.ctx.textBaseline = baseline
    this.ctx.fillText(text, x, y)
    this.restore()
  }

  /**
   * 绘制居中文本
   */
  drawCenteredText(
    text: string,
    centerX: number,
    y: number,
    style: Omit<TextStyle, 'align'> = {}
  ): void {
    this.drawText(text, centerX, y, { ...style, align: 'center' })
  }

  /**
   * 测量文本宽度
   */
  measureText(text: string, style: Partial<TextStyle> = {}): number {
    const { size = 16, weight = 'normal', family = 'sans-serif' } = style
    this.ctx.font = `${weight} ${size}px ${family}`
    return this.ctx.measureText(text).width
  }

  /* ========== 图像绘制 ========== */

  /**
   * 绘制图像
   */
  drawImage(
    image: HTMLImageElement | HTMLCanvasElement,
    x: number,
    y: number,
    width?: number,
    height?: number
  ): void {
    if (width && height) {
      this.ctx.drawImage(image, x, y, width, height)
    } else {
      this.ctx.drawImage(image, x, y)
    }
  }

  /**
   * 绘制图像片段
   */
  drawImageSlice(
    image: HTMLImageElement | HTMLCanvasElement,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    dx: number,
    dy: number,
    dw: number,
    dh: number
  ): void {
    this.ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
  }

  /* ========== 网格绘制 ========== */

  /**
   * 绘制网格
   */
  drawGrid(
    width: number,
    height: number,
    cellSize: number,
    color: string = 'rgba(255, 255, 255, 0.1)'
  ): void {
    this.save()
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = 1

    // 【垂直线】
    for (let x = 0; x <= width; x += cellSize) {
      this.ctx.beginPath()
      this.ctx.moveTo(x, 0)
      this.ctx.lineTo(x, height)
      this.ctx.stroke()
    }

    // 【水平线】
    for (let y = 0; y <= height; y += cellSize) {
      this.ctx.beginPath()
      this.ctx.moveTo(0, y)
      this.ctx.lineTo(width, y)
      this.ctx.stroke()
    }

    this.restore()
  }

  /* ========== 变换方法 ========== */

  /**
   * 平移
   */
  translate(x: number, y: number): void {
    this.ctx.translate(x, y)
  }

  /**
   * 旋转
   */
  rotate(angle: number): void {
    this.ctx.rotate(angle)
  }

  /**
   * 缩放
   */
  scale(x: number, y: number): void {
    this.ctx.scale(x, y)
  }

  /* ========== 辅助方法 ========== */

  /**
   * 创建渐变
   */
  createLinearGradient(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    colorStops: Array<{ offset: number; color: string }>
  ): CanvasGradient {
    const gradient = this.ctx.createLinearGradient(x0, y0, x1, y1)
    colorStops.forEach(({ offset, color }) => {
      gradient.addColorStop(offset, color)
    })
    return gradient
  }

  /**
   * 获取原始上下文
   */
  getContext(): CanvasRenderingContext2D {
    return this.ctx
  }
}