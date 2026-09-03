import type { EditFieldConfig } from '@nextmoe/edit-ui-core'

import { GROUP, selectColumn, textColumn } from './helpers'
import type { CatalogPresetOptions } from './types'
import { SEXUAL_OPTIONS, VIOLENCE_OPTIONS } from './vocab'

const withImageFns = (
  options: CatalogPresetOptions
): Pick<EditFieldConfig, 'uploadImage' | 'resolveImage'> => ({
  ...(options.uploadImage ? { uploadImage: options.uploadImage } : {}),
  ...(options.resolveImage ? { resolveImage: options.resolveImage } : {})
})

export const workCoverConfig = (
  options: CatalogPresetOptions
): EditFieldConfig => ({
  label: '封面',
  group: GROUP.media,
  description:
    '最多 200 张。种类为开放词表，最多 64 字。竖版封面通过钉选设置，同一时刻只能钉一张。',
  control: 'image-list',
  pinItemFlag: { key: 'portrait_pinned', label: '竖版封面' },
  itemColumns: [
    textColumn('kind', '种类', false, { width: 'w-32' }),
    selectColumn('sexual', '性相关', 'integer', false, SEXUAL_OPTIONS, 'w-28'),
    selectColumn('violence', '暴力', 'integer', false, VIOLENCE_OPTIONS, 'w-28')
  ],
  ...withImageFns(options)
})

export const workScreenshotConfig = (
  options: CatalogPresetOptions
): EditFieldConfig => ({
  label: '截图',
  group: GROUP.media,
  description: '最多 200 张。说明最多 500 字。',
  control: 'image-list',
  itemColumns: [
    textColumn('caption', '说明', false, { control: 'textarea' }),
    selectColumn('sexual', '性相关', 'integer', false, SEXUAL_OPTIONS, 'w-28'),
    selectColumn('violence', '暴力', 'integer', false, VIOLENCE_OPTIONS, 'w-28')
  ],
  ...withImageFns(options)
})
