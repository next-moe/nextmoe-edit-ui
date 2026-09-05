import { mergeSchemaFaces } from '@nextmoe/edit-ui-core'
import type {
  EditSchemaField,
  EditSchemaValueField,
  EditVocabularyMap
} from '@nextmoe/edit-ui-core'

const base = {
  locked: false,
  can_propose: true,
  can_review: true,
  would_automerge: false
}

// The real `catalog.work` schema, taken verbatim from the engine's field specs
// (packages/catalog/schema/inventory.json). Nothing here is invented: this is
// what GET /v2/catalog/schemas/work answers, minus the caps it under-reports.
export const workFields: EditSchemaField[] = [
  { key: 'catalog.work.display_name', kind: 'text', diff_hint: 'inline', ...base },
  { key: 'catalog.work.olang', kind: 'enum', diff_hint: 'inline', ...base },
  { key: 'catalog.work.content_rating', kind: 'enum', diff_hint: 'inline', ...base },
  { key: 'catalog.work.display_nsfw', kind: 'enum', diff_hint: 'inline', ...base },
  { key: 'catalog.work.titles', kind: 'list', diff_hint: 'items', max_elements: 100, max_suppressed: 200, ...base },
  { key: 'catalog.work.titles.suppressed', kind: 'list', diff_hint: 'items', max_elements: 200, max_suppressed: 200, ...base },
  { key: 'catalog.work.intros', kind: 'list', diff_hint: 'lines', max_elements: 200, ...base },
  { key: 'catalog.work.tag_ids', kind: 'list', diff_hint: 'items', max_elements: 200, ...base },
  { key: 'catalog.work.labels', kind: 'list', diff_hint: 'items', max_elements: 200, ...base },
  { key: 'catalog.work.engine_ids', kind: 'list', diff_hint: 'items', max_elements: 200, ...base },
  { key: 'catalog.work.series_ids', kind: 'list', diff_hint: 'items', max_elements: 200, ...base },
  { key: 'catalog.work.links', kind: 'list', diff_hint: 'items', max_elements: 200, ...base },
  { key: 'catalog.work.roster', kind: 'list', diff_hint: 'items', max_elements: 500, max_suppressed: 500, ...base },
  { key: 'catalog.work.roster.suppressed', kind: 'list', diff_hint: 'items', max_elements: 500, max_suppressed: 500, ...base },
  { key: 'catalog.work.credits', kind: 'list', diff_hint: 'items', max_elements: 500, max_suppressed: 500, ...base },
  { key: 'catalog.work.credits.suppressed', kind: 'list', diff_hint: 'items', max_elements: 500, max_suppressed: 500, ...base },
  { key: 'catalog.work.covers', kind: 'list', diff_hint: 'image', max_elements: 200, ...base },
  { key: 'catalog.work.screenshots', kind: 'list', diff_hint: 'image', max_elements: 200, ...base }
]

// The other face: GET /v2/catalog/schemas/work (spec 2.8.0), which knows the
// value shapes but no actor caps. Defaults (vocabulary "", base 0, nullable
// false, no element) are omitted here; the wire always sends them. `encoding`
// is the exception — it arrives exactly where a vocabulary does.
export const workValueFields: EditSchemaValueField[] = [
  { key: 'catalog.work.display_name', field_type: 'text' },
  {
    key: 'catalog.work.olang',
    field_type: 'enum',
    vocabulary: 'olang',
    encoding: 'token'
  },
  {
    key: 'catalog.work.content_rating',
    field_type: 'enum',
    vocabulary: 'content_rating',
    encoding: 'int'
  },
  { key: 'catalog.work.display_nsfw', field_type: 'enum' },
  {
    key: 'catalog.work.titles',
    field_type: 'list',
    element: {
      type: 'object',
      members: [
        { key: 'lang', type: 'enum', vocabulary: 'olang', nullable: true },
        { key: 'title', type: 'text' },
        { key: 'kind', type: 'int', vocabulary: 'title_kind' },
        { key: 'latin', type: 'text', nullable: true }
      ]
    }
  },
  { key: 'catalog.work.titles.suppressed', field_type: 'list', element: { type: 'text', members: [] } },
  {
    key: 'catalog.work.intros',
    field_type: 'list',
    element: {
      type: 'object',
      members: [
        { key: 'lang', type: 'enum', vocabulary: 'intro_lang' },
        { key: 'intro', type: 'text' }
      ]
    }
  },
  { key: 'catalog.work.tag_ids', field_type: 'list', element: { type: 'ref', members: [] } },
  {
    key: 'catalog.work.labels',
    field_type: 'list',
    element: {
      type: 'object',
      members: [
        { key: 'label_id', type: 'ref' },
        { key: 'kind', type: 'int', vocabulary: 'attribution_role' }
      ]
    }
  },
  { key: 'catalog.work.engine_ids', field_type: 'list', element: { type: 'ref', members: [] } },
  { key: 'catalog.work.series_ids', field_type: 'list', element: { type: 'ref', members: [] } },
  { key: 'catalog.work.links', field_type: 'list', element: { type: 'text', members: [] } },
  {
    key: 'catalog.work.roster',
    field_type: 'list',
    element: {
      type: 'object',
      members: [
        { key: 'character_id', type: 'ref' },
        { key: 'kind', type: 'int', vocabulary: 'roster_role' },
        { key: 'spoiler', type: 'int', vocabulary: 'spoiler' }
      ]
    }
  },
  { key: 'catalog.work.roster.suppressed', field_type: 'list', element: { type: 'text', members: [] } },
  {
    key: 'catalog.work.credits',
    field_type: 'list',
    element: {
      type: 'object',
      members: [
        { key: 'role_id', type: 'ref' },
        { key: 'credit_name_id', type: 'ref' },
        { key: 'character_id', type: 'ref', nullable: true },
        { key: 'note', type: 'text', nullable: true }
      ]
    }
  },
  { key: 'catalog.work.credits.suppressed', field_type: 'list', element: { type: 'text', members: [] } },
  {
    key: 'catalog.work.covers',
    field_type: 'list',
    element: {
      type: 'object',
      members: [
        { key: 'image_hash', type: 'imagehash' },
        { key: 'kind', type: 'text', nullable: true },
        { key: 'portrait_pinned', type: 'bool', nullable: true },
        { key: 'sexual', type: 'int', vocabulary: 'sexual', nullable: true },
        { key: 'violence', type: 'int', vocabulary: 'violence', nullable: true }
      ]
    }
  },
  {
    key: 'catalog.work.screenshots',
    field_type: 'list',
    element: {
      type: 'object',
      members: [
        { key: 'image_hash', type: 'imagehash' },
        { key: 'caption', type: 'text', nullable: true },
        { key: 'sexual', type: 'int', vocabulary: 'sexual', nullable: true },
        { key: 'violence', type: 'int', vocabulary: 'violence', nullable: true }
      ]
    }
  }
]

