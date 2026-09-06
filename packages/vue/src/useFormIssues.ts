import { computed, reactive, watch } from 'vue'
import type { EditSchemaField } from './types'

export const useFormIssues = (fields: () => EditSchemaField[]) => {
  const byField = reactive<Record<string, string[]>>({})

  const setFieldIssues = (key: string, issues: string[]) => {
    if (issues.length) {
      byField[key] = issues
    } else {
      Reflect.deleteProperty(byField, key)
    }
  }

  // A field that leaves the schema takes its messages with it. Otherwise the
  // form stays invalid over an issue with nothing left on screen to fix.
  watch(fields, (list) => {
    const live = new Set(list.map((f) => f.key))
    for (const key of Object.keys(byField)) {
      if (!live.has(key)) {
        Reflect.deleteProperty(byField, key)
      }
    }
  })

  return {
    setFieldIssues,
    hasIssues: (key: string) => key in byField,
    invalidFields: computed<Record<string, string[]>>(() => ({ ...byField })),
    valid: computed(() => Object.keys(byField).length === 0)
  }
}
