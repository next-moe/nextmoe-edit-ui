import { describe, it, expect } from 'vitest'
import {
  cleanEditText,
  compareIdentityKeys,
  isSuppressed,
  normalizeSuppressedKeys,
  toggleSuppressedKey
} from './suppression'

describe('cleanEditText', () => {
  it('strips zero-width and bidi controls anywhere in the value', () => {
    expect(cleanEditText('ひぐ​らし‮')).toBe('ひぐらし')
    expect(cleanEditText('﻿BOM')).toBe('BOM')
  })

  it('trims the ideographic space as well as ASCII whitespace', () => {
    expect(cleanEditText('　 title \t')).toBe('title')
  })

  it('keeps the emoji variation selector', () => {
    expect(cleanEditText('⚠️')).toBe('⚠️')
  })

  it('exposes a space the strip pass uncovers, like Clean does', () => {
    expect(cleanEditText('title ​ ')).toBe('title')
  })
})

describe('compareIdentityKeys', () => {
  // Go compares with `<=` on UTF-8 bytes, i.e. code-point order. JavaScript's
  // default sort is UTF-16 code-unit order and puts a surrogate pair first.
  it('orders above-BMP characters after U+E000, unlike the default sort', () => {
    const emoji = 'title:0:ja:🎮'
    const pua = 'title:0:ja:'
    expect(compareIdentityKeys(emoji, pua)).toBeGreaterThan(0)
    expect([emoji, pua].sort()[0]).toBe(emoji)
    expect([emoji, pua].sort(compareIdentityKeys)[0]).toBe(pua)
  })

  it('orders a prefix before the longer key', () => {
    expect(compareIdentityKeys('title:0:ja:a', 'title:0:ja:ab')).toBeLessThan(0)
  })
})

describe('normalizeSuppressedKeys', () => {
  it('sorts ascending, deduplicates and drops non-strings', () => {
    expect(
      normalizeSuppressedKeys(['b', 'a', 'b', '', 3, null, 'c'])
    ).toEqual(['a', 'b', 'c'])
  })

  it('returns an empty list for a non-array', () => {
    expect(normalizeSuppressedKeys(undefined)).toEqual([])
  })
})

describe('toggleSuppressedKey', () => {
  it('adds a key and keeps the set sorted', () => {
    expect(toggleSuppressedKey(['c', 'a'], 'b')).toEqual(['a', 'b', 'c'])
  })

  it('removes a key that is already there', () => {
    expect(toggleSuppressedKey(['a', 'b'], 'b')).toEqual(['a'])
  })

  it('ignores a row with no identity key', () => {
    expect(toggleSuppressedKey(['a'], null)).toEqual(['a'])
  })
})

describe('isSuppressed', () => {
  it('is false for a row with no identity key', () => {
    expect(isSuppressed(['a'], null)).toBe(false)
    expect(isSuppressed(['a'], 'a')).toBe(true)
  })
})