export const workSchema: EditSchemaField[] = mergeSchemaFaces(
  workFields,
  workValueFields
)

// A real site passes the whole GET /v2/vocabularies answer; one vocabulary is
// enough to show the wiring, and the preset's hand-written Chinese tables win
// over these published English labels anyway.
export const workVocabularies: EditVocabularyMap = {
  content_rating: {
    name: 'content_rating',
    closed: true,
    values: [
      { value: 'all_ages', display_name: 'All ages' },
      { value: 'sensitive', display_name: 'Sensitive' },
      { value: 'r18', display_name: 'R18' }
    ]
  }
}

export const workValues: Record<string, unknown> = {
  'catalog.work.display_name': 'ひぐらしのなく頃に',
  'catalog.work.olang': 'ja',
  'catalog.work.content_rating': 1,
  'catalog.work.display_nsfw': false,
  'catalog.work.titles': [
    { lang: 'ja', title: 'ひぐらしのなく頃に', latin: 'Higurashi no Naku Koro ni', kind: 0 },
    { lang: 'zh-Hans', title: '寒蝉鸣泣之时', kind: 1 },
    { lang: 'en', title: 'When They Cry', kind: 1 },
    { lang: '', title: 'Higu', kind: 2 }
  ],
  // The last title is hidden on this site: the importer owns the row and pushes
  // it back on every run, so the only way to drop it is the companion field.
  'catalog.work.titles.suppressed': ['title:2::Higu'],
  'catalog.work.intros': [
    { lang: 'zh-Hans', intro: '雏见泽村，昭和五十八年六月。' },
    { lang: 'ja', intro: '雛見沢村、昭和五十八年六月。' }
  ],
  'catalog.work.tag_ids': [12, 40],
  'catalog.work.labels': [{ label_id: 7, kind: 0 }],
  'catalog.work.engine_ids': [3],
  'catalog.work.series_ids': [],
  'catalog.work.links': ['https://07th-expansion.net/'],
  'catalog.work.roster': [
    { character_id: 1, kind: 1, spoiler: 0 },
    { character_id: 2, kind: 1, spoiler: 1 },
    { character_id: 5, kind: 2, spoiler: 0 }
  ],
  'catalog.work.roster.suppressed': [],
  'catalog.work.credits': [
    { role_id: 1, credit_name_id: 11, character_id: 0, note: '原作・脚本' },
    { role_id: 4, credit_name_id: 12, character_id: 1 }
  ],
  'catalog.work.credits.suppressed': [],
  'catalog.work.covers': [
    { image_hash: 'cover001', kind: 'main', portrait_pinned: true, sexual: 0, violence: 1 }
  ],
  'catalog.work.screenshots': [
    { image_hash: 'shot0001', caption: '雏见泽的夏天', sexual: 0, violence: 0 },
    { image_hash: 'shot0002', sexual: 0, violence: 2 }
  ]
}
