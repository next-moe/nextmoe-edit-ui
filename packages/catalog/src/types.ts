import type { EditFieldConfig, EditSelectOption } from '@nextmoe/edit-ui-core'

export type CatalogEntityType =
  | 'catalog.work'
  | 'catalog.character'
  | 'catalog.release'
  | 'catalog.label'
  | 'catalog.engine'
  | 'catalog.series'
  | 'catalog.tag'

// role resolves against GET /v2/catalog/roles (which searchObjects does not
// cover); engine and series ride searchObjects since spec 2.5.0.
export type CatalogEntityRef =
  | 'character'
  | 'credit_name'
  | 'engine'
  | 'label'
  | 'role'
  | 'series'
  | 'tag'

export type CatalogSearch = (keyword: string) => Promise<EditSelectOption[]>

export type CatalogResolve = (
  ids: (string | number)[]
) => Promise<EditSelectOption[]> | EditSelectOption[]

export interface CatalogPresetOptions {
  searchEntities?: Partial<Record<CatalogEntityRef, CatalogSearch>>
  resolveEntities?: Partial<Record<CatalogEntityRef, CatalogResolve>>
  uploadImage?: EditFieldConfig['uploadImage']
  resolveImage?: EditFieldConfig['resolveImage']
}
