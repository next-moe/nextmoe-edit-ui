import type { EditSelectOption } from '@nextmoe/edit-ui-core'

const option = (
  value: string | number,
  label: string
): EditSelectOption => ({ value, label })

const LANG_LABEL: Record<string, string> = {
  '': '未知',
  ar: '阿拉伯语',
  be: '白俄罗斯语',
  bg: '保加利亚语',
  ca: '加泰罗尼亚语',
  // Not a language: MapWikiOLang groups "ck" with "" and "others" and maps all
  // three to the default, so it is a legacy marker carried in from the wiki
  // import. Releases still accept it, which is why it is in the list at all.
  ck: '其他（历史值）',
  cs: '捷克语',
  da: '丹麦语',
  de: '德语',
  el: '希腊语',
  en: '英语',
  eo: '世界语',
  es: '西班牙语',
  et: '爱沙尼亚语',
  eu: '巴斯克语',
  fa: '波斯语',
  fi: '芬兰语',
  fr: '法语',
  ga: '爱尔兰语',
  gd: '苏格兰盖尔语',
  gl: '加利西亚语',
  he: '希伯来语',
  hi: '印地语',
  hr: '克罗地亚语',
  hu: '匈牙利语',
  id: '印度尼西亚语',
  it: '意大利语',
  iu: '因纽特语',
  ja: '日语',
  kk: '哈萨克语',
  ko: '韩语',
  la: '拉丁语',
  lt: '立陶宛语',
  lv: '拉脱维亚语',
  mk: '马其顿语',
  ms: '马来语',
  nl: '荷兰语',
  no: '挪威语',
  pl: '波兰语',
  'pt-br': '葡萄牙语（巴西）',
  'pt-pt': '葡萄牙语（葡萄牙）',
  ro: '罗马尼亚语',
  ru: '俄语',
  sk: '斯洛伐克语',
  sl: '斯洛文尼亚语',
  sr: '塞尔维亚语',
  sv: '瑞典语',
  ta: '泰米尔语',
  th: '泰语',
  tr: '土耳其语',
  uk: '乌克兰语',
  ur: '乌尔都语',
  vi: '越南语',
  zh: '中文',
  'zh-Hans': '简体中文',
  'zh-Hant': '繁体中文'
}

const langOptions = (codes: readonly string[]): EditSelectOption[] =>
  codes.map((code) => option(code, LANG_LABEL[code] ?? code))

const OLANG_CODES = [
  'ar', 'be', 'bg', 'ca', 'cs', 'da', 'de', 'el', 'en', 'eo',
  'es', 'fi', 'fr', 'ga', 'gd', 'he', 'hi', 'hr', 'hu', 'id',
  'it', 'iu', 'ja', 'ko', 'la', 'lt', 'lv', 'mk', 'ms', 'nl',
  'no', 'pl', 'pt-br', 'pt-pt', 'ro', 'ru', 'sk', 'sl', 'sr', 'sv',
  'ta', 'th', 'tr', 'uk', 'ur', 'vi', 'zh', 'zh-Hans', 'zh-Hant'
] as const

const RELEASE_LANG_CODES = [
  'ar', 'be', 'bg', 'ca', 'ck', 'cs', 'da', 'de', 'el', 'en',
  'eo', 'es', 'et', 'eu', 'fa', 'fi', 'fr', 'ga', 'gd', 'gl',
  'he', 'hi', 'hr', 'hu', 'id', 'it', 'iu', 'ja', 'kk', 'ko',
  'la', 'lt', 'lv', 'mk', 'ms', 'nl', 'no', 'pl', 'pt-br', 'pt-pt',
  'ro', 'ru', 'sk', 'sl', 'sr', 'sv', 'ta', 'th', 'tr', 'uk',
  'ur', 'vi', 'zh', 'zh-Hans', 'zh-Hant'
] as const

const PLATFORM_LABEL: Record<string, string> = {
  and: 'Android',
  bdp: 'Blu-ray Player',
  dos: 'DOS',
  drc: 'Dreamcast',
  dvd: 'DVD Player',
  fm7: 'FM-7',
  fmt: 'FM Towns',
  gba: 'Game Boy Advance',
  gbc: 'Game Boy Color',
  ios: 'iOS',
  lin: 'Linux',
  mac: 'macOS',
  mob: '功能机',
  msx: 'MSX',
  n3d: 'Nintendo 3DS',
  nds: 'Nintendo DS',
  nes: 'Famicom',
  oth: '其他',
  p88: 'PC-88',
  p98: 'PC-98',
  pce: 'PC Engine',
  pcf: 'PC-FX',
  ps1: 'PlayStation',
  ps2: 'PlayStation 2',
  ps3: 'PlayStation 3',
  ps4: 'PlayStation 4',
  ps5: 'PlayStation 5',
  psp: 'PlayStation Portable',
  psv: 'PlayStation Vita',
  sat: 'Sega Saturn',
  scd: 'Sega Mega-CD',
  sfc: 'Super Famicom',
  smd: 'Mega Drive',
  sw2: 'Nintendo Switch 2',
  swi: 'Nintendo Switch',
  tdo: '3DO',
  vnd: 'VNDS',
  web: '网页',
  wii: 'Wii',
  win: 'Windows',
  wiu: 'Wii U',
  x1s: 'Sharp X1',
  x68: 'Sharp X68000',
  xb1: 'Xbox',
  xb3: 'Xbox 360',
  xbo: 'Xbox One',
  xxs: 'Xbox Series X/S'
}

