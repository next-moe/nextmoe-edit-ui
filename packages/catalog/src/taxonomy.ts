import type { EditFieldConfigMap } from '@nextmoe/edit-ui-core'

import { GROUP, introList, nameField, urlList } from './helpers'
import type { CatalogPresetOptions } from './types'

export const labelPreset = (
  _options: CatalogPresetOptions
): EditFieldConfigMap => ({
  'catalog.label.intros': introList(),
  'catalog.label.links': urlList(),
  'catalog.label.name': nameField(300)
})

export const enginePreset = (
  _options: CatalogPresetOptions
): EditFieldConfigMap => ({
  'catalog.engine.aliases': {
    label: '别名',
    group: GROUP.name,
    control: 'string-list',
    description: '最多 200 条，每条去重后最多 300 字，不能为空。'
  },
  'catalog.engine.intro': {
    label: '介绍',
    group: GROUP.desc,
    description: '最多 50000 字。'
  },
  'catalog.engine.name': nameField(300)
})

export const seriesPreset = (
  _options: CatalogPresetOptions
): EditFieldConfigMap => ({
  'catalog.series.intros': introList(),
  'catalog.series.name': {
    label: '名称',
    group: GROUP.name,
    description: '不能为空，最多 300 字。仅自建系列可改名。'
  }
})

export const tagPreset = (
  _options: CatalogPresetOptions
): EditFieldConfigMap => ({
  'catalog.tag.intros': introList()
})
