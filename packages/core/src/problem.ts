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

// Only the classes whose detail adds nothing beyond the key are translated.
// UNKNOWN_VALUE stays on the server prose: it covers both unknown-field and
// validation errors, and there the detail is the actual content.
const REASON_MESSAGE: Record<string, string> = {
  IMMUTABLE: '该字段已锁定，不能修改',
  NOT_PERMITTED: '没有修改该字段的权限',
  INCONSISTENT_WITH: '该字段在提案提交后已被其他修订修改，请基于最新版本重试'
}

// Two shapes carry the same key: `field "k": <reason>` for a validation
// failure and `field "k" is locked` with no colon. Stripping only the first
// left "field \"…\" is locked" on the message under the field's own label.
const messageOf = (error: EditProblemFieldError): string => {
  const mapped = error.reason ? REASON_MESSAGE[error.reason] : undefined
  if (mapped) {
    return mapped
  }
  return (error.detail ?? error.reason ?? '')
    .replace(/^editing:\s*/, '')
    .replace(/^field "[^"]*"(?::\s*|\s+)/, '')
}

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
  // A field-level PermissionError now carries a /patch/<key> pointer, but a
  // not-the-proposer refusal still arrives with no field errors at all, so the
  // top-level detail stays the fallback; without it that refusal renders as
  // nothing.
  if (!out.form.length && !Object.keys(out.fields).length && detail) {
    out.form.push(detail.replace(/^editing: /, ''))
  }
  return out
}