// The published vocabulary's order, wiu-before-win included. platform is
// token-coded, so no wire code is an index into this list and the order is
// presentational — but vocab.spec.ts asserts it against the census, so a
// private sort here fails the suite.
const PLATFORM_CODES = [
  'and', 'bdp', 'dos', 'drc', 'dvd', 'fm7', 'fmt', 'gba', 'gbc', 'ios',
  'lin', 'mac', 'mob', 'msx', 'n3d', 'nds', 'nes', 'oth', 'p88', 'p98',
  'pce', 'pcf', 'ps1', 'ps2', 'ps3', 'ps4', 'ps5', 'psp', 'psv', 'sat',
  'scd', 'sfc', 'smd', 'sw2', 'swi', 'tdo', 'vnd', 'web', 'wii', 'wiu',
  'win', 'x1s', 'x68', 'xb1', 'xb3', 'xbo', 'xxs'
] as const

export const OLANG_OPTIONS: EditSelectOption[] = langOptions(OLANG_CODES)

export const CHARACTER_LANG_OPTIONS: EditSelectOption[] = langOptions([
  '',
  ...OLANG_CODES
])

// Same code set as a character's language, different meaning for the empty
// string: on a title it is "this alias belongs to no language", which the engine
// accepts only for the alias kind — not "the language is unknown".
export const TITLE_LANG_OPTIONS: EditSelectOption[] = [
  option('', '不限定语言（仅别名）'),
  ...OLANG_OPTIONS
]

export const RELEASE_LANG_OPTIONS: EditSelectOption[] =
  langOptions(RELEASE_LANG_CODES)

export const INTRO_LANG_OPTIONS: EditSelectOption[] = langOptions([
  'en',
  'ja',
  'zh-Hans',
  'zh-Hant'
])

export const CONTENT_RATING_OPTIONS: EditSelectOption[] = [
  option(0, '全年龄'),
  option(1, '敏感'),
  option(2, 'R18')
]

export const GENDER_OPTIONS: EditSelectOption[] = [
  option(1, '男性'),
  option(2, '女性'),
  option(3, '其他')
]

export const BLOOD_TYPE_OPTIONS: EditSelectOption[] = [
  option(1, 'A 型'),
  option(2, 'B 型'),
  option(3, 'AB 型'),
  option(4, 'O 型')
]

export const TITLE_KIND_OPTIONS: EditSelectOption[] = [
  option(0, '官方'),
  option(1, '别名'),
  option(2, '简称')
]

export const ALIAS_KIND_OPTIONS: EditSelectOption[] = [
  option(0, '译名'),
  option(1, '拼写变体')
]

export const ROSTER_KIND_OPTIONS: EditSelectOption[] = [
  option(0, '未知'),
  option(1, '主角'),
  option(2, '配角'),
  option(3, '出场')
]

export const SPOILER_OPTIONS: EditSelectOption[] = [
  option(0, '无剧透'),
  option(1, '轻微剧透'),
  option(2, '严重剧透')
]

export const LABEL_KIND_OPTIONS: EditSelectOption[] = [
  option(0, '社团'),
  option(1, '发行商'),
  option(2, '开发商'),
  option(3, '品牌')
]

export const RELEASE_KIND_OPTIONS: EditSelectOption[] = [
  option(0, '默认'),
  option(1, '数字版'),
  option(2, '实体版'),
  option(3, '体验版'),
  option(4, '补丁')
]

export const RELEASE_PLATFORM_OPTIONS: EditSelectOption[] = PLATFORM_CODES.map(
  (code) => option(code, PLATFORM_LABEL[code] ?? code)
)

export const SEXUAL_OPTIONS: EditSelectOption[] = [
  option(0, '安全'),
  option(1, '性暗示'),
  option(2, '露骨')
]

export const VIOLENCE_OPTIONS: EditSelectOption[] = [
  option(0, '平和'),
  option(1, '暴力'),
  option(2, '血腥')
]
