<script setup lang="ts">
import { computed, ref } from 'vue'
import { catalogConfig } from '@nextmoe/edit-ui-catalog'
import { parseEditProblem } from '@nextmoe/edit-ui-vue'
import { workFields, workValues } from '~/catalogFixture'
import { resolveEntities, resolveImage, searchEntities, uploadImage } from '~/fixtures'

const config = catalogConfig('catalog.work', {
  searchEntities: {
    character: searchEntities,
    credit_name: searchEntities,
    label: searchEntities,
    tag: searchEntities
  },
  resolveEntities: {
    character: resolveEntities,
    credit_name: resolveEntities,
    label: resolveEntities,
    tag: resolveEntities
  },
  uploadImage,
  resolveImage
})

const patch = ref<Record<string, unknown>>({})

// What the API answers when it refuses the patch. Both pointer shapes are real:
// a validation failure omits the /patch prefix, everything else carries it.
const rejection = {
  status: 422,
  code: 'VALIDATION_FAILED',
  detail: 'editing: field "catalog.work.titles": element 0: title must not be empty',
  errors: [
    {
      pointer: '/catalog.work.titles',
      reason: 'UNKNOWN_VALUE',
      detail: 'editing: field "catalog.work.titles": element 0: title must not be empty'
    },
    {
      pointer: '/patch/catalog.work.links',
      reason: 'INCONSISTENT_WITH',
      detail: 'another revision changed this key since the proposal was written'
    }
  ]
}

const rejected = ref(false)
const problem = computed(() =>
  rejected.value ? parseEditProblem(rejection) : { fields: {}, form: [] }
)

const sample = `import { catalogConfig } from '@nextmoe/edit-ui-catalog'

// fields 与 values 直接来自编辑 API。config 不用手写：
// 五十个字段的控件、词表、列类型与身份键都已经在预设里。
const config = catalogConfig('catalog.work', {
  searchEntities: { character, credit_name, label, tag },
  uploadImage,
  resolveImage
})`
</script>

<template>
  <div class="space-y-4">
    <SiteCodeBlock :code="sample" label="接线" />

    <KunSwitch
      v-model="rejected"
      size="sm"
      label="模拟一次被服务端拒绝的提交"
    />

    <KunCard :is-transparent="false" content-class="space-y-4">
      <EditSchemaForm
        :fields="workFields"
        :values="workValues"
        :config="config"
        :group-order="['名称', '基本', '描述', '关系', '媒体']"
        layout="tabs"
        :tabbed-groups="['关系']"
        :errors="problem.fields"
        :form-errors="problem.form"
        @update:patch="(value) => (patch = value)"
      />
    </KunCard>

    <div class="border-default-200 bg-content1 rounded-lg border p-3">
      <p class="text-default-500 mb-1 text-xs">
        <code>update:patch</code> —— 只包含真正改动过的字段，且已经是服务端要求的
        JSON 类型：整数列发整数，抑制集合按码位升序去重。
      </p>
      <pre
        class="text-default-700 max-h-64 overflow-auto font-mono text-xs"
      >{{ JSON.stringify(patch, null, 2) }}</pre>
    </div>
  </div>
</template>
