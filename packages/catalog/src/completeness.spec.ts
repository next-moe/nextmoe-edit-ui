import { describe, expect, it } from 'vitest'

import inventory from '../schema/inventory.json'
import { catalogConfig } from './index'
import type { CatalogEntityType } from './types'

const GROUPS = new Set(['基本', '名称', '描述', '关系', '媒体', '发行'])

const BOOLEAN_ENUM_KEYS = new Set([
  'catalog.work.display_nsfw',
  'catalog.release.hidden'
])

const COLUMN_TYPE: Record<string, string> = {
  integer: 'integer',
  string: 'string',
  boolean: 'boolean'
}

type InventoryProperty = {
  name: string
  json_type: string
  required: boolean
}

type InventoryField = {
  key: string
  kind: string
  diff_hint: string
  enum?: unknown[] | null
  is_suppression_companion: boolean
  identity: { present: boolean }
  element: {
    shape: string
    allowed_keys?: string[] | null
    properties?: InventoryProperty[] | null
  }
}

type InventoryEntity = {
  type: string
  fields: InventoryField[]
}

const entities = inventory.entity_types as InventoryEntity[]

const propertyByName = (
  field: InventoryField,
  name: string
): InventoryProperty | undefined =>
  field.element.properties?.find((property) => property.name === name)

describe('catalogConfig completeness', () => {
  it('covers exactly the inventory keys for each entity type', () => {
    for (const entity of entities) {
      const configured = catalogConfig(entity.type as CatalogEntityType)
      const inventoryKeys = entity.fields.map((field) => field.key)
      const configuredKeys = Object.keys(configured)
      const missing = inventoryKeys.filter((key) => !(key in configured))
      const extra = configuredKeys.filter(
        (key) => !inventoryKeys.includes(key)
      )
      expect({ type: entity.type, missing, extra }).toEqual({
        type: entity.type,
        missing: [],
        extra: []
      })
    }
  })

  it('matches scalar enum values, and uses a switch for the boolean enums', () => {
    for (const entity of entities) {
      const configured = catalogConfig(entity.type as CatalogEntityType)
      for (const field of entity.fields) {
        if (!Array.isArray(field.enum)) {
          continue
        }
        const config = configured[field.key]
        expect(config, field.key).toBeDefined()
        if (BOOLEAN_ENUM_KEYS.has(field.key)) {
          expect(config!.control, field.key).toBe('switch')
          expect(config!.options, field.key).toBeUndefined()
          continue
        }
        // Set comparison, not order: the census enum is the validator's
        // accepted-set order, which contradicts the published vocabulary order
        // at platform's win/wiu. The tables follow the published order, and
        // vocab.spec.ts asserts that order per table.
        const values = config!.options?.map((option) => option.value)
        expect(
          values && [...values].sort(),
          field.key
        ).toEqual([...field.enum].sort())
      }
    }
  })

  it('declares object-list columns in allowed_keys order with matching type and required', () => {
    for (const entity of entities) {
      const configured = catalogConfig(entity.type as CatalogEntityType)
      for (const field of entity.fields) {
        if (field.element.shape !== 'object' || field.diff_hint === 'image') {
          continue
        }
        const config = configured[field.key]
        const allowed = field.element.allowed_keys ?? []
        expect(
          config?.columns?.map((column) => column.key),
          field.key
        ).toEqual(allowed)
        for (const column of config?.columns ?? []) {
          const property = propertyByName(field, column.key)
          expect(property, `${field.key}.${column.key}`).toBeDefined()
          expect(column.type, `${field.key}.${column.key}`).toBe(
            COLUMN_TYPE[property!.json_type]
          )
          expect(column.required, `${field.key}.${column.key}`).toBe(
            property!.required
          )
        }
      }
    }
  })

  it('declares image itemColumns without image_hash (and without portrait_pinned on covers)', () => {
    for (const entity of entities) {
      const configured = catalogConfig(entity.type as CatalogEntityType)
      for (const field of entity.fields) {
        if (field.diff_hint !== 'image') {
          continue
        }
        const config = configured[field.key]
        const omit = new Set(['image_hash'])
        if (field.key === 'catalog.work.covers') {
          omit.add('portrait_pinned')
        }
        const expected = (field.element.allowed_keys ?? []).filter(
          (key) => !omit.has(key)
        )
        expect(
          config?.itemColumns?.map((column) => column.key),
          field.key
        ).toEqual(expected)
      }
    }
  })

  it('gives every suppressible parent a callable identityKey', () => {
    for (const entity of entities) {
      const configured = catalogConfig(entity.type as CatalogEntityType)
      for (const field of entity.fields) {
        if (
          !field.identity.present ||
          field.is_suppression_companion
        ) {
          continue
        }
        expect(typeof configured[field.key]?.identityKey, field.key).toBe(
          'function'
        )
      }
    }
  })

  it('marks every suppression companion readonly with a label', () => {
    for (const entity of entities) {
      const configured = catalogConfig(entity.type as CatalogEntityType)
      for (const field of entity.fields) {
        if (!field.is_suppression_companion) {
          continue
        }
        const config = configured[field.key]
        expect(config?.control, field.key).toBe('readonly')
        expect(config?.label, field.key).toBeTruthy()
      }
    }
  })

  it('gives every entry a non-empty label and an allowed group', () => {
    for (const entity of entities) {
      const configured = catalogConfig(entity.type as CatalogEntityType)
      for (const field of entity.fields) {
        const config = configured[field.key]
        expect(config?.label, field.key).toBeTruthy()
        expect(typeof config?.label, field.key).toBe('string')
        expect(GROUPS.has(config?.group ?? ''), field.key).toBe(true)
      }
    }
  })

  it('returns an empty map for an unknown entity type and does not throw', () => {
    expect(() =>
      catalogConfig('catalog.unknown' as CatalogEntityType)
    ).not.toThrow()
    expect(catalogConfig('catalog.unknown' as CatalogEntityType)).toEqual({})
  })
})
