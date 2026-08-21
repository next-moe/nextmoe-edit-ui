<script setup lang="ts">
import { EDIT_CONTROLS } from '@nextmoe/edit-ui-core'

const schemaField = `// What your API sends per field — @nextmoe/edit-ui-core
interface EditSchemaField {
  key: string
  kind: string          // text | int | enum | bool | date | imagehash | list | ref
  diff_hint: string     // inline | lines | items | image
  deprecated?: boolean
  locked: boolean
  can_propose: boolean
  can_review: boolean
  would_automerge: boolean
}`

const formProps = `<EditSchemaForm
  :fields="fields"
  :values="values"
  :config="config"
  :group-order="['Basics', 'Media']"
  :tabbed-groups="['Relations']"
  layout="tabs"
  :disabled="isReviewer"
  @update:patch="onPatch"
/>`

const formApi = [
  ['fields', 'EditSchemaField[]', 'Required. The schema your server sent.'],
  ['values', 'Record<string, unknown>', 'Required. The current server values, used as the diff baseline.'],
  ['config', 'EditFieldConfigMap', 'Required. Labels, controls, groups, injected functions.'],
  ['group-order', 'string[]', 'Section order. Groups you omit keep their natural order after it.'],
  ['tabbed-groups', 'string[]', 'These groups render their fields as inner tabs instead of stacking.'],
  ['layout', "'stack' | 'tabs'", "Defaults to 'stack'. 'tabs' puts the group list beside the fields."],
  ['disabled', 'boolean', 'Renders every control read-only — the review view of the same form.'],
  ['@update:patch', 'Record<string, unknown>', 'Emitted on every edit: the changed fields only, deep-compared against values. Locked, deprecated and un-proposable fields never appear.']
]

const injected = [
  {
    key: 'uploadImage',
    signature: '(file, currentItems) => Promise<item | null>',
    job: 'Upload one picture and return the item to store. Absent ⇒ the image field renders read-only.'
  },
  {
    key: 'resolveImage',
    signature: '(value) => string',
    job: 'Turn a stored image value (a hash, a row, a URL) into something an <img> can show.'
  },
  {
    key: 'searchEntities',
    signature: '(keyword) => Promise<EditSelectOption[]>',
    job: 'Search your catalogue for the entity pickers. Absent ⇒ the field does not render as a picker.'
  },
  {
    key: 'resolveEntities',
    signature: '(ids) => EditSelectOption[] | Promise<…>',
    job: 'Turn already-stored ids back into labels on first render.'
  }
]
</script>

<template>
  <SiteSection
    id="api"
    title="The two inputs: schema and config"
    description="The schema comes from your server and says what may be edited. The config is yours and says how it looks. Nothing in the packages knows about either your API or your images."
  >
    <div class="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <SiteCodeBlock :code="schemaField" label="from your API" />
      <SiteCodeBlock :code="formProps" label="SchemaForm" />
    </div>

    <div class="border-default-200 overflow-x-auto rounded-lg border">
      <table class="w-full text-left text-xs">
        <tbody>
          <tr
            v-for="([name, type, note], index) in formApi"
            :key="name"
            :class="index ? 'border-default-200 border-t' : ''"
          >
            <td class="text-default-700 px-3 py-2 font-mono whitespace-nowrap">
              {{ name }}
            </td>
            <td class="text-default-600 px-3 py-2 font-mono whitespace-nowrap">
              {{ type }}
            </td>
            <td class="text-default-500 px-3 py-2">{{ note }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="space-y-2">
      <h3 class="text-default-700 text-sm font-medium">
        Controls a field config may ask for
      </h3>
      <div class="flex flex-wrap gap-1.5">
        <KunChip
          v-for="control in EDIT_CONTROLS"
          :key="control"
          size="sm"
          variant="flat"
          color="default"
        >
          {{ control }}
        </KunChip>
      </div>
      <p class="text-default-500 text-xs">
        Omit <code>control</code> and it is derived from the schema's
        <code>kind</code> + <code>diff_hint</code> by
        <code>resolveControl()</code>.
      </p>
    </div>

    <div class="space-y-2">
      <h3 class="text-default-700 text-sm font-medium">
        Anything that touches a backend is a function you supply
      </h3>
      <div class="border-default-200 overflow-x-auto rounded-lg border">
        <table class="w-full text-left text-xs">
          <thead class="bg-content2 text-default-600">
            <tr>
              <th class="px-3 py-2 font-medium">EditFieldConfig key</th>
              <th class="px-3 py-2 font-medium">Signature</th>
              <th class="px-3 py-2 font-medium">Your job</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in injected"
              :key="row.key"
              class="border-default-200 border-t"
            >
              <td
                class="text-default-700 px-3 py-2 font-mono whitespace-nowrap"
              >
                {{ row.key }}
              </td>
              <td class="text-default-600 px-3 py-2 font-mono">
                {{ row.signature }}
              </td>
              <td class="text-default-500 px-3 py-2">{{ row.job }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="text-default-500 text-xs">
        There is no default, no fallback fetch and no built-in endpoint.
      </p>
    </div>
  </SiteSection>
</template>
