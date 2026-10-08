/**
 * objects.tsx — 12 flat real-world objects for the ColourHunt 4x4 grid.
 * Keyed by colour id (0..11) from WHEEL_COLOURS.
 * Each object: exact hex + darker detail shade + white highlight, readable at 24dp.
 */

import React from 'react'
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg'

interface ObjectProps {
  size?: number
}

// 0: Red — Apple (#E40C1A, dark: #990812)
export function AppleIcon({ size = 24 }: ObjectProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 5.5 C12 3 13.5 2 15 2" stroke="#5D3A1A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <Path d="M13.5 2 C15 3.2 14.5 4.5 13.5 4.5 C12.5 4.5 12.8 3 13.5 2 Z" fill="#1FB35B" />
      <Path
        d="M12 7 C9.5 5 5 5.5 4.5 10 C4 15 7.5 19.5 12 19.5 C16.5 19.5 20 15 19.5 10 C19 5.5 14.5 5 12 7 Z"
        fill="#E40C1A"
      />
      <Path d="M12 18.5 C15.5 18.5 18 14.5 18 11" stroke="#990812" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <Circle cx="8" cy="10" r="1.6" fill="#FFFFFF" opacity={0.75} />
    </Svg>
  )
}

// 1: Black — Sunglasses (#1A1A1A, dark: #000000)
export function SunglassesIcon({ size = 24 }: ObjectProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="2.5" y="9" width="8.5" height="7" rx="3" fill="#1A1A1A" />
      <Rect x="13" y="9" width="8.5" height="7" rx="3" fill="#1A1A1A" />
      <Path d="M10.5 11.5 Q12 10.5 13.5 11.5" stroke="#333333" strokeWidth="2" strokeLinecap="round" fill="none" />
      <Path d="M2 10.5 L4 10 M22 10.5 L20 10" stroke="#333333" strokeWidth="2" strokeLinecap="round" />
      <Path d="M4 11 L6.5 14.5 M14.5 11 L17 14.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity={0.65} />
    </Svg>
  )
}

// 2: Yellow — Lemon (#FFC93C, dark: #D99B16)
export function LemonIcon({ size = 24 }: ObjectProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M3.5 12 C5 7 10 4.5 16 6 C19.5 7 21.5 10 21 12 C19.5 17 14 19.5 8 18 C4.5 17 2.5 14 3.5 12 Z"
        fill="#FFC93C"
      />
      <Path d="M6 16.5 C10.5 18 15 16.5 17.5 13" stroke="#D99B16" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <Ellipse cx="10" cy="9.5" rx="3" ry="1.4" transform="rotate(-15 10 9.5)" fill="#FFFFFF" opacity={0.75} />
    </Svg>
  )
}

// 3: Purple — Grapes (#7C3AED, dark: #5B21B6)
export function GrapesIcon({ size = 24 }: ObjectProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 3 C12 5 11 6.5 11 6.5 M11 4 C13 4 14 5 14 5" stroke="#5D3A1A" strokeWidth="1.6" strokeLinecap="round" />
      <Circle cx="8.5" cy="9" r="3" fill="#7C3AED" />
      <Circle cx="15.5" cy="9" r="3" fill="#7C3AED" />
      <Circle cx="12" cy="8.5" r="3" fill="#7C3AED" />
      <Circle cx="10" cy="13.5" r="3" fill="#7C3AED" />
      <Circle cx="14" cy="13.5" r="3" fill="#7C3AED" />
      <Circle cx="12" cy="18" r="2.8" fill="#5B21B6" />
      <Circle cx="11.2" cy="12.5" r="1.1" fill="#FFFFFF" opacity={0.7} />
      <Circle cx="7.8" cy="8" r="1.1" fill="#FFFFFF" opacity={0.7} />
    </Svg>
  )
}

// 4: Green — Leaf (#1FB35B, dark: #14803E)
export function LeafIcon({ size = 24 }: ObjectProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M4 20 C4 13 8 5 19 4 C19 15 11 19 4 20 Z"
        fill="#1FB35B"
      />
      <Path d="M4 20 C9 15 13 11 18 5" stroke="#14803E" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <Path d="M9 15 C11 13 12 13 12 13 M13 11 C15 9 16 9 16 9" stroke="#14803E" strokeWidth="1.4" strokeLinecap="round" />
      <Path d="M9 7 C14 6 17 8 18 10" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity={0.7} />
    </Svg>
  )
}

// 5: White — Mug (#F5F5F0, outline: #D1D5DB, dark: #E5E7EB)
export function MugIcon({ size = 24 }: ObjectProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="5" y="6.5" width="11" height="12" rx="2.5" fill="#F5F5F0" stroke="#CBD5E1" strokeWidth="1.4" />
      <Path d="M16 9 C19 9 20 11 20 13 C20 15 19 16.5 16 16.5" stroke="#CBD5E1" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <Rect x="6" y="16.5" width="9" height="1.2" rx="0.6" fill="#CBD5E1" />
      <Path d="M7 8 L7 15" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" />
    </Svg>
  )
}

