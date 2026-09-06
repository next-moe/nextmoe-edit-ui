import { describe, it, expect } from 'vitest'
import { blankEditRow, buildEditRow, buildEditRows } from './row'
import type { EditObjectColumn } from './types'

const roster: EditObjectColumn[] = [
  { key: 'character_id', label: '角色', type: 'integer', required: true },
  {
    key: 'kind',
    label: '定位',
    type: 'integer',
    options: [
      { value: 0, label: '主角' },
      { value: 1, label: '配角' }
    ]
  },
  { key: 'spoiler', label: '剧透', type: 'integer' }
]

describe('buildEditRow', () => {
  it('sends integers where the server type-switches on numbers', () => {
    const { row, issues } = buildEditRow(
      { character_id: '128', kind: '1', spoiler: 0 },
      roster
    )
    expect(row).toEqual({ character_id: 128, kind: 1, spoiler: 0 })
    expect(issues).toEqual([])
  })

  it('drops keys the column list does not declare', () => {
    const { row } = buildEditRow(
      { character_id: '1', __rowId: 'abc', note: 'stale' },
      roster
    )
    expect(row).toEqual({ character_id: 1 })
  })

  it('reports a non-numeric integer instead of silently sending it', () => {
    const { row, issues } = buildEditRow({ character_id: '不是数字' }, roster)
    expect(issues).toEqual([
      { key: 'character_id', label: '角色', reason: '必须是整数' }
    ])
    expect(row.character_id).toBe('不是数字')
  })

  it('omits blank optional columns and flags blank required ones', () => {
    const { row, issues } = buildEditRow({ character_id: '', kind: '' }, roster)
    expect(row).toEqual({})
    expect(issues).toEqual([
      { key: 'character_id', label: '角色', reason: '必填' }
    ])
  })

  it('trims strings and coerces booleans', () => {
    const columns: EditObjectColumn[] = [
      { key: 'name', label: '名称' },
      { key: 'primary', label: '主要', type: 'boolean' }
    ]
    expect(buildEditRow({ name: '  綾波  ', primary: 'true' }, columns).row).toEqual({
      name: '綾波',
      primary: true
    })
  })

  it('keeps a false boolean rather than treating it as blank', () => {
    const columns: EditObjectColumn[] = [
      { key: 'primary', label: '主要', type: 'boolean' }
    ]
    expect(buildEditRow({ primary: false }, columns).row).toEqual({
      primary: false
    })
  })
})

describe('buildEditRows', () => {
  it('carries the row index on every issue', () => {
    const { rows, issues } = buildEditRows(
      [{ character_id: '1' }, { character_id: 'x' }],
      roster
    )
    expect(rows).toHaveLength(2)
    expect(issues).toEqual([
      { index: 1, key: 'character_id', label: '角色', reason: '必须是整数' }
    ])
  })
})

describe('blankEditRow', () => {
  it('seeds every declared column', () => {
    expect(blankEditRow(roster)).toEqual({
      character_id: '',
      kind: '',
      spoiler: ''
    })
  })
})
