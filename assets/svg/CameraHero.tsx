/**
 * CameraHero — flat SVG camera illustration (v2)
 *
 * Changes:
 *  § 1 – CAMERA BODY
 *    • Charcoal body (#1F1F29) with lighter top plate (#33333F)
 *    • Thin light-gray outline (#5A5A6A) so camera never merges into red bg
 *    • Red shutter button (top-right), small cream flash, rubber grip on left
 *    • Removed the dark bottom strip
 *    • White viewfinder brackets + soft white glow retained
 *
 *  § 2 – SPINNING LENS
 *    • Prism spectrum: 8-colour conic gradient (red→orange→yellow→lime→
 *      green→cyan→blue→violet) — approximated with SVG pie segments
 *    • Outer ring rotates at 8 s/turn (forward)
 *    • Inner ring rotates at 12 s/turn (reverse)
 *    • Glass highlight + tiny reflection fixed on top (do NOT rotate)
 *    • Dark metal barrel ring + dark center pupil
 *    • Reduce-motion: spin stops
 *    • Optional: tap spin-up is wired via the `spinBoost` prop
 *
 *  § 3 – SPARKLES  (now managed in HomeScreen — camera exports no sparkles)
 */

import React, { useEffect, useRef } from 'react'
import {
  AccessibilityInfo,
  Animated,
  Easing,
  View,
} from 'react-native'
import Svg, {
  Circle,
  Defs,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg'

// ── Camera body palette ───────────────────────────────────────────────────────
const BODY_CHARCOAL  = '#1F1F29'   // main body
const BODY_TOP_PLATE = '#33333F'   // slightly lighter top plate
const BODY_OUTLINE   = '#5A5A6A'   // thin outline keeps camera off red bg
const FLASH_CREAM    = '#FFF8E7'   // small flash unit
const SHUTTER_RED    = '#E40C1A'   // red shutter button
const GRIP_TEXTURE   = '#161620'   // rubber grip panel (slightly darker)
const GRIP_LINE      = 'rgba(255,255,255,0.12)' // subtle grip ridges

// ── Lens palette ─────────────────────────────────────────────────────────────
const METAL_RING     = '#111118'   // outermost dark metal ring
const LENS_RIM       = '#1A1A24'   // inner recessed rim
const PUPIL_DARK     = '#0A0A12'   // center pupil

// ── 8-colour spectrum (pie slices, 45° each) ─────────────────────────────────
// Colours: red, orange, yellow, lime, green, cyan, blue, violet
const SPECTRUM = [
  '#FF2D2D', // red      0°–45°
  '#FF8C00', // orange  45°–90°
  '#FFE000', // yellow  90°–135°
  '#7FFF00', // lime   135°–180°
  '#00CC55', // green  180°–225°
  '#00D4FF', // cyan   225°–270°
  '#3B5BFF', // blue   270°–315°
  '#9B30FF', // violet 315°–360°
]

// Pre-compute pie-slice paths for a circle of radius r centred at (cx,cy)
// Each slice is 45° (π/4 radians)
function slicePath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
): string {
  const toRad = (d: number) => (d * Math.PI) / 180
  const x1 = cx + r * Math.sin(toRad(startDeg))
  const y1 = cy - r * Math.cos(toRad(startDeg))
  const x2 = cx + r * Math.sin(toRad(endDeg))
  const y2 = cy - r * Math.cos(toRad(endDeg))
  return `M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2} Z`
}

interface Props {
  width?: number
  height?: number
  animate?: boolean
  /** Set true for 0.5 s when user presses Create/Join to speed-up the lens */
  spinBoost?: boolean
}

