<script setup lang="ts">
import { computed, ref } from 'vue'
import { catalogConfig } from '@nextmoe/edit-ui-catalog'
import { parseEditProblem } from '@nextmoe/edit-ui-vue'
import { workSchema, workValues, workVocabularies } from '~/catalogFixture'
import { resolveEntities, resolveImage, searchEntities, uploadImage } from '~/fixtures'

const config = catalogConfig('catalog.work', {
  searchEntities: {
    character: searchEntities,
    credit_name: searchEntities,
    engine: searchEntities,
    label: searchEntities,
    role: searchEntities,
    series: searchEntities,
    tag: searchEntities
  },
  resolveEntities: {
    character: resolveEntities,
    credit_name: resolveEntities,
    engine: resolveEntities,
    label: resolveEntities,
    role: resolveEntities,
    series: resolveEntities,
    tag: resolveEntities
  },
  uploadImage,
  resolveImage
})

const patch = ref<Record<string, unknown>>({})
const valid = ref(true)
const dirty = computed(() => Object.keys(patch.value).length > 0)

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

const sample = `import { mergeSchemaFaces } from '@nextmoe/edit-ui-core'
import { catalogConfig } from '@nextmoe/edit-ui-catalog'

// 编辑 API 有两张脸：actor-caps 面知道你能不能改，
// GET /v2/catalog/schemas/{object} 面知道值长什么样。合并后交给表单。
const fields = mergeSchemaFaces(capsFields, valueFields)

// config 不用手写：五十个字段的控件、词表、列类型与身份键都已经在预设里。
const config = catalogConfig('catalog.work', {
  searchEntities: { character, credit_name, label, role, engine, series, tag },
  uploadImage,
  resolveImage
})

// vocabularies 传 GET /v2/vocabularies 的结果：预设没覆盖的字段
// （比如引擎新增的）会用词表推导出选项，而不是降级为只读。`
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
        :fields="workSchema"
        :values="workValues"
        :config="config"
        :vocabularies="workVocabularies"
        :group-order="['名称', '基本', '描述', '关系', '媒体']"
        layout="tabs"
        :tabbed-groups="['关系']"
        :errors="problem.fields"
        :form-errors="problem.form"
        @update:patch="(value) => (patch = value)"
        @update:valid="(value) => (valid = value)"
      />

      <div class="border-default-200 flex items-center gap-3 border-t pt-3">
        <KunButton color="primary" :disabled="!valid || !dirty">
          提交修改
        </KunButton>
        <span v-if="!valid" class="text-danger-600 text-xs">
          有字段现在提交必被引擎拒绝，红点标出了是哪一组。
        </span>
      </div>
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
