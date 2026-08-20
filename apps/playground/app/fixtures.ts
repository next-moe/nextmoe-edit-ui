import type {
  EditControl,
  EditProposal,
  EditRevision,
  EditSchemaField,
  EditSelectOption,
  EditUser
} from '@nextmoe/edit-ui-core'
import type { EditFieldConfigMap } from '@nextmoe/edit-ui-vue'

const swatch = (hash: string, hue: number) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="hsl(${hue} 60% 70%)"/><text x="160" y="98" font-size="28" text-anchor="middle" fill="#222">${hash}</text></svg>`
  )}`

const hashHue = (hash: string) =>
  [...hash].reduce((acc, c) => (acc + c.charCodeAt(0) * 7) % 360, 0)

export const resolveImage = (value: unknown): string => {
  const hash =
    typeof value === 'string'
      ? value
      : String((value as { image_hash?: string } | null)?.image_hash ?? '')
  return hash ? swatch(hash, hashHue(hash)) : ''
}

const ENTITIES: EditSelectOption[] = [
  { value: 1, label: '古手梨花' },
  { value: 2, label: '竜宮レナ' },
  { value: 3, label: '前原圭一' },
  { value: 4, label: '園崎魅音' },
  { value: 5, label: '北条沙都子' }
]

export const searchEntities = async (
  keyword: string
): Promise<EditSelectOption[]> =>
  ENTITIES.filter((e) => e.label.includes(keyword))

export const resolveEntities = (
  ids: (string | number)[]
): EditSelectOption[] =>
  ids.flatMap((id) => ENTITIES.filter((e) => String(e.value) === String(id)))

export const uploadImage = async (file: File): Promise<unknown> => ({
  image_hash: file.name.replace(/\.[^.]+$/, '').slice(0, 8) || 'upload',
  sort_order: 0
})

const field = (
  key: string,
  kind: string,
  diff_hint = 'inline',
  extra: Partial<EditSchemaField> = {}
): EditSchemaField => ({
  key,
  kind,
  diff_hint,
  locked: false,
  can_propose: true,
  can_review: true,
  would_automerge: false,
  ...extra
})

export const fields: EditSchemaField[] = [
  field('title', 'text'),
  field('play_minutes', 'int'),
  field('intro', 'text', 'lines'),
  field('status', 'enum'),
  field('nsfw', 'bool'),
  field('release_date', 'date'),
  field('aliases', 'list', 'items'),
  field('tag_ids', 'list', 'items'),
  field('links', 'list', 'items'),
  field('staff_ids', 'list', 'items'),
  field('character_edges', 'list', 'items'),
  field('cover', 'imagehash', 'image'),
  field('gallery', 'list', 'image'),
  field('slug', 'text', 'inline', { can_propose: false }),
  field('holo_intensity', 'text')
]

export const config: EditFieldConfigMap = {
  title: {
    label: '标题',
    group: '基础',
    control: 'input',
    placeholder: '作品标题'
  },
  play_minutes: {
    label: '通关时长（分钟）',
    group: '基础',
    control: 'number',
    nullable: true
  },
  intro: {
    label: '简介',
    group: '基础',
    control: 'textarea',
    description: '支持多行；diff 以整段文本比较'
  },
  status: {
    label: '发行状态',
    group: '基础',
    control: 'select',
    options: [
      { value: 'released', label: '已发售' },
      { value: 'planned', label: '预定' },
      { value: 'cancelled', label: '中止' }
    ]
  },
  nsfw: {
    label: '成人向',
    group: '基础',
    control: 'switch',
    description: '打开表示含成人内容'
  },
  release_date: { label: '发售日', group: '基础', control: 'date' },
  aliases: {
    label: '别名',
    group: '基础',
    control: 'string-list',
    placeholder: '输入后回车添加'
  },
  tag_ids: { label: '标签 ID', group: '基础', control: 'number-list' },
  links: {
    label: '外部链接',
    group: '关系',
    control: 'object-list',
    columns: [
      { key: 'name', label: '名称', control: 'input', width: 'w-40' },
      { key: 'link', label: '地址', control: 'input' }
    ]
  },
  staff_ids: {
    label: '参与人物',
    group: '关系',
    control: 'entity-picker',
    multiple: true,
    searchEntities,
    resolveEntities
  },
  character_edges: {
    label: '角色关系',
    group: '关系',
    control: 'entity-kind-picker',
    entityIdKey: 'character_id',
    entityKinds: [
      { value: 1, label: '主角' },
      { value: 2, label: '配角' },
      { value: 3, label: '客串' }
    ],
    entityDefaultKind: 2,
    searchEntities,
    resolveEntities
  },
  cover: {
    label: '封面',
    group: '媒体',
    control: 'image',
    resolveImage,
    uploadImage
  },
  gallery: {
    label: '画廊',
    group: '媒体',
    control: 'image-list',
    resolveImage,
    uploadImage,
    formatItem: (v) => String((v as { image_hash: string }).image_hash),
    pinItemFlag: { key: 'is_cover', label: '封面' },
    contextNote: '这些截图来自上游源，编辑器只能调序与置顶',
    contextItems: (value) =>
      (Array.isArray(value) ? value : []).map((item) => ({
        label: String((item as { image_hash: string }).image_hash),
        image: resolveImage(item)
      }))
  },
  slug: {
    label: '固定链接',
    group: '媒体',
    control: 'readonly'
  },
  holo_intensity: {
    label: '全息强度',
    group: '前向兼容',
    // Not an EditControl this package knows — the engine may ship a new render
    // hint before the package catches up. Must degrade to read-only, not throw.
    control: 'holo-slider' as unknown as EditControl,
    description: '未知 control：包应降级为只读展示'
  }
}

