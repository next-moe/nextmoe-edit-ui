import type { EditControl } from './types'

export type EditListShape = 'empty' | 'scalar' | 'object' | 'mixed' | 'not-list'

export const listShape = (value: unknown): EditListShape => {
  if (!Array.isArray(value)) {
    return 'not-list'
  }
  if (value.length === 0) {
    return 'empty'
  }
  let scalars = 0
  let objects = 0
  for (const item of value) {
    if (item !== null && typeof item === 'object') {
      objects += 1
    } else {
      scalars += 1
    }
  }
  if (objects === 0) {
    return 'scalar'
  }
  return scalars === 0 ? 'object' : 'mixed'
}

// The wire schema says `list` + `items` for both `["https://…"]` and
// `[{lang, title, latin, kind}]`, so no static mapping can tell them apart. A
// scalar list editor fed objects stringifies them to "[object Object]" and then
// emits that back as the field's new value — the patch looks plausible and the
// real rows are gone. Degrade on the value instead of trusting the control.
const SCALAR_LIST_CONTROLS = new Set<EditControl>(['string-list', 'number-list'])

export interface GuardedEditControl {
  control: EditControl
  degraded: boolean
  reason?: string
}

export const guardEditControl = (
  control: EditControl,
  value: unknown
): GuardedEditControl => {
  if (!SCALAR_LIST_CONTROLS.has(control)) {
    return { control, degraded: false }
  }
  const shape = listShape(value)
  if (shape === 'object' || shape === 'mixed') {
    return {
      control: 'readonly',
      degraded: true,
      reason: '该字段的元素是对象，纯文本列表会破坏数据，已降级为只读'
    }
  }
  return { control, degraded: false }
}

export const overElementCap = (value: unknown, max?: number): boolean =>
  typeof max === 'number' && max > 0 && Array.isArray(value) && value.length > max
