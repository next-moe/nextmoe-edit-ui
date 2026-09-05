import type { EditFieldConfig, EditFieldConfigMap } from '@nextmoe/edit-ui-core'

import {
  GROUP,
  idColumn,
  introList,
  selectColumn,
  suppressed,
  textColumn,
  urlList
} from './helpers'
import {
  workCreditIdentityKey,
  workRosterIdentityKey,
  workTitleIdentityKey
} from './identity'
import type { CatalogPresetOptions } from './types'
import {
  TITLE_LANG_OPTIONS,
  CONTENT_RATING_OPTIONS,
  LABEL_KIND_OPTIONS,
  OLANG_OPTIONS,
  ROSTER_KIND_OPTIONS,
  SPOILER_OPTIONS,
  TITLE_KIND_OPTIONS
} from './vocab'
import { workCoverConfig, workScreenshotConfig } from './work_media'

const idList = (
  options: CatalogPresetOptions,
  ref: 'tag' | 'engine' | 'series',
  label: string,
  description: string,
  fallbackDescription = description
): EditFieldConfig => {
  const search = options.searchEntities?.[ref]
  const resolve = options.resolveEntities?.[ref]
  if (search) {
    return {
      label,
      group: GROUP.rel,
      description,
      control: 'entity-picker',
      multiple: true,
      searchEntities: search,
      ...(resolve ? { resolveEntities: resolve } : {})
    }
  }
  return {
    label,
    group: GROUP.rel,
    description: fallbackDescription,
    control: 'number-list'
  }
}

const titles = (): EditFieldConfig => ({
  label: '标题',
  group: GROUP.name,
  description:
    '至少一条官方标题，最多 100 条。标题最多 500 字。只有别名可以不填语言。',
  identityKey: workTitleIdentityKey,
  columns: [
    selectColumn(
      'lang',
      '语言',
      'string',
      true,
      TITLE_LANG_OPTIONS,
      'w-32'
    ),
    textColumn('title', '标题', true),
    textColumn('latin', '拉丁转写', false, { width: 'w-32' }),
    selectColumn('kind', '类型', 'integer', true, TITLE_KIND_OPTIONS, 'w-28')
  ]
})

const credits = (options: CatalogPresetOptions): EditFieldConfig => ({
  label: '制作人员',
  group: GROUP.rel,
  description: options.searchEntities?.role
    ? '最多 500 条。不关联角色时不要填写角色。'
    : '最多 500 条。职责请填写 catalog_role 的正整数 id。不关联角色时不要填写角色。',
  identityKey: workCreditIdentityKey,
  columns: [
    idColumn('role_id', '职责', true, {
      search: options.searchEntities?.role,
      resolve: options.resolveEntities?.role,
      width: 'w-40'
    }),
    idColumn('credit_name_id', '职人', true, {
      search: options.searchEntities?.credit_name,
      resolve: options.resolveEntities?.credit_name
    }),
    idColumn('character_id', '角色', false, {
      search: options.searchEntities?.character,
      resolve: options.resolveEntities?.character
    }),
    textColumn('note', '备注', false, { control: 'textarea' })
  ]
})

const roster = (options: CatalogPresetOptions): EditFieldConfig => ({
  label: '登场角色',
  group: GROUP.rel,
  description:
    '不能新增或删除行，只能改已有登场角色的定位和剧透。新增的行会在合并时被拒绝。最多 500 条。',
  identityKey: workRosterIdentityKey,
  allowAdd: false,
  allowRemove: false,
  columns: [
    idColumn('character_id', '角色', true, {
      search: options.searchEntities?.character,
      resolve: options.resolveEntities?.character
    }),
    selectColumn('kind', '定位', 'integer', true, ROSTER_KIND_OPTIONS, 'w-28'),
    selectColumn('spoiler', '剧透', 'integer', true, SPOILER_OPTIONS, 'w-28')
  ]
})

const labels = (options: CatalogPresetOptions): EditFieldConfig => ({
  label: '厂商',
  group: GROUP.rel,
  description: '最多 200 条。同一厂商可以挂多种身份。',
  columns: [
    idColumn('label_id', '厂商', true, {
      search: options.searchEntities?.label,
      resolve: options.resolveEntities?.label
    }),
    selectColumn('kind', '身份', 'integer', true, LABEL_KIND_OPTIONS, 'w-28')
  ]
})

export const workPreset = (
  options: CatalogPresetOptions
): EditFieldConfigMap => ({
  'catalog.work.content_rating': {
    label: '内容分级',
    group: GROUP.basic,
    options: CONTENT_RATING_OPTIONS
  },
  'catalog.work.covers': workCoverConfig(options),
  'catalog.work.credits': credits(options),
  'catalog.work.credits.suppressed': suppressed('制作人员', GROUP.rel),
  'catalog.work.display_name': {
    label: '显示名',
    group: GROUP.name,
    description: '不能为空，最多 500 字。'
  },
  'catalog.work.display_nsfw': {
    label: '显示为限制级',
    group: GROUP.basic,
    control: 'switch'
  },
  'catalog.work.engine_ids': idList(
    options,
    'engine',
    '引擎',
    '最多 200 个。',
    '请填写引擎 id。最多 200 个。'
  ),
  'catalog.work.intros': introList(),
  'catalog.work.labels': labels(options),
  'catalog.work.links': urlList(),
  'catalog.work.olang': {
    label: '原语言',
    group: GROUP.basic,
    options: OLANG_OPTIONS
  },
  'catalog.work.roster': roster(options),
  'catalog.work.roster.suppressed': suppressed('登场角色', GROUP.rel),
  'catalog.work.screenshots': workScreenshotConfig(options),
  'catalog.work.series_ids': idList(
    options,
    'series',
    '系列',
    '仅可关联自建系列，最多 200 个。',
    '仅可填写自建系列的 id，最多 200 个。'
  ),
  'catalog.work.tag_ids': idList(options, 'tag', '标签', '最多 200 个。'),
  'catalog.work.titles': titles(),
  'catalog.work.titles.suppressed': suppressed('标题', GROUP.name)
})
