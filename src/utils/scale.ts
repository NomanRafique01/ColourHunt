/**
 * ColourHunt — Responsive Scale Utility
 *
 * All sizes are calculated once at app start based on the device's actual
 * screen dimensions. Import these helpers instead of raw numbers so the UI
 * auto-adjusts across every phone size (small Androids → large iPhones).
 *
 * Base design width : 390 px  (iPhone 15 / Pixel 8 logical width)
 * Base design height: 844 px
 *
 * Usage:
 *   import { s, vs, ms, msr, w, h, fs } from '../utils/scale'
 *
 *   s(20)    → horizontal scale   (paddings, widths)
 *   vs(20)   → vertical scale     (heights, paddingTop/Bottom)
 *   ms(20)   → moderate scale     (font sizes, icon sizes — softer than s)
 *   msr(20)  → moderate scale with custom resize factor
 *   w(0.9)   → % of screen width  (e.g. w(0.9) = 90% of screen)
 *   h(0.3)   → % of screen height
 *   fs(16)   → font size          (alias for ms, kept explicit for clarity)
 */

import { Dimensions, PixelRatio } from 'react-native'

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window')

const BASE_W = 390
const BASE_H = 844

/**
 * Horizontal scale — use for widths, horizontal padding/margin, icon widths.
 */
export const s = (size: number): number =>
  Math.round(PixelRatio.roundToNearestPixel((size * SCREEN_W) / BASE_W))

/**
 * Vertical scale — use for heights, vertical padding/margin, image heights.
 */
export const vs = (size: number): number =>
  Math.round(PixelRatio.roundToNearestPixel((size * SCREEN_H) / BASE_H))

/**
 * Moderate scale — best for font sizes and icon sizes.
 * Blends the base size with the horizontal scale to avoid extreme stretching.
 * factor = 0.5 means half of the full horizontal scaling is applied.
 */
export const ms = (size: number, factor = 0.5): number =>
  Math.round(PixelRatio.roundToNearestPixel(size + (s(size) - size) * factor))

/**
 * Moderate scale with a custom resize factor (alias for ms with explicit factor).
 */
export const msr = (size: number, factor: number): number => ms(size, factor)

/**
 * Fractional screen width. E.g. w(0.5) = half the screen width.
 */
export const w = (fraction: number): number => SCREEN_W * fraction

/**
 * Fractional screen height. E.g. h(0.3) = 30% of screen height.
 */
export const h = (fraction: number): number => SCREEN_H * fraction

/**
 * Font size helper — readable alias for ms.
 */
export const fs = (size: number): number => ms(size)

/** Expose raw dimensions for one-off use. */
export const SCREEN_WIDTH  = SCREEN_W
export const SCREEN_HEIGHT = SCREEN_H