export const groupOrder = ['基础', '媒体', '关系', '前向兼容']

export const values: Record<string, unknown> = {
  title: 'ひぐらしのなく頃に',
  play_minutes: 3200,
  intro: '雏见泽村，昭和五十八年六月。\n绵流之夜，连续怪死事件再度上演。',
  status: 'released',
  nsfw: false,
  release_date: '2002-08-10',
  aliases: ['寒蝉鸣泣之时', 'Higurashi'],
  tag_ids: [7, 12, 33],
  links: [{ name: '官方网站', link: 'https://07th-expansion.net' }],
  staff_ids: [1, 3],
  character_edges: [
    { character_id: 1, kind: 1 },
    { character_id: 2, kind: 2 }
  ],
  cover: 'cover01',
  gallery: [
    { image_hash: 'shot-a', sort_order: 0, is_cover: true },
    { image_hash: 'shot-b', sort_order: 1 },
    { image_hash: 'shot-c', sort_order: 2 }
  ],
  slug: 'higurashi-no-naku-koro-ni',
  holo_intensity: { level: 3, curve: 'ease-out' }
}

export const users: Record<number, EditUser> = {
  11: { id: 11, name: '鲲', avatar: '' },
  12: { id: 12, name: '梨花', avatar: '' }
}

export const proposals: EditProposal[] = [
  {
    id: 101,
    entity_type: 'work',
    entity_id: 1,
    base_revision_seq: 8,
    patch: { title: 'ひぐらしのなく頃に 礼', aliases: ['寒蝉鸣泣之时 礼'] },
    proposer_uid: 11,
    note: '补一个别名，顺便修标题的空格',
    site: 'playground',
    status: 'open',
    created_at: '2026-08-18T09:12:00Z',
    updated_at: '2026-08-18T09:12:00Z',
    amendments: [
      {
        id: 1,
        seq: 1,
        set: { aliases: ['寒蝉鸣泣之时 礼'] },
        amender_uid: 12,
        note: '审核时统一了空格',
        created_at: '2026-08-18T10:00:00Z'
      }
    ]
  },
  {
    id: 100,
    entity_type: 'work',
    entity_id: 1,
    base_revision_seq: 7,
    patch: { intro: '……' },
    proposer_uid: 12,
    note: '',
    site: 'playground',
    status: 'declined',
    decided_by_uid: 11,
    decided_at: '2026-08-17T12:00:00Z',
    decision_note: '简介需要原文出处，先补来源再提。',
    created_at: '2026-08-17T08:00:00Z',
    updated_at: '2026-08-17T12:00:00Z'
  }
]

export const revisions: EditRevision[] = [
  {
    id: 9,
    seq: 9,
    action: 'merged',
    changed_fields: ['title', 'aliases'],
    snapshot: {},
    actor_uid: 11,
    amender_uid: 12,
    proposal_id: 101,
    site: 'playground',
    created_at: '2026-08-18T10:05:00Z'
  },
  {
    id: 8,
    seq: 8,
    action: 'direct',
    changed_fields: ['gallery'],
    snapshot: {},
    actor_uid: 12,
    site: 'playground',
    created_at: '2026-08-15T04:00:00Z'
  },
  {
    id: 1,
    seq: 1,
    action: 'created',
    changed_fields: [],
    snapshot: {},
    actor_uid: 11,
    site: 'playground',
    created_at: '2026-06-01T00:00:00Z',
    legacy_action: 'import',
    legacy_note: '从旧 wiki 迁入',
    legacy_minor: true
  }
]

export const labelFor = (key: string) => config[key]?.label ?? key
