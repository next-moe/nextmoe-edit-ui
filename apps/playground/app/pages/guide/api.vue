<script setup lang="ts">
import { EDIT_CONTROLS } from '@nextmoe/edit-ui-core'

definePageMeta({ layout: 'docs' })

useSeoMeta({
  title: 'Schema 与 Config — @nextmoe/edit-ui',
  description:
    'EditSchemaForm 的两个输入：服务端下发的 schema 说明什么可以改，站点自备的 config 说明它长什么样。'
})

const schemaField = `// 你的接口按字段下发的内容 —— @nextmoe/edit-ui-core
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
  :group-order="['基础', '媒体']"
  :tabbed-groups="['关系']"
  layout="tabs"
  :disabled="isReviewer"
  @update:patch="onPatch"
/>`

const formApi = [
  ['fields', 'EditSchemaField[]', '必填。服务端下发的 schema。'],
  [
    'values',
    'Record<string, unknown>',
    '必填。服务端当前值，同时作为计算差异的基线。'
  ],
  [
    'config',
    'EditFieldConfigMap',
    '必填。标签、控件、分组，以及注入的函数。'
  ],
  [
    'group-order',
    'string[]',
    '分组顺序。没写进来的分组按自然顺序排在其后。'
  ],
  [
    'tabbed-groups',
    'string[]',
    '这些分组内部的字段渲染成二级标签页，而不是纵向堆叠。'
  ],
  [
    'layout',
    "'stack' | 'tabs'",
    "默认 'stack'。'tabs' 会把分组列表放到字段区域旁边。"
  ],
  [
    'disabled',
    'boolean',
    '把全部控件渲染为只读——同一个表单的审阅形态。'
  ],
  [
    '@update:patch',
    'Record<string, unknown>',
    '每次编辑都会触发：只包含与 values 深比较后确实不同的字段。锁定、已废弃与无提案权限的字段永远不会出现在里面。'
  ]
]

const injected = [
  [
    'uploadImage',
    '(file, currentItems) => Promise<item | null>',
    '上传一张图片，返回要存进值里的那个条目。没有提供时，图片字段渲染为只读。'
  ],
  [
    'resolveImage',
    '(value) => string',
    '把存下来的图片值（哈希、一行记录、URL）变成 <img> 能显示的地址。'
  ],
  [
    'searchEntities',
    '(keyword) => Promise<EditSelectOption[]>',
    '为实体选择器搜索你的条目库。没有提供时，该字段不会渲染成选择器。'
  ],
  [
    'resolveEntities',
    '(ids) => EditSelectOption[] | Promise<…>',
    '首屏时把已存下来的 id 还原成可读的名称。'
  ]
]
</script>

<template>
  <SitePageHeader
    eyebrow="参考"
    title="Schema 与 Config"
    lede="schema 来自你的服务端，决定什么可以改；config 归你自己，决定它长什么样。包里的任何一处都不知道你的接口和图床。"
  />

  <SiteSection
    id="inputs"
    title="两个输入"
    description="左边由服务端下发，右边由站点提供，两者用字段 key 对齐。"
  >
    <div class="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <SiteCodeBlock :code="schemaField" label="来自你的接口" />
      <SiteCodeBlock :code="formProps" label="SchemaForm" />
    </div>
  </SiteSection>

  <SiteSection
    id="props"
    title="SchemaForm 的属性与事件"
    description="表单本身不发请求，也不保存——它只告诉你哪些字段变了。"
  >
    <SiteTable :rows="formApi" :mono="[0, 1]" />
  </SiteSection>

  <SiteSection
    id="controls"
    title="可以指定的控件"
    description="config 里 control 的取值范围。"
  >
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
    <p class="text-default-500 text-sm leading-relaxed">不写 <code>control</code> 时，它由 schema 的 <code>kind</code> 与 <code>diff_hint</code> 经 <code>resolveControl()</code> 推导得出。写了不在上表中的值，字段会降级为只读展示，而不会抛错。</p>
  </SiteSection>

  <SiteSection
    id="injected"
    title="凡是要碰后端的，都是你注入的函数"
    description="这是包与站点之间唯一的边界。"
  >
    <SiteTable
      :head="['EditFieldConfig 键', '签名', '你要做的事']"
      :rows="injected"
      :mono="[0, 1]"
    />
    <p class="text-default-500 text-sm leading-relaxed">
      没有默认实现，没有兜底请求，也没有内置的 endpoint。
    </p>
  </SiteSection>
</template>
