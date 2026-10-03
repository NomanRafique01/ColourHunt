/**
 * MiniPolaroid — flat SVG polaroid frame with an inline scene (v2).
 *
 * 8 diverse scenes — animals, buildings, vehicles, nature:
 *   'cat'      — orange cat face on cream bg
 *   'house'    — colourful house on sky-blue bg
 *   'fish'     — blue fish underwater
 *   'mountain' — snowy peak on teal sky
 *   'car'      — red car on grey road
 *   'rocket'   — purple rocket in dark-blue space
 *   'bird'     — yellow bird on a branch
 *   'boat'     — white sailboat on blue water
 *
 * No gradients, no photos — pure flat SVG shapes.
 */

import React from 'react'
import Svg, { Circle, Ellipse, Line, Path, Polygon, Rect } from 'react-native-svg'

export type SceneType =
  | 'cat'
  | 'house'
  | 'fish'
  | 'mountain'
  | 'car'
  | 'fruit'
  | 'rocket'
  | 'bird'
  | 'boat'

interface Props {
  size: number   // total frame width in dp; height = size * 1.28
  scene: SceneType
}

// ── Scene background colours ──────────────────────────────────────────────────
const BG: Record<SceneType, string> = {
  cat:      '#FFF3E0',
  house:    '#C9E8FF',
  fish:     '#B2EBF2',
  mountain: '#C8E6C9',
  car:      '#ECEFF1',
  fruit:    '#FFF3E0',
  rocket:   '#1A1A3E',
  bird:     '#E8F5E9',
  boat:     '#BBDEFB',
}

