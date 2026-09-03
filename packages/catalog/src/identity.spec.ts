import { describe, expect, it } from 'vitest'

import {
  characterAliasIdentityKey,
  workCreditIdentityKey,
  workRosterIdentityKey,
  workTitleIdentityKey
} from './identity'

describe('workTitleIdentityKey', () => {
  it('builds title:<kind>:<lang>:<cleaned title>', () => {
    expect(
      workTitleIdentityKey({ kind: 0, lang: 'ja', title: 'ひぐらし' })
    ).toBe('title:0:ja:ひぐらし')
  })

  it('strips a zero-width character from the title text', () => {
    expect(
      workTitleIdentityKey({
        kind: 1,
        lang: 'ja',
        title: 'ひぐ\u200bらし'
      })
    ).toBe('title:1:ja:ひぐらし')
  })

  it('returns null when the title is missing', () => {
    expect(workTitleIdentityKey({ kind: 0, lang: 'ja' })).toBeNull()
  })

  it('returns null when cleaning leaves the title empty', () => {
    expect(
      workTitleIdentityKey({ kind: 0, lang: 'ja', title: ' \u200b ' })
    ).toBeNull()
  })
})

describe('characterAliasIdentityKey', () => {
  it('builds alias:<kind>:<lang>:<cleaned name>', () => {
    expect(
      characterAliasIdentityKey({
        kind: 0,
        lang: 'zh-Hans',
        name: '蕾娜'
      })
    ).toBe('alias:0:zh-Hans:蕾娜')
  })

  it('returns null when the name is missing', () => {
    expect(
      characterAliasIdentityKey({ kind: 1, lang: 'en' })
    ).toBeNull()
  })
})

describe('workRosterIdentityKey', () => {
  it('builds roster:<character_id>', () => {
    expect(workRosterIdentityKey({ character_id: 128, kind: 1 })).toBe(
      'roster:128'
    )
  })

  it('returns null when character_id is missing', () => {
    expect(workRosterIdentityKey({ kind: 1, spoiler: 0 })).toBeNull()
  })

  it('returns null when character_id is not a positive integer', () => {
    expect(workRosterIdentityKey({ character_id: 0 })).toBeNull()
    expect(workRosterIdentityKey({ character_id: '128' })).toBeNull()
  })
})

describe('workCreditIdentityKey', () => {
  it('builds credit:<role_id>:<credit_name_id>:<character_id>', () => {
    expect(
      workCreditIdentityKey({
        role_id: 3,
        credit_name_id: 9,
        character_id: 42
      })
    ).toBe('credit:3:9:42')
  })

  it('uses 0 when the credit names no character', () => {
    expect(
      workCreditIdentityKey({ role_id: 3, credit_name_id: 9 })
    ).toBe('credit:3:9:0')
  })

  it('keeps an explicit character_id of 0', () => {
    expect(
      workCreditIdentityKey({
        role_id: 3,
        credit_name_id: 9,
        character_id: 0
      })
    ).toBe('credit:3:9:0')
  })

  it('returns null when a required id is missing', () => {
    expect(workCreditIdentityKey({ credit_name_id: 9 })).toBeNull()
    expect(workCreditIdentityKey({ role_id: 3 })).toBeNull()
  })
})
