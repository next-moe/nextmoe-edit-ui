import type { EditFieldConfigMap } from '@nextmoe/edit-ui-core'

import { GROUP } from './helpers'
import type { CatalogPresetOptions } from './types'
import {
  RELEASE_KIND_OPTIONS,
  RELEASE_LANG_OPTIONS,
  RELEASE_PLATFORM_OPTIONS
} from './vocab'

export const releasePreset = (
  _options: CatalogPresetOptions
): EditFieldConfigMap => ({
  'catalog.release.hidden': {
    label: '隐藏',
    group: GROUP.basic,
    control: 'switch'
  },
  'catalog.release.kind': {
    label: '发行类型',
    group: GROUP.release,
    options: RELEASE_KIND_OPTIONS
  },
  'catalog.release.lang': {
    label: '语言',
    group: GROUP.release,
    nullable: true,
    options: RELEASE_LANG_OPTIONS
  },
  'catalog.release.platform': {
    label: '平台',
    group: GROUP.release,
    nullable: true,
    options: RELEASE_PLATFORM_OPTIONS
  },
  'catalog.release.released': {
    label: '发行日期',
    group: GROUP.release,
    nullable: true,
    description: '年份须在 1950–2200。填日必须先填月。可空。'
  },
  'catalog.release.title': {
    label: '标题',
    group: GROUP.name,
    nullable: true,
    description: '最多 300 字，可空。'
  }
})
