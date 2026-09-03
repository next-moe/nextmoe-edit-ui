import type { EditFieldConfigMap } from '@nextmoe/edit-ui-core'

import {
  GROUP,
  introList,
  selectColumn,
  suppressed,
  switchColumn,
  textColumn
} from './helpers'
import { characterAliasIdentityKey } from './identity'
import type { CatalogPresetOptions } from './types'
import {
  ALIAS_KIND_OPTIONS,
  BLOOD_TYPE_OPTIONS,
  CHARACTER_LANG_OPTIONS,
  GENDER_OPTIONS,
  OLANG_OPTIONS
} from './vocab'

const measure = (
  label: string,
  min: number,
  max: number
): EditFieldConfigMap[string] => ({
  label,
  group: GROUP.basic,
  nullable: true,
  description: `${min}–${max}，可空。`
})

export const characterPreset = (
  _options: CatalogPresetOptions
): EditFieldConfigMap => ({
  'catalog.character.aliases': {
    label: '别名',
    group: GROUP.name,
    description:
      '最多 200 条。名称最多 300 字。同一 (名称, 语言) 不能重复。检索提示（kind 2）不可编辑。',
    identityKey: characterAliasIdentityKey,
    columns: [
      textColumn('name', '名称', true),
      selectColumn('lang', '语言', 'string', true, OLANG_OPTIONS, 'w-32'),
      selectColumn('kind', '类型', 'integer', true, ALIAS_KIND_OPTIONS, 'w-28'),
      textColumn('latin', '拉丁转写', false, { width: 'w-32' }),
      switchColumn('primary', '该语言主名', false)
    ]
  },
  'catalog.character.aliases.suppressed': suppressed('别名', GROUP.name),
  'catalog.character.birthday_day': {
    label: '生日（日）',
    group: GROUP.basic,
    nullable: true,
    description: '1–31，可空。'
  },
  'catalog.character.birthday_month': {
    label: '生日（月）',
    group: GROUP.basic,
    nullable: true,
    description: '1–12，可空。'
  },
  'catalog.character.blood_type': {
    label: '血型',
    group: GROUP.basic,
    nullable: true,
    options: BLOOD_TYPE_OPTIONS
  },
  'catalog.character.bust_cm': measure('胸围', 1, 500),
  'catalog.character.cup': {
    label: '罩杯',
    group: GROUP.basic,
    nullable: true,
    description: '最多 8 字，可空。'
  },
  'catalog.character.description': {
    label: '描述',
    group: GROUP.desc,
    description: '最多 50000 字。'
  },
  'catalog.character.display_name': {
    label: '显示名',
    group: GROUP.name,
    description: '不能为空，最多 300 字。'
  },
  'catalog.character.gender': {
    label: '性别',
    group: GROUP.basic,
    nullable: true,
    options: GENDER_OPTIONS
  },
  'catalog.character.height_cm': measure('身高', 1, 1000),
  'catalog.character.hip_cm': measure('臀围', 1, 500),
  'catalog.character.intros': introList(),
  'catalog.character.lang': {
    label: '语言',
    group: GROUP.basic,
    options: CHARACTER_LANG_OPTIONS,
    description: '空字符串表示未知。'
  },
  'catalog.character.latin': {
    label: '拉丁转写',
    group: GROUP.name,
    nullable: true,
    description: '最多 300 字，可空。'
  },
  'catalog.character.waist_cm': measure('腰围', 1, 500),
  'catalog.character.weight_kg': measure('体重', 1, 1000)
})