export function CameraHero({
  width = 240,
  height = 200,
  animate = true,
  spinBoost = false,
}: Props) {
  // ── reduce-motion detection ────────────────────────────────────────────────
  const [reduceMotion, setReduceMotion] = React.useState(false)
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion)
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion)
    return () => sub.remove()
  }, [])

  const shouldAnimate = animate && !reduceMotion

  // ── outer ring rotation (8 s, forward) ────────────────────────────────────
  const outerRot = useRef(new Animated.Value(0)).current
  const outerAnim = useRef<Animated.CompositeAnimation | null>(null)

  // ── inner ring rotation (12 s, reverse) ───────────────────────────────────
  const innerRot = useRef(new Animated.Value(0)).current
  const innerAnim = useRef<Animated.CompositeAnimation | null>(null)

  useEffect(() => {
    if (!shouldAnimate) {
      outerAnim.current?.stop()
      innerAnim.current?.stop()
      return
    }

    const dur = spinBoost ? 800 : 8000   // 0.8 s boost, else normal 8 s
    const durInner = spinBoost ? 1200 : 12000

    outerAnim.current = Animated.loop(
      Animated.timing(outerRot, {
        toValue: 360,
        duration: dur,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    )
    innerAnim.current = Animated.loop(
      Animated.timing(innerRot, {
        toValue: -360,
        duration: durInner,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    )

    outerAnim.current.start()
    innerAnim.current.start()

    return () => {
      outerAnim.current?.stop()
      innerAnim.current?.stop()
    }
  }, [shouldAnimate, spinBoost])

  const spinOuter = outerRot.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  })
  const spinInner = innerRot.interpolate({
    inputRange: [-360, 0],
    outputRange: ['-360deg', '0deg'],
  })

  // ── Sizing ─────────────────────────────────────────────────────────────────
  // Lens sits at SVG coord (120, 105), r=34 usable area for spectrum
  // We need the outer spinning layer and inner ring layer each as Animated.View
  // positioned absolutely over the SVG.
  //
  // SVG viewBox = 0 0 240 200
  // Lens centre in % of width:  120/240 = 50%   → left = 50%
  // Lens centre in % of height: 105/200 = 52.5% → top  = 52.5%
  // Outer spectrum radius 30 (inside the 34-r inner-rim ring)
  // Scale factor: width / 240
  const scale = width / 240

  const outerSpectrumR = 30 * scale  // spectrum outer radius (px)
  const outerSize = outerSpectrumR * 2
  const innerSpectrumR = 16 * scale  // inner ring outer radius (px)
  const innerSize = innerSpectrumR * 2

  // Absolute position of lens centre on the rendered View
  const lensCX = width * 0.5
  const lensCY = height * 0.525

  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>

      {/* ── Static SVG layer ──────────────────────────────────────────────── */}
      <Svg width={width} height={height} viewBox="0 0 240 200" fill="none">
        <Defs>
          {/* White radial glow behind camera */}
          <RadialGradient id="bodyGlow" cx="50%" cy="52%" r="48%">
            <Stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.22" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0"    />
          </RadialGradient>
        </Defs>

        {/* ── Soft white glow ──────────────────────────────────────────────── */}
        <Rect x="0" y="0" width="240" height="200" fill="url(#bodyGlow)" />

        {/* ── Viewfinder corner brackets — WHITE ───────────────────────────── */}
        {/* Top-Left */}
        <Path d="M12 40 V 16 H 36"  stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Top-Right */}
        <Path d="M228 40 V 16 H 204" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Bottom-Left */}
        <Path d="M12 160 V 184 H 36"  stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Bottom-Right */}
        <Path d="M228 160 V 184 H 204" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* ══ CAMERA BODY ══════════════════════════════════════════════════════ */}

        {/* Top pentaprism hump — dark top plate */}
        <Path d="M88 48 L104 36 H136 L152 48 Z" fill={BODY_TOP_PLATE} stroke={BODY_OUTLINE} strokeWidth="1" />

        {/* Main body — charcoal rectangle with outline */}
        <Rect x="36" y="48" width="168" height="116" rx="20"
          fill={BODY_CHARCOAL} stroke={BODY_OUTLINE} strokeWidth="1.2" />

        {/* Top-plate strip (slightly lighter than body) */}
        <Rect x="37" y="48" width="166" height="22" rx="10" fill={BODY_TOP_PLATE} />

        {/* ── LEFT GRIP — rubber texture panel ────────────────────────────── */}
        <Rect x="36" y="56" width="28" height="100" rx="14"
          fill={GRIP_TEXTURE} stroke={BODY_OUTLINE} strokeWidth="0.8" />
        {/* Grip ridges */}
        <Rect x="44" y="72"  width="12" height="2.5" rx="1.25" fill={GRIP_LINE} />
        <Rect x="44" y="80"  width="12" height="2.5" rx="1.25" fill={GRIP_LINE} />
        <Rect x="44" y="88"  width="12" height="2.5" rx="1.25" fill={GRIP_LINE} />
        <Rect x="44" y="96"  width="12" height="2.5" rx="1.25" fill={GRIP_LINE} />
        <Rect x="44" y="104" width="12" height="2.5" rx="1.25" fill={GRIP_LINE} />
        <Rect x="44" y="112" width="12" height="2.5" rx="1.25" fill={GRIP_LINE} />
        <Rect x="44" y="120" width="12" height="2.5" rx="1.25" fill={GRIP_LINE} />
        <Rect x="44" y="128" width="12" height="2.5" rx="1.25" fill={GRIP_LINE} />
        <Rect x="44" y="136" width="12" height="2.5" rx="1.25" fill={GRIP_LINE} />

        {/* ── FLASH — small cream rectangle top-left of body ───────────────── */}
        <Rect x="72" y="56" width="18" height="12" rx="4"
          fill={FLASH_CREAM} stroke={BODY_OUTLINE} strokeWidth="0.8" />
        {/* Flash centre glint */}
        <Circle cx="81" cy="62" r="3" fill="rgba(255,248,231,0.7)" />
        <Circle cx="79.5" cy="60.5" r="1" fill="rgba(255,255,255,0.9)" />

        {/* ── SHUTTER BUTTON — red pill top-right ──────────────────────────── */}
        <Rect x="166" y="52" width="28" height="14" rx="7"
          fill={SHUTTER_RED} stroke="#FF4444" strokeWidth="0.8" />
        {/* Shutter highlight */}
        <Rect x="170" y="54" width="16" height="4" rx="2"
          fill="rgba(255,120,120,0.55)" />

        {/* ── MODE DIAL — small dark circle next to shutter ────────────────── */}
        <Circle cx="158" cy="59" r="6" fill={BODY_TOP_PLATE} stroke={BODY_OUTLINE} strokeWidth="0.8" />
        <Circle cx="158" cy="59" r="3" fill={GRIP_TEXTURE} />
        <Path d="M158 56 L158 53" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round" />

        {/* ── LENS BARREL RINGS — dark recessed rings ──────────────────────── */}
        {/* Outermost metal ring */}
        <Circle cx="120" cy="105" r="46" fill={METAL_RING} stroke={BODY_OUTLINE} strokeWidth="1" />
        {/* Mid ring (will show between spectrum and outermost) */}
        <Circle cx="120" cy="105" r="40" fill="#22222C" />
        {/* Inner rim — spectrum sits on top here */}
        <Circle cx="120" cy="105" r="34" fill={LENS_RIM} />
      </Svg>

      {/* ══ OUTER SPINNING SPECTRUM RING (8 s, forward) ══════════════════════ */}
      <Animated.View
        style={{
          position: 'absolute',
          left: lensCX - outerSpectrumR,
          top: lensCY - outerSpectrumR,
          width: outerSize,
          height: outerSize,
          transform: [{ rotate: spinOuter }],
        }}
        pointerEvents="none"
      >
        <Svg width={outerSize} height={outerSize}
          viewBox={`0 0 ${outerSize} ${outerSize}`} fill="none">
          {SPECTRUM.map((color, i) => (
            <Path
              key={i}
              d={slicePath(outerSpectrumR, outerSpectrumR, outerSpectrumR, i * 45, (i + 1) * 45)}
              fill={color}
            />
          ))}
        </Svg>
      </Animated.View>

      {/* ══ INNER COUNTER-ROTATING RING (12 s, reverse) ══════════════════════ */}
      <Animated.View
        style={{
          position: 'absolute',
          left: lensCX - innerSpectrumR,
          top: lensCY - innerSpectrumR,
          width: innerSize,
          height: innerSize,
          transform: [{ rotate: spinInner }],
        }}
        pointerEvents="none"
      >
        <Svg width={innerSize} height={innerSize}
          viewBox={`0 0 ${innerSize} ${innerSize}`} fill="none">
          {/* Inner ring uses same spectrum but shifted by 22.5° (half-step) */}
          {SPECTRUM.map((color, i) => (
            <Path
              key={i}
              d={slicePath(innerSpectrumR, innerSpectrumR, innerSpectrumR, i * 45, (i + 1) * 45)}
              fill={SPECTRUM[(i + 4) % 8]}   // offset palette for contrast
            />
          ))}
        </Svg>
      </Animated.View>

      {/* ══ FIXED GLASS LAYER — does NOT rotate ════════════════════════════════ */}
      <Svg
        width={width}
        height={height}
        viewBox="0 0 240 200"
        fill="none"
        style={{ position: 'absolute', top: 0, left: 0 }}
        pointerEvents="none"
      >
        {/* Dark pupil — centre of lens */}
        <Circle cx="120" cy="105" r="11" fill={PUPIL_DARK} />
        {/* Pupil glint */}
        <Circle cx="120" cy="105" r="4"  fill="rgba(255,255,255,0.12)" />

        {/* Glass arc highlight — top-left quarter of lens */}
        <Path
          d="M91 83 Q96 75 108 71"
          stroke="rgba(255,255,255,0.70)"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Secondary smaller reflection */}
        <Path
          d="M96 92 Q99 88 104 86"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Tiny bright specular dot */}
        <Circle cx="94" cy="84" r="2.5" fill="rgba(255,255,255,0.85)" />
      </Svg>

    </View>
  )
}

export default CameraHero