// ── Scene renderers — all draw into a 60 × 54 viewBox ────────────────────────
function Scene({ type }: { type: SceneType }) {
  switch (type) {

    // ── CAT ─────────────────────────────────────────────────────────────────
    case 'cat':
      return (
        <>
          <Rect x={0} y={0} width={60} height={54} fill={BG.cat} />
          {/* Body */}
          <Ellipse cx={30} cy={42} rx={14} ry={10} fill="#F4A335" />
          {/* Head */}
          <Circle cx={30} cy={26} r={14} fill="#F4A335" />
          {/* Ears */}
          <Polygon points="18,16 14,6 24,14" fill="#F4A335" />
          <Polygon points="42,16 46,6 36,14" fill="#F4A335" />
          {/* Inner ears */}
          <Polygon points="19,15 16,9 23,14" fill="#FFCCAA" />
          <Polygon points="41,15 44,9 37,14" fill="#FFCCAA" />
          {/* Eyes */}
          <Ellipse cx={24} cy={24} rx={3.5} ry={4} fill="#2E2E2E" />
          <Ellipse cx={36} cy={24} rx={3.5} ry={4} fill="#2E2E2E" />
          {/* Eye shine */}
          <Circle cx={25.5} cy={22.5} r={1.2} fill="#FFFFFF" />
          <Circle cx={37.5} cy={22.5} r={1.2} fill="#FFFFFF" />
          {/* Nose */}
          <Polygon points="30,28 28,31 32,31" fill="#FF8A65" />
          {/* Mouth */}
          <Path d="M27 32 Q30 35 33 32" stroke="#9E5B2E" strokeWidth={1.2} fill="none" strokeLinecap="round" />
          {/* Whiskers */}
          <Line x1={8}  y1={28} x2={22} y2={29} stroke="#9E5B2E" strokeWidth={0.8} />
          <Line x1={8}  y1={31} x2={22} y2={31} stroke="#9E5B2E" strokeWidth={0.8} />
          <Line x1={52} y1={28} x2={38} y2={29} stroke="#9E5B2E" strokeWidth={0.8} />
          <Line x1={52} y1={31} x2={38} y2={31} stroke="#9E5B2E" strokeWidth={0.8} />
          {/* Stripes on head */}
          <Path d="M26 13 Q28 10 30 13" stroke="#E08A1E" strokeWidth={1} fill="none" />
          <Path d="M30 12 Q30 9 30 12" stroke="#E08A1E" strokeWidth={1} fill="none" />
          <Path d="M34 13 Q32 10 30 13" stroke="#E08A1E" strokeWidth={1} fill="none" />
        </>
      )

    // ── HOUSE ────────────────────────────────────────────────────────────────
    case 'house':
      return (
        <>
          <Rect x={0} y={0} width={60} height={54} fill={BG.house} />
          {/* Sun */}
          <Circle cx={50} cy={12} r={6} fill="#FFD740" />
          {/* Clouds */}
          <Ellipse cx={18} cy={14} rx={9} ry={5} fill="rgba(255,255,255,0.85)" />
          <Circle cx={12} cy={14} r={5} fill="rgba(255,255,255,0.85)" />
          <Circle cx={24} cy={13} r={5} fill="rgba(255,255,255,0.85)" />
          {/* Ground */}
          <Rect x={0} y={44} width={60} height={10} fill="#81C784" />
          {/* House body */}
          <Rect x={12} y={30} width={36} height={18} rx={1} fill="#FAFAFA" />
          {/* Roof */}
          <Polygon points="8,30 30,12 52,30" fill="#E53935" />
          {/* Door */}
          <Rect x={24} y={36} width={12} height={12} rx={2} fill="#795548" />
          <Circle cx={33} cy={43} r={1.5} fill="#FFCC80" />
          {/* Left window */}
          <Rect x={14} y={33} width={8} height={6} rx={1} fill="#90CAF9" />
          <Line x1={18} y1={33} x2={18} y2={39} stroke="white" strokeWidth={0.8} />
          <Line x1={14} y1={36} x2={22} y2={36} stroke="white" strokeWidth={0.8} />
          {/* Right window */}
          <Rect x={38} y={33} width={8} height={6} rx={1} fill="#90CAF9" />
          <Line x1={42} y1={33} x2={42} y2={39} stroke="white" strokeWidth={0.8} />
          <Line x1={38} y1={36} x2={46} y2={36} stroke="white" strokeWidth={0.8} />
          {/* Chimney */}
          <Rect x={38} y={14} width={6} height={12} fill="#B0BEC5" />
          {/* Smoke puffs */}
          <Circle cx={41} cy={12} r={2.5} fill="rgba(180,180,180,0.6)" />
          <Circle cx={39} cy={9}  r={2}   fill="rgba(180,180,180,0.4)" />
        </>
      )

    // ── FISH ─────────────────────────────────────────────────────────────────
    case 'fish':
      return (
        <>
          <Rect x={0} y={0} width={60} height={54} fill={BG.fish} />
          {/* Water waves */}
          <Path d="M0 18 Q15 14 30 18 Q45 22 60 18 L60 54 L0 54 Z" fill="#80DEEA" />
          {/* Sandy bottom */}
          <Rect x={0} y={46} width={60} height={8} fill="#FFE082" />
          {/* Fish body */}
          <Ellipse cx={28} cy={30} rx={16} ry={9} fill="#1565C0" />
          {/* Tail fin */}
          <Polygon points="44,30 54,22 54,38" fill="#1976D2" />
          {/* Top fin */}
          <Path d="M24 21 Q28 14 32 21" fill="#1565C0" />
          {/* Eye */}
          <Circle cx={18} cy={28} r={4} fill="#FFFFFF" />
          <Circle cx={17} cy={28} r={2.2} fill="#1A237E" />
          <Circle cx={16} cy={27} r={0.8} fill="#FFFFFF" />
          {/* Mouth */}
          <Path d="M12 31 Q14 33 12 35" stroke="#0D47A1" strokeWidth={1.2} fill="none" strokeLinecap="round" />
          {/* Scales lines */}
          <Path d="M26 22 Q28 30 26 38" stroke="#1976D2" strokeWidth={0.8} fill="none" />
          <Path d="M32 23 Q34 30 32 37" stroke="#1976D2" strokeWidth={0.8} fill="none" />
          {/* Bubbles */}
          <Circle cx={8}  cy={14} r={2}   fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth={1} />
          <Circle cx={14} cy={8}  r={3}   fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth={1} />
          <Circle cx={4}  cy={7}  r={1.5} fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth={1} />
        </>
      )

    // ── MOUNTAIN ─────────────────────────────────────────────────────────────
    case 'mountain':
      return (
        <>
          <Rect x={0} y={0} width={60} height={54} fill={BG.mountain} />
          {/* Sky tint */}
          <Rect x={0} y={0} width={60} height={38} fill="#B2DFDB" />
          {/* Sun */}
          <Circle cx={48} cy={10} r={7} fill="#FDD835" />
          {/* Back mountain */}
          <Polygon points="0,40 22,10 44,40" fill="#78909C" />
          {/* Snow cap back */}
          <Polygon points="15,22 22,10 29,22" fill="#ECEFF1" />
          {/* Front mountain */}
          <Polygon points="16,54 40,12 64,54" fill="#546E7A" />
          {/* Snow cap front */}
          <Polygon points="33,24 40,12 47,24" fill="#FFFFFF" />
          {/* Pine trees */}
          <Polygon points="6,54 10,44 14,54"  fill="#2E7D32" />
          <Polygon points="48,54 52,44 56,54" fill="#2E7D32" />
          {/* Ground */}
          <Rect x={0} y={48} width={60} height={6} fill="#A5D6A7" />
          {/* Cloud */}
          <Ellipse cx={16} cy={12} rx={8} ry={4} fill="rgba(255,255,255,0.75)" />
          <Circle cx={10} cy={12} r={4} fill="rgba(255,255,255,0.75)" />
          <Circle cx={22} cy={11} r={4} fill="rgba(255,255,255,0.75)" />
        </>
      )

    // ── CAR ──────────────────────────────────────────────────────────────────
    case 'car':
      return (
        <>
          <Rect x={0} y={0} width={60} height={54} fill={BG.car} />
          {/* Road */}
          <Rect x={0} y={38} width={60} height={16} fill="#616161" />
          {/* Road lines */}
          <Rect x={6}  y={44} width={10} height={3} rx={1.5} fill="#FAFAFA" />
          <Rect x={25} y={44} width={10} height={3} rx={1.5} fill="#FAFAFA" />
          <Rect x={44} y={44} width={10} height={3} rx={1.5} fill="#FAFAFA" />
          {/* Car body */}
          <Rect x={4} y={28} width={52} height={14} rx={4} fill="#E53935" />
          {/* Car roof */}
          <Path d="M14 28 Q16 16 24 16 L38 16 Q44 16 46 28 Z" fill="#C62828" />
          {/* Windows */}
          <Rect x={17} y={18} width={10} height={9} rx={2} fill="#B3E5FC" />
          <Rect x={30} y={18} width={10} height={9} rx={2} fill="#B3E5FC" />
          {/* Window divider */}
          <Rect x={27} y={18} width={2} height={9} fill="#C62828" />
          {/* Wheels */}
          <Circle cx={16} cy={40} r={8} fill="#212121" />
          <Circle cx={16} cy={40} r={4} fill="#757575" />
          <Circle cx={44} cy={40} r={8} fill="#212121" />
          <Circle cx={44} cy={40} r={4} fill="#757575" />
          {/* Headlights */}
          <Rect x={52} y={30} width={5} height={4} rx={2} fill="#FFF176" />
          {/* Tail lights */}
          <Rect x={3} y={30} width={4} height={4} rx={2} fill="#FF5722" />
          {/* Door handle */}
          <Rect x={26} y={32} width={8} height={2} rx={1} fill="#B71C1C" />
        </>
      )

    // ── ROCKET ───────────────────────────────────────────────────────────────
    case 'rocket':
      return (
        <>
          <Rect x={0} y={0} width={60} height={54} fill={BG.rocket} />
          {/* Stars */}
          {[
            [8,6],[50,4],[14,18],[54,16],[6,30],[56,32],
            [20,8],[44,10],[36,6],[4,14],[58,8],[10,42],
          ].map(([cx, cy], i) => (
            <Circle key={i} cx={cx} cy={cy} r={i % 3 === 0 ? 1.2 : 0.8} fill="#FFFFFF" />
          ))}
          {/* Planet */}
          <Circle cx={48} cy={38} r={8} fill="#7E57C2" />
          <Ellipse cx={48} cy={38} rx={12} ry={3} fill="none" stroke="#CE93D8" strokeWidth={1.5} />
          {/* Rocket body */}
          <Rect x={24} y={18} width={12} height={24} rx={4} fill="#9C27B0" />
          {/* Nose cone */}
          <Path d="M24 18 Q30 4 36 18 Z" fill="#CE93D8" />
          {/* Window */}
          <Circle cx={30} cy={26} r={4} fill="#B3E5FC" />
          <Circle cx={30} cy={26} r={2} fill="#29B6F6" />
          {/* Left fin */}
          <Path d="M24 36 L16 46 L24 42 Z" fill="#7B1FA2" />
          {/* Right fin */}
          <Path d="M36 36 L44 46 L36 42 Z" fill="#7B1FA2" />
          {/* Flame */}
          <Ellipse cx={30} cy={45} rx={5} ry={4} fill="#FF6F00" />
          <Ellipse cx={30} cy={47} rx={3} ry={3} fill="#FFCA28" />
          <Ellipse cx={30} cy={49} rx={1.5} ry={2} fill="#FFFFFF" />
        </>
      )

    // ── FRUIT ────────────────────────────────────────────────────────────────
    case 'fruit':
      return (
        <>
          <Rect x={0} y={0} width={60} height={54} fill={BG.fruit} />
          {/* Main orange fruit */}
          <Circle cx={27} cy={31} r={16} fill="#FF7043" />
          {/* Stem */}
          <Path d="M27 15 Q26 10 23 8" stroke="#5D4037" strokeWidth={2} fill="none" strokeLinecap="round" />
          {/* Green leaf */}
          <Path d="M27 13 Q35 7 38 12 Q33 17 27 13 Z" fill="#66BB6A" />
          {/* Fruit shine */}
          <Ellipse cx={21} cy={24} rx={3.5} ry={5} fill="rgba(255,255,255,0.35)" transform="rotate(-15 21 24)" />
          {/* Fruit slice on the side */}
          <Path d="M41 44 A11 11 0 0 1 49 26 L41 37 Z" fill="#FFA726" />
          <Path d="M41 42 A9 9 0 0 1 47 28 L41 37 Z" fill="#FFE082" />
          {/* Slice segments */}
          <Line x1={41} y1={37} x2={43} y2={30} stroke="#FF7043" strokeWidth={1} />
          <Line x1={41} y1={37} x2={46} y2={35} stroke="#FF7043" strokeWidth={1} />
          <Line x1={41} y1={37} x2={44} y2={40} stroke="#FF7043" strokeWidth={1} />
        </>
      )

    // ── BIRD ─────────────────────────────────────────────────────────────────
    case 'bird':
      return (
        <>
          <Rect x={0} y={0} width={60} height={54} fill={BG.bird} />
          {/* Sky area */}
          <Rect x={0} y={0} width={60} height={28} fill="#DCEDC8" />
          {/* Clouds */}
          <Ellipse cx={42} cy={10} rx={10} ry={5} fill="rgba(255,255,255,0.85)" />
          <Circle cx={34} cy={10} r={5} fill="rgba(255,255,255,0.85)" />
          <Circle cx={50} cy={9}  r={5} fill="rgba(255,255,255,0.85)" />
          {/* Branch */}
          <Rect x={0} y={34} width={60} height={5} rx={2.5} fill="#795548" />
          {/* Leaves on branch */}
          <Ellipse cx={8}  cy={30} rx={5} ry={3} fill="#4CAF50" transform="rotate(-20 8 30)" />
          <Ellipse cx={52} cy={30} rx={5} ry={3} fill="#4CAF50" transform="rotate(20 52 30)" />
          {/* Bird body */}
          <Ellipse cx={28} cy={28} rx={10} ry={8} fill="#FDD835" />
          {/* Wing */}
          <Path d="M28 24 Q14 18 12 28 Q20 26 28 28 Z" fill="#F9A825" />
          {/* Tail */}
          <Path d="M38 26 Q50 22 52 30 Q46 28 38 30 Z" fill="#F9A825" />
          {/* Head */}
          <Circle cx={20} cy={22} r={8} fill="#FDD835" />
          {/* Eye */}
          <Circle cx={17} cy={20} r={2.5} fill="#1A1A1A" />
          <Circle cx={16} cy={19} r={0.8} fill="#FFFFFF" />
          {/* Beak */}
          <Polygon points="12,22 6,20 6,24" fill="#FF7043" />
          {/* Feet */}
          <Line x1={26} y1={36} x2={24} y2={42} stroke="#795548" strokeWidth={1.5} strokeLinecap="round" />
          <Line x1={24} y1={42} x2={20} y2={44} stroke="#795548" strokeWidth={1.5} strokeLinecap="round" />
          <Line x1={24} y1={42} x2={24} y2={46} stroke="#795548" strokeWidth={1.5} strokeLinecap="round" />
          <Line x1={32} y1={36} x2={34} y2={42} stroke="#795548" strokeWidth={1.5} strokeLinecap="round" />
          <Line x1={34} y1={42} x2={38} y2={44} stroke="#795548" strokeWidth={1.5} strokeLinecap="round" />
          <Line x1={34} y1={42} x2={34} y2={46} stroke="#795548" strokeWidth={1.5} strokeLinecap="round" />
          {/* Grass below */}
          <Rect x={0} y={46} width={60} height={8} fill="#66BB6A" />
        </>
      )

    // ── BOAT ─────────────────────────────────────────────────────────────────
    case 'boat':
    default:
      return (
        <>
          <Rect x={0} y={0} width={60} height={54} fill={BG.boat} />
          {/* Sky */}
          <Rect x={0} y={0} width={60} height={28} fill="#E3F2FD" />
          {/* Sun */}
          <Circle cx={50} cy={10} r={6} fill="#FDD835" />
          {/* Clouds */}
          <Ellipse cx={18} cy={10} rx={9} ry={4} fill="rgba(255,255,255,0.9)" />
          <Circle cx={11} cy={10} r={4} fill="rgba(255,255,255,0.9)" />
          <Circle cx={25} cy={9}  r={4} fill="rgba(255,255,255,0.9)" />
          {/* Water */}
          <Rect x={0} y={28} width={60} height={26} fill="#42A5F5" />
          {/* Water waves */}
          <Path d="M0 32 Q10 29 20 32 Q30 35 40 32 Q50 29 60 32" stroke="#1565C0" strokeWidth={1} fill="none" />
          <Path d="M0 38 Q10 35 20 38 Q30 41 40 38 Q50 35 60 38" stroke="#1565C0" strokeWidth={1} fill="none" />
          {/* Boat hull */}
          <Path d="M10 36 L14 28 L46 28 L50 36 Q30 44 10 36 Z" fill="#FFFFFF" />
          {/* Hull stripe */}
          <Path d="M11 38 Q30 46 49 38" stroke="#E53935" strokeWidth={2} fill="none" />
          {/* Mast */}
          <Line x1={30} y1={10} x2={30} y2={28} stroke="#795548" strokeWidth={2} strokeLinecap="round" />
          {/* Sail */}
          <Path d="M30 12 L30 27 L48 27 Z" fill="#FFFFFF" />
          {/* Flag */}
          <Path d="M30 10 L38 14 L30 18 Z" fill="#E53935" />
          {/* Porthole */}
          <Circle cx={22} cy={32} r={2.5} fill="#90CAF9" />
          <Circle cx={38} cy={32} r={2.5} fill="#90CAF9" />
        </>
      )
  }
}

