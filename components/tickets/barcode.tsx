'use client'

import { useMemo } from 'react'
import { useTranslation } from '@/lib/use-translation'

function hash(input: string) {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function rng(seed: number) {
  let s = seed
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
}

const W = 352
const H = 72
const CELL = 4
const MATRIX_X = 44
const MATRIX_COLS = 66
const ROWS = H / CELL

export function Barcode({ seed }: { seed: string }) {
  const { t } = useTranslation()
  const rects = useMemo(() => {
    const rand = rng(hash(seed))
    const out: { x: number; y: number; w: number; h: number }[] = []

    out.push({ x: 0, y: 0, w: 14, h: H })
    let x = 18
    while (x < MATRIX_X - 6) {
      const w = rand() > 0.5 ? 3 : 2
      out.push({ x, y: 0, w, h: H })
      x += w + 3
    }

    for (let c = 0; c < MATRIX_COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        if (rand() > 0.5) out.push({ x: MATRIX_X + c * CELL, y: r * CELL, w: CELL, h: CELL })
      }
    }

    const endX = MATRIX_X + MATRIX_COLS * CELL
    out.push({ x: endX + 4, y: 0, w: 14, h: H })
    let rx = endX + 24
    while (rx < W - 2) {
      const w = rand() > 0.5 ? 2 : 1.5
      out.push({ x: rx, y: 0, w, h: H })
      rx += w + 3
    }
    return out
  }, [seed])

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-[72px] w-full"
      role="img"
      aria-label={t('safeTixBarcode')}
      shapeRendering="crispEdges"
    >
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill="#fff" />
      ))}
    </svg>
  )
}
