export const REPO_URL = 'https://github.com/next-moe/nextmoe-edit-ui'
export const ISSUES_URL = `${REPO_URL}/issues`
export const SOURCE_URL = `${REPO_URL}/tree/main/apps/playground`
export const KUN_UI_URL = 'https://github.com/kungal/kun-ui'

export const npmUrl = (name: string) => `https://www.npmjs.com/package/${name}`

export interface SitePackage {
  name: string
  summary: string
}

export const PACKAGES: SitePackage[] = [
  {
    name: '@nextmoe/edit-ui-core',
    summary:
      '框架无关的 TypeScript：schema 与协议类型，以及纯函数形式的 diff、格式化与徽标助手。依赖闭包里没有 Vue。'
  },
  {
    name: '@nextmoe/edit-ui-vue',
    summary:
      'Vue 3 组件层：编辑表单、逐字段控件，以及差异 / 提案 / 修订视图。自身不含任何 CSS。'
  },
  {
    name: '@nextmoe/edit-ui-nuxt',
    summary:
      'Nuxt 模块：按可配置前缀（默认 Edit）自动导入全部组件，模板里无需 import。'
  }
]

export interface DocsNavItem {
  to: string
  label: string
}

export interface DocsNavGroup {
  title: string
  items: DocsNavItem[]
}

export const DOCS_NAV: DocsNavGroup[] = [
  {
    title: '开始',
    items: [
      { to: '/guide/install', label: '安装' },
      { to: '/guide/nuxt', label: '在 Nuxt 中使用' },
      { to: '/guide/vue', label: '在 Vue 中使用' },
      { to: '/guide/styling', label: '样式与 Tailwind' }
    ]
  },
  {
    title: '参考',
    items: [
      { to: '/guide/api', label: 'Schema 与 Config' },
      { to: '/guide/components', label: '组件一览' }
    ]
  },
  {
    title: '在线演示',
    items: [
      { to: '/demo/form', label: '编辑表单' },
      { to: '/demo/diff', label: '字段差异' },
      { to: '/demo/review', label: '审核与历史' }
    ]
  }
]

export const DOCS_PAGES: DocsNavItem[] = DOCS_NAV.flatMap((group) => group.items)