export function MiniPolaroid({ size, scene }: Props) {
  const w = size
  const h = size * 1.28

  // Internal layout (viewBox 100×128)
  const VW = 100
  const VH = 128
  const BORDER = 6
  const BOTTOM = 22
  const PIC_W = VW - BORDER * 2      // 88
  const PIC_H = VH - BORDER - BOTTOM // 100
  const SWATCH_Y = VH - BOTTOM / 2

  // Swatch colours matching scene primary
  const SWATCH: Record<SceneType, string> = {
    cat:      '#F4A335',
    house:    '#E53935',
    fish:     '#1565C0',
    mountain: '#546E7A',
    car:      '#E53935',
    fruit:    '#FF7043',
    rocket:   '#9C27B0',
    bird:     '#FDD835',
    boat:     '#1565C0',
  }

  return (
    <Svg width={w} height={h} viewBox={`0 0 ${VW} ${VH}`} fill="none">
      {/* Drop shadow */}
      <Rect x={3} y={4} width={VW - 4} height={VH - 4} rx={4} fill="rgba(0,0,0,0.18)" />
      {/* White frame */}
      <Rect x={0} y={0} width={VW} height={VH} rx={4} fill="#FFFFFF" />
      {/* Picture background */}
      <Rect x={BORDER} y={BORDER} width={PIC_W} height={PIC_H} rx={2} fill={BG[scene]} />
      {/* Scene */}
      <Svg x={BORDER} y={BORDER} width={PIC_W} height={PIC_H} viewBox="0 0 60 54">
        <Scene type={scene} />
      </Svg>
      {/* Swatch dot */}
      <Circle cx={VW / 2} cy={SWATCH_Y} r={5} fill={SWATCH[scene]} />
      <Circle cx={VW / 2} cy={SWATCH_Y} r={5} fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth={1} />
    </Svg>
  )
}

export default MiniPolaroid
