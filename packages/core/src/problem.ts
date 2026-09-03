export interface EditProblemFieldError {
  pointer?: string
  parameter?: string
  header?: string
  reason?: string
  detail?: string
}

export interface EditProblem {
  status?: number
  code?: string
  title?: string
  detail?: string
  errors?: EditProblemFieldError[]
}

export interface EditProblemMessages {
  fields: Record<string, string[]>
  form: string[]
}

// The catalog API answers a rejected patch with RFC 7807. Field keys arrive as
// a JSON pointer, and the prefix is not consistent: ValidationError emits
// "/<key>" while UnknownField, LockedField and Conflict emit "/patch/<key>".
// Accept both — a validation message pinned to the wrong field is worse than
// one shown on the form.
const FIELD_KEY = /^\/(?:patch\/|set\/)?(.+)$/

// Two shapes carry the same key: `field "k": <reason>` for a validation
// failure and `field "k" is locked` with no colon. Stripping only the first
// left "field \"…\" is locked" on the message under the field's own label.
const messageOf = (error: EditProblemFieldError): string =>
  (error.detail ?? error.reason ?? '')
    .replace(/^editing:\s*/, '')
    .replace(/^field "[^"]*"(?::\s*|\s+)/, '')

export const parseEditProblem = (problem: unknown): EditProblemMessages => {
  const out: EditProblemMessages = { fields: {}, form: [] }
  if (!problem || typeof problem !== 'object') {
    return out
  }
  const { errors, detail } = problem as EditProblem
  for (const error of Array.isArray(errors) ? errors : []) {
    const match = error.pointer ? FIELD_KEY.exec(error.pointer) : null
    const key = match?.[1]
    const message = messageOf(error)
    if (!message) {
      continue
    }
    if (key && key !== 'patch') {
      ;(out.fields[key] ??= []).push(message)
    } else {
      out.form.push(message)
    }
  }
  // PermissionError comes back with an empty errors array, so its only carrier
  // is the top-level detail; without this the refusal renders as nothing at all.
  if (!out.form.length && !Object.keys(out.fields).length && detail) {
    out.form.push(detail.replace(/^editing: /, ''))
  }
  return out
}
