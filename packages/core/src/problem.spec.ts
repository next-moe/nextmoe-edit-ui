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
      'catalog.work.links': ['is locked']
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
