import type { EditFieldConfigMap } from '@nextmoe/edit-ui-core'

import { characterPreset } from './character'
import { releasePreset } from './release'
import {
  enginePreset,
  labelPreset,
  seriesPreset,
  tagPreset
} from './taxonomy'
import type { CatalogEntityType, CatalogPresetOptions } from './types'
import { workPreset } from './work'

export const CATALOG_ENTITY_TYPES = [
  'catalog.work',
  'catalog.character',
  'catalog.release',
  'catalog.label',
  'catalog.engine',
  'catalog.series',
  'catalog.tag'
] as const satisfies readonly CatalogEntityType[]

export const catalogConfig = (
  type: CatalogEntityType,
  options: CatalogPresetOptions = {}
): EditFieldConfigMap => {
  switch (type) {
    case 'catalog.work':
      return workPreset(options)
    case 'catalog.character':
      return characterPreset(options)
    case 'catalog.release':
      return releasePreset(options)
    case 'catalog.label':
      return labelPreset(options)
    case 'catalog.engine':
      return enginePreset(options)
    case 'catalog.series':
      return seriesPreset(options)
    case 'catalog.tag':
      return tagPreset(options)
    default:
      return {}
  }
}

export { characterPreset } from './character'
export { releasePreset } from './release'
export {
  enginePreset,
  labelPreset,
  seriesPreset,
  tagPreset
} from './taxonomy'
export { workPreset } from './work'

export {
  characterAliasIdentityKey,
  workCreditIdentityKey,
  workRosterIdentityKey,
  workTitleIdentityKey
} from './identity'

export {
  ALIAS_KIND_OPTIONS,
  BLOOD_TYPE_OPTIONS,
  CHARACTER_LANG_OPTIONS,
  CONTENT_RATING_OPTIONS,
  GENDER_OPTIONS,
  INTRO_LANG_OPTIONS,
  LABEL_KIND_OPTIONS,
  OLANG_OPTIONS,
  TITLE_LANG_OPTIONS,
  RELEASE_KIND_OPTIONS,
  RELEASE_LANG_OPTIONS,
  RELEASE_PLATFORM_OPTIONS,
  ROSTER_KIND_OPTIONS,
  SEXUAL_OPTIONS,
  SPOILER_OPTIONS,
  TITLE_KIND_OPTIONS,
  VIOLENCE_OPTIONS
} from './vocab'

export type {
  CatalogEntityRef,
  CatalogEntityType,
  CatalogPresetOptions,
  CatalogResolve,
  CatalogSearch
} from './types'
