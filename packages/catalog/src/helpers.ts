import type {
  EditColumnType,
  EditFieldConfig,
  EditObjectColumn,
  EditSelectOption
} from '@nextmoe/edit-ui-core'

import type { CatalogResolve, CatalogSearch } from './types'
import { INTRO_LANG_OPTIONS } from './vocab'

export const GROUP = {
  basic: '基本',
  name: '名称',
  desc: '描述',
  rel: '关系',
  media: '媒体',
  release: '发行'
} as const

export const suppressed = (
  parentLabel: string,
  group: string
): EditFieldConfig => ({
  label: `${parentLabel}（已隐藏）`,
  group,
  control: 'readonly'
})

// ObjectListCell only mounts KunSelect when control is 'select'; options
// alone still render a text input, and a typed public-API string is a 422.
export const selectColumn = (
  key: string,
  label: string,
  type: EditColumnType,
  required: boolean,
  options: EditSelectOption[],
  width?: string
): EditObjectColumn => ({
  key,
  label,
  type,
  required,
  options,
  control: 'select',
  ...(width ? { width } : {})
})

export const switchColumn = (
  key: string,
  label: string,
  required: boolean,
  width = 'w-24'
): EditObjectColumn => ({
  key,
  label,
  type: 'boolean',
  required,
  control: 'switch',
  width
})

export const textColumn = (
  key: string,
  label: string,
  required: boolean,
  extra?: Partial<EditObjectColumn>
): EditObjectColumn => ({
  key,
  label,
  type: 'string',
  required,
  ...extra
})

export const idColumn = (
  key: string,
  label: string,
  required: boolean,
  refs?: {
    search?: CatalogSearch
    resolve?: CatalogResolve
    width?: string
  }
): EditObjectColumn => {
  const column: EditObjectColumn = {
    key,
    label,
    type: 'integer',
    required
  }
  if (refs?.search) {
    column.control = 'entity-picker'
    column.searchEntities = refs.search
    if (refs.resolve) {
      column.resolveEntities = refs.resolve
    }
  }
  if (refs?.width) {
    column.width = refs.width
  }
  return column
}

export const introColumns = (): EditObjectColumn[] => [
  selectColumn('lang', '语言', 'string', true, INTRO_LANG_OPTIONS, 'w-32'),
  textColumn('intro', '介绍', true, { control: 'textarea' })
]

export const introList = (label = '介绍'): EditFieldConfig => ({
  label,
  group: GROUP.desc,
  description:
    '每种语言一条，语言仅限英语、日语、简体中文、繁体中文。介绍最多 50000 字，最多 200 条。',
  columns: introColumns()
})

export const urlList = (label = '链接'): EditFieldConfig => ({
  label,
  group: GROUP.media,
  control: 'string-list',
  description: '须为 http(s) URL，最多 200 条，每条最多 2000 字。'
})

export const nameField = (
  maxRunes: number,
  label = '名称'
): EditFieldConfig => ({
  label,
  group: GROUP.name,
  description: `不能为空，最多 ${maxRunes} 字。`
})
