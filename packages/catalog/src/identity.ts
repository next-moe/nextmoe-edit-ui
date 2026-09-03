import { cleanEditText } from '@nextmoe/edit-ui-core'

const asObject = (item: unknown): Record<string, unknown> | null =>
  item !== null && typeof item === 'object' && !Array.isArray(item)
    ? (item as Record<string, unknown>)
    : null

const asInteger = (value: unknown): number | null =>
  typeof value === 'number' && Number.isInteger(value) ? value : null

export const workTitleIdentityKey = (item: unknown): string | null => {
  const row = asObject(item)
  if (!row) {
    return null
  }
  const kind = asInteger(row.kind)
  if (kind === null) {
    return null
  }
  // An alias may carry no language, and the row that reaches here has had every
  // blank optional key dropped for the wire payload — but the column is NOT NULL
  // and stores "", so the key keeps an empty segment. Rejecting the missing lang
  // left exactly those rows with no key, hence no suppression toggle at all.
  const lang = row.lang === undefined ? '' : row.lang
  if (typeof lang !== 'string') {
    return null
  }
  if (typeof row.title !== 'string') {
    return null
  }
  const text = cleanEditText(row.title)
  if (text === '') {
    return null
  }
  return `title:${kind}:${lang}:${text}`
}

export const characterAliasIdentityKey = (item: unknown): string | null => {
  const row = asObject(item)
  if (!row) {
    return null
  }
  const kind = asInteger(row.kind)
  if (kind === null) {
    return null
  }
  if (typeof row.lang !== 'string') {
    return null
  }
  if (typeof row.name !== 'string') {
    return null
  }
  const text = cleanEditText(row.name)
  if (text === '') {
    return null
  }
  return `alias:${kind}:${row.lang}:${text}`
}

export const workRosterIdentityKey = (item: unknown): string | null => {
  const row = asObject(item)
  if (!row) {
    return null
  }
  const characterId = asInteger(row.character_id)
  if (characterId === null || characterId <= 0) {
    return null
  }
  return `roster:${characterId}`
}

export const workCreditIdentityKey = (item: unknown): string | null => {
  const row = asObject(item)
  if (!row) {
    return null
  }
  const roleId = asInteger(row.role_id)
  const creditNameId = asInteger(row.credit_name_id)
  if (roleId === null || roleId <= 0) {
    return null
  }
  if (creditNameId === null || creditNameId <= 0) {
    return null
  }
  // The server stores character_id 0 when the credit names no character;
  // omitting the key here has to produce that same segment or the suppression
  // set misses the row.
  if (!('character_id' in row) || row.character_id === undefined) {
    return `credit:${roleId}:${creditNameId}:0`
  }
  const characterId = asInteger(row.character_id)
  if (characterId === null || characterId < 0) {
    return null
  }
  return `credit:${roleId}:${creditNameId}:${characterId}`
}
