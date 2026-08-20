import { describe, it, expect } from 'vitest'
import {
  diffTextSegments,
  diffTextStats,
  elideTextDiff,
  isTextDiffElidable,
  TEXT_DIFF_ELIDE_OVER
} from './utils'

const tinted = (from: string, to: string) =>
  diffTextSegments(from, to)
    .filter((s) => s.op !== 'equal')
    .map((s) => `${s.op === 'insert' ? '+' : '-'}${s.text}`)

describe('diffTextSegments', () => {
  it('collapses identical input to a single equal run', () => {
    expect(diffTextSegments('同一段文本', '同一段文本')).toEqual([
      { op: 'equal', text: '同一段文本' }
    ])
  })

  it('returns nothing when both sides are empty', () => {
    expect(diffTextSegments('', '')).toEqual([])
  })

  it('isolates a one-character edit inside a long run', () => {
    const base = '汉'.repeat(200)
    expect(tinted(`${base}版版`, `${base}版`)).toEqual(['-版'])
  })

  it('segments CJK on word boundaries, not per character', () => {
    expect(tinted('我喜欢这个游戏', '我喜爱这个游戏')).toEqual([
      '-喜欢',
      '+喜爱'
    ])
  })
})

describe('diffTextStats', () => {
  it('counts characters, not tokens', () => {
    const segments = diffTextSegments('蜂群系列', '克莱托系列')
    expect(diffTextStats(segments)).toEqual({ added: 3, removed: 2 })
  })

  it('is zero for an unchanged field', () => {
    expect(diffTextStats(diffTextSegments('不变', '不变'))).toEqual({
      added: 0,
      removed: 0
    })
  })
})

describe('elideTextDiff', () => {
  const long = '文'.repeat(TEXT_DIFF_ELIDE_OVER + 100)

  it('does not fold a field that never changed', () => {
    const segments = diffTextSegments(long, long)
    expect(isTextDiffElidable(segments)).toBe(false)
    expect(elideTextDiff(segments, false)).toEqual([
      { kind: 'text', op: 'equal', text: long }
    ])
  })

  it('folds the long unchanged run around a change', () => {
    const segments = diffTextSegments(`${long}旧`, `${long}新`)
    expect(isTextDiffElidable(segments)).toBe(true)

    const folded = elideTextDiff(segments, false)
    expect(folded.some((p) => p.kind === 'elision')).toBe(true)
    expect(folded).toContainEqual({ kind: 'text', op: 'delete', text: '旧' })
    expect(folded).toContainEqual({ kind: 'text', op: 'insert', text: '新' })
  })

  it('expanded restores every character', () => {
    const segments = diffTextSegments(`${long}旧`, `${long}新`)
    const expanded = elideTextDiff(segments, true)
    expect(expanded.every((p) => p.kind === 'text')).toBe(true)
    expect(
      expanded.map((p) => (p.kind === 'text' ? p.text : '')).join('')
    ).toBe(`${long}旧新`)
  })
})