// 6: Orange — Traffic Cone (#F97316, dark: #C2410C)
export function TrafficConeIcon({ size = 24 }: ObjectProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="4" y="19" width="16" height="3" rx="1.5" fill="#C2410C" />
      <Path d="M12 3 L8 19 L16 19 Z" fill="#F97316" />
      <Path d="M9.8 11 L14.2 11 L14.8 14 L9.2 14 Z" fill="#FFFFFF" />
      <Path d="M12 3 L10.5 9 L13.5 9 Z" fill="#C2410C" />
      <Circle cx="12" cy="5" r="0.8" fill="#FFFFFF" />
    </Svg>
  )
}

// 7: Blue — Umbrella (#2F6BFF, dark: #1D4ED8)
export function UmbrellaIcon({ size = 24 }: ObjectProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 2 L12 4.5 M12 14.5 L12 19 C12 20.5 10.8 21.5 9.5 21" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <Path
        d="M3.5 14.5 C4 8.5 7.5 4.5 12 4.5 C16.5 4.5 20 8.5 20.5 14.5 C18 13.5 16 14.5 14.5 14.5 C13 14.5 12.5 13.5 12 13.5 C11.5 13.5 11 14.5 9.5 14.5 C8 14.5 6 13.5 3.5 14.5 Z"
        fill="#2F6BFF"
      />
      <Path d="M12 4.5 C12 8 11.5 11.5 10 14" stroke="#1D4ED8" strokeWidth="1.4" fill="none" />
      <Path d="M12 4.5 C12 8 12.5 11.5 14 14" stroke="#1D4ED8" strokeWidth="1.4" fill="none" />
      <Path d="M6 9 C9 6.5 11 6 12 6" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity={0.75} />
    </Svg>
  )
}

// 8: Pink — Balloon (#EC4899, dark: #BE185D)
export function BalloonIcon({ size = 24 }: ObjectProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 18 C12 19.5 11.5 21 11 22 M11 19.5 L13 19.5" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <Path d="M11 17 L13 17 L12.5 18 L11.5 18 Z" fill="#BE185D" />
      <Ellipse cx="12" cy="10" rx="7" ry="8" fill="#EC4899" />
      <Path d="M14 15 C16.5 14 17.5 12 17.8 9.5" stroke="#BE185D" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <Ellipse cx="9" cy="6.8" rx="2.5" ry="1.2" transform="rotate(-30 9 6.8)" fill="#FFFFFF" opacity={0.75} />
    </Svg>
  )
}

// 9: Brown — Book (#92400E, dark: #713208)
export function BookIcon({ size = 24 }: ObjectProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="4.5" y="4.5" width="14" height="15" rx="2" fill="#92400E" />
      <Rect x="4" y="4.5" width="3" height="15" rx="1" fill="#713208" />
      <Rect x="7.5" y="17.5" width="11" height="1.8" fill="#FFFFFF" />
      <Path d="M11 8 L15 8 M11 11 L14 11" stroke="#FDE68A" strokeWidth="1.2" strokeLinecap="round" />
      <Path d="M8.5 5.5 L8.5 16.5" stroke="#FFFFFF" strokeWidth="1.2" opacity={0.6} />
    </Svg>
  )
}

// 10: Turquoise — Beach Bucket (#0D9488, dark: #0F766E)
export function BucketIcon({ size = 24 }: ObjectProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5 8 C5 4 19 4 19 8" stroke="#0F766E" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <Path d="M4 8 L6.5 19 C6.8 20 7.8 20.5 9 20.5 L15 20.5 C16.2 20.5 17.2 20 17.5 19 L20 8 Z" fill="#0D9488" />
      <Rect x="3.5" y="7" width="17" height="2.5" rx="1.2" fill="#0F766E" />
      <Path d="M8 10 L9.5 18" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" opacity={0.65} />
    </Svg>
  )
}

// 11: Grey — Pebble (#6B7280, dark: #4B5563)
export function PebbleIcon({ size = 24 }: ObjectProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M5 14 C4 10 7 6 12 5.5 C17 5 20 8 20.5 12 C21 16 18 19 13 19.5 C8 20 6 18 5 14 Z"
        fill="#6B7280"
      />
      <Path d="M7 16 C10 18 15 18 18 15" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" fill="none" />
      <Ellipse cx="11.5" cy="8.5" rx="3.5" ry="1.6" transform="rotate(-10 11.5 8.5)" fill="#FFFFFF" opacity={0.7} />
    </Svg>
  )
}

/** Render appropriate object for colour index 0..11 */
export function GridObjectIcon({ colorId, size = 24 }: { colorId: number; size?: number }) {
  switch (colorId) {
    case 0:  return <AppleIcon size={size} />
    case 1:  return <SunglassesIcon size={size} />
    case 2:  return <LemonIcon size={size} />
    case 3:  return <GrapesIcon size={size} />
    case 4:  return <LeafIcon size={size} />
    case 5:  return <MugIcon size={size} />
    case 6:  return <TrafficConeIcon size={size} />
    case 7:  return <UmbrellaIcon size={size} />
    case 8:  return <BalloonIcon size={size} />
    case 9:  return <BookIcon size={size} />
    case 10: return <BucketIcon size={size} />
    case 11: return <PebbleIcon size={size} />
    default: return <AppleIcon size={size} />
  }
}
