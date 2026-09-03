import { describe, it, expect } from 'vitest'
import { guardEditControl, listShape, overElementCap } from './shape'
import { resolveControl } from './utils'
import type { EditSchemaField } from './types'

const field = (
  kind: string,
  diff_hint: string,
  extra: Partial<EditSchemaField> = {}
): EditSchemaField => ({
  key: 'catalog.work.x',
  kind,
  diff_hint,
  locked: false,
  can_propose: true,
  can_review: false,
  would_automerge: false,
  ...extra
})

describe('listShape', () => {
  it('separates scalar lists from object lists', () => {
    expect(listShape(['https://a', 'https://b'])).toBe('scalar')
    expect(listShape([1, 2, 3])).toBe('scalar')
    expect(listShape([{ lang: 'ja', title: 'x' }])).toBe('object')
    expect(listShape(['a', { lang: 'ja' }])).toBe('mixed')
    expect(listShape([])).toBe('empty')
    expect(listShape('not an array')).toBe('not-list')
  })

  it('does not treat null elements as objects', () => {
    expect(listShape([null, 'a'])).toBe('scalar')
  })
})

describe('guardEditControl', () => {
  it('degrades a scalar list editor fed object rows', () => {
    const guarded = guardEditControl('string-list', [{ lang: 'ja', title: 'x' }])
    expect(guarded.control).toBe('readonly')
    expect(guarded.degraded).toBe(true)
  })

  it('leaves a genuine scalar list alone', () => {
    expect(guardEditControl('string-list', ['https://a'])).toEqual({
      control: 'string-list',
      degraded: false
    })
    expect(guardEditControl('number-list', [1, 2])).toEqual({
      control: 'number-list',
      degraded: false
    })
  })

  it('does not touch controls that expect objects', () => {
    expect(guardEditControl('object-list', [{ a: 1 }]).control).toBe(
      'object-list'
    )
    expect(guardEditControl('image-list', [{ image_hash: 'h' }]).control).toBe(
      'image-list'
    )
  })
})

describe('resolveControl', () => {
  it('prefers a row editor when the site configured columns', () => {
    expect(
      resolveControl(field('list', 'items'), {
        label: '标题',
        columns: [{ key: 'lang', label: '语言' }]
      })
    ).toBe('object-list')
  })

  it('prefers an entity picker when the site can search', () => {
    const searchEntities = async () => []
    expect(resolveControl(field('ref', 'inline'), { label: '角色', searchEntities })).toBe(
      'entity-picker'
    )
    expect(resolveControl(field('list', 'items'), { label: '标签', searchEntities })).toBe(
      'entity-picker'
    )
  })

  it('still falls back to a scalar list with no configuration', () => {
    expect(resolveControl(field('list', 'items'))).toBe('string-list')
  })
})

describe('overElementCap', () => {
  it('only fires on a real cap and a real overflow', () => {
    expect(overElementCap([1, 2, 3], 2)).toBe(true)
    expect(overElementCap([1, 2], 2)).toBe(false)
    expect(overElementCap([1, 2, 3], 0)).toBe(false)
    expect(overElementCap([1, 2, 3], undefined)).toBe(false)
  })
})
