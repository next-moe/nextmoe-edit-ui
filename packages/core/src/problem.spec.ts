import { describe, it, expect } from 'vitest'
import { parseEditProblem } from './problem'

describe('parseEditProblem', () => {
  it('accepts both pointer prefixes the API actually emits', () => {
    const parsed = parseEditProblem({
      status: 422,
      errors: [
        {
          pointer: '/catalog.work.titles',
          reason: 'UNKNOWN_VALUE',
          detail: 'editing: field "catalog.work.titles": element 0: title must not be empty'
        },
        {
          pointer: '/patch/catalog.work.links',
          reason: 'IMMUTABLE',
          detail: 'editing: field "catalog.work.links" is locked'
        }
      ]
    })

    expect(parsed.fields).toEqual({
      'catalog.work.titles': ['element 0: title must not be empty'],
      'catalog.work.links': ['该字段已锁定，不能修改']
    })
    expect(parsed.form).toEqual([])
  })

  it('collects every conflicting key separately', () => {
    const parsed = parseEditProblem({
      detail: 'editing: conflicting fields: a, b',
      errors: [
        { pointer: '/patch/a', detail: 'another revision changed this key' },
        { pointer: '/patch/b', detail: 'another revision changed this key' }
      ]
    })
    expect(Object.keys(parsed.fields)).toEqual(['a', 'b'])
  })

  it('translates the reasons whose detail adds nothing beyond the key', () => {
    const parsed = parseEditProblem({
      errors: [
        {
          pointer: '/patch/a',
          reason: 'NOT_PERMITTED',
          detail: 'editing: not allowed to propose field "a"'
        },
        {
          pointer: '/patch/b',
          reason: 'INCONSISTENT_WITH',
          detail: 'another revision changed this key since the proposal was written'
        },
        {
          pointer: '/patch/c',
          reason: 'UNKNOWN_VALUE',
          detail: 'editing: field "c": unknown field'
        }
      ]
    })
    expect(parsed.fields).toEqual({
      a: ['没有修改该字段的权限'],
      b: ['该字段在提案提交后已被其他修订修改，请基于最新版本重试'],
      c: ['unknown field']
    })
  })

  // A permission refusal arrives with errors: [] and the key only in detail.
  it('falls back to the top-level detail when there are no field errors', () => {
    const parsed = parseEditProblem({
      status: 403,
      detail: 'editing: not allowed to propose field "catalog.work.titles"'
    })
    expect(parsed.fields).toEqual({})
    expect(parsed.form).toEqual([
      'not allowed to propose field "catalog.work.titles"'
    ])
  })

  it('puts a whole-patch error on the form, not on a field named patch', () => {
    const parsed = parseEditProblem({
      errors: [{ pointer: '/patch', reason: 'REQUIRED', detail: 'patch must not be empty' }]
    })
    expect(parsed.fields).toEqual({})
    expect(parsed.form).toEqual(['patch must not be empty'])
  })

  it('survives a non-object', () => {
    expect(parseEditProblem(null)).toEqual({ fields: {}, form: [] })
  })
})
