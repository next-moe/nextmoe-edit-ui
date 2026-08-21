<script setup lang="ts">
const componentList = [
  ['SchemaForm', 'The whole form: groups → sections (stack or tabs), emits update:patch.'],
  ['SchemaField', 'One field; picks the control from the schema + config.'],
  ['ObjectListField', 'Repeating rows of typed columns.'],
  ['ImageField', 'Single or multi image upload, drag-sort, pin flag.'],
  ['EntityPicker', 'Search-and-pick entity references.'],
  ['EntityKindPicker', 'Entity references that also carry a kind.'],
  ['SourceContext', 'The read-only "this came from upstream" strip under a field.'],
  ['FieldDiff', "One field's before/after, routed by diff_hint."],
  ['TextDiff', 'Word-level text diff, long unchanged runs elided.'],
  ['ImageDiff', 'Only the pictures that changed, never the whole gallery.'],
  ['ProposalCard', 'One edit proposal.'],
  ['ReviewQueue', 'Proposals by status, with an item slot.'],
  ['RevisionTimeline', 'Revisions, two-way selection, emits diff(fromSeq, toSeq).'],
  ['Time', 'Minimal relative/absolute timestamp used by the two views above.']
]
</script>

<template>
  <SiteSection
    id="components"
    title="What is in the box"
    description="Fourteen exports from @nextmoe/edit-ui-vue. Under the Nuxt module each one gains the configured prefix."
  >
    <div class="border-default-200 overflow-x-auto rounded-lg border">
      <table class="w-full text-left text-xs">
        <tbody>
          <tr
            v-for="([name, what], index) in componentList"
            :key="name"
            :class="index ? 'border-default-200 border-t' : ''"
          >
            <td class="text-default-700 px-3 py-2 font-mono whitespace-nowrap">
              {{ name }}
            </td>
            <td class="text-default-500 px-3 py-2">{{ what }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
      <KunInfo
        color="success"
        variant="flat"
        icon="lucide:shield-check"
        title="Unknown controls degrade, never throw"
        description="Your edit engine may start sending a control (or a schema kind) that the installed package predates. SchemaField renders such a field as a read-only text/JSON display rather than throwing, or falling through to a text input that would invite an edit you cannot save. isEditControl() is the check; a spec pins the behaviour."
      />
      <KunInfo
        color="warning"
        variant="flat"
        icon="lucide:languages"
        title="Built-in strings are zh-CN today"
        description="A handful of strings live inside the components — 已修改 / 撤销 on a dirty field, the ReviewQueue status tabs, the relative times. There is no locale option yet. Everything else (field labels, group names, option labels) comes from the config you pass, so it is already in your language."
      />
    </div>
  </SiteSection>
</template>
