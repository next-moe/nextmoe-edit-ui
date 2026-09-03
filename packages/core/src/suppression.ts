// Mirrors textnorm.Clean in nextmoe-infra
// (apps/api/internal/platform/textnorm/textnorm.go): strip these code points
// anywhere in the value, then trim the whitespace set from both ends. U+FE0F is
// deliberately absent — it is part of legitimate emoji like ⚠️. An identity key
// built from text this function did not clean is rejected by the server, so the
// two lists have to stay identical.
const STRIP = new Set([
  0x200b, 0x200c, 0x200d, 0x200e, 0x200f, 0x202a, 0x202b, 0x202c, 0x202d,
  0x202e, 0x2060, 0x2066, 0x2067, 0x2068, 0x2069, 0xfeff
])

const TRIM = new Set([' ', '\t', '\n', '\r', '　'])

export const cleanEditText = (value: string): string => {
  let out = ''
  for (const ch of value) {
    if (!STRIP.has(ch.codePointAt(0)!)) {
      out += ch
    }
  }
  let start = 0
  let end = out.length
  while (start < end && TRIM.has(out[start]!)) {
    start += 1
  }
  while (end > start && TRIM.has(out[end - 1]!)) {
    end -= 1
  }
  return out.slice(start, end)
}

// The server compares keys with Go's `<=`, which is UTF-8 byte order. That is
// code-point order, and JavaScript's default sort is UTF-16 code-unit order —
// the two disagree above the BMP, where a surrogate pair sorts before U+E000.
// A title carrying an emoji or a CJK extension character is exactly where the
// default sort produces a set the server rejects as unsorted.
export const compareIdentityKeys = (a: string, b: string): number => {
  const ca = Array.from(a)
  const cb = Array.from(b)
  const n = Math.min(ca.length, cb.length)
  for (let i = 0; i < n; i += 1) {
    const d = ca[i]!.codePointAt(0)! - cb[i]!.codePointAt(0)!
    if (d !== 0) {
      return d
    }
  }
  return ca.length - cb.length
}

export const normalizeSuppressedKeys = (keys: unknown): string[] => {
  if (!Array.isArray(keys)) {
    return []
  }
  const seen = new Set<string>()
  for (const key of keys) {
    if (typeof key === 'string' && key !== '') {
      seen.add(key)
    }
  }
  return [...seen].sort(compareIdentityKeys)
}

export const isSuppressed = (keys: unknown, key: string | null): boolean =>
  key !== null && normalizeSuppressedKeys(keys).includes(key)

export const toggleSuppressedKey = (
  keys: unknown,
  key: string | null
): string[] => {
  const current = normalizeSuppressedKeys(keys)
  if (key === null) {
    return current
  }
  const next = current.includes(key)
    ? current.filter((k) => k !== key)
    : [...current, key]
  return next.sort(compareIdentityKeys)
}
