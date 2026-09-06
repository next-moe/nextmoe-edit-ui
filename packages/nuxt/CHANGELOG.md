# @nextmoe/edit-ui-nuxt

## 0.4.0

### Patch Changes

- Updated dependencies [0296fe2]
  - @nextmoe/edit-ui-core@0.4.0
  - @nextmoe/edit-ui-vue@0.4.0

## 0.3.0

### Patch Changes

- Updated dependencies [5e359b5]
- Updated dependencies [a00f6db]
- Updated dependencies [f04d871]
- Updated dependencies [827882f]
- Updated dependencies [215db8c]
- Updated dependencies [88c6d8c]
- Updated dependencies [923d2e2]
- Updated dependencies [a086d18]
- Updated dependencies [0af038f]
  - @nextmoe/edit-ui-vue@0.3.0
  - @nextmoe/edit-ui-core@0.3.0

## 0.2.0

### Minor Changes

- e3f8f7d: 把 `@kungal/ui-vue` 的 peer 范围从 `^2` 抬到 `^2.26.2`。

  `^2` 一直是虚的：这些组件直接渲染 KunDatePicker、KunTagInput、KunSelect 与
  KunAutocomplete，而其中两个 bug 在 2.26.2 之前会直接咬到下游，且都无法在这一层绕开。

  - **KunDatePicker 的 SSR hydration mismatch**（KunUI 2.25.0 修）。触发器当时是
    `<button>` 套 `<button>`，解析器会把清除按钮拎出去，服务端字符串与解析出的 DOM
    对不上；另外 `new Date('2026-06-14')` 按 UTC 解析再按本地时区格式化，UTC 以西的
    访客整整少一天。schema 里只要有一个 `date` 字段，整页就是
    "Hydration completed but contains mismatches"。此前只能在应用层用 `<ClientOnly>`
    包住整个表单——本仓库的 demo 就是这么绕的，这次一并拆掉了。
  - **输入法组合期的回车被抢走**（KunUI 2.26.2 修）。`EntityPicker` /
    `EntityKindPicker` 用的是 KunAutocomplete：拼音还没上屏时，用来确认候选词的那个
    回车会以 `isComposing: true` 的普通 keydown 送到组件，被当成「选中当前高亮项」。
    下游是中文站点，这是每天都会撞到的路径。

  组件代码没有任何改动，也没有用到 2.26 的新 API——这一版只是把一直存在的版本下限写进
  manifest。装着 2.24 的项目升级 KunUI 即可，`^2.26.2` 仍在 2.x 内。

### Patch Changes

- Updated dependencies [e3f8f7d]
  - @nextmoe/edit-ui-core@0.2.0
  - @nextmoe/edit-ui-vue@0.2.0

## 0.1.2

### Patch Changes

- ff7104f: Stop driving SchemaForm tab orientation from `useMediaQuery`. Tabs layout now renders two KunTab copies (horizontal + `md:hidden`, vertical + `hidden md:block`) so SSR and the client produce the same DOM.
- Updated dependencies [ff7104f]
  - @nextmoe/edit-ui-core@0.1.2
  - @nextmoe/edit-ui-vue@0.1.2

## 0.1.1

### Patch Changes

- 622d6a4: Update repository metadata after the GitHub org rename from sssmoe to next-moe.
- Updated dependencies [622d6a4]
  - @nextmoe/edit-ui-core@0.1.1
  - @nextmoe/edit-ui-vue@0.1.1
