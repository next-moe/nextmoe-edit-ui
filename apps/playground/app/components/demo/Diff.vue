<script setup lang="ts">
import { resolveImage, values } from '~/fixtures'

const hints = [
  {
    hint: 'inline',
    note: '按词粒度的文本差异（走 Intl.Segmenter，中文按词而非按字切分）。'
  },
  { hint: 'lines', note: '同样的差异，保留空白，长段未改动内容自动折叠。' },
  { hint: 'items', note: '列表成员：新增 / 移除 / 保留。' },
  {
    hint: 'image',
    note: '只画变化的那几张图片，绝不铺开整个图库。'
  }
]
</script>

<template>
  <div class="space-y-3">
    <ul class="text-default-500 space-y-1.5 text-xs">
      <li
        v-for="item in hints"
        :key="item.hint"
        class="flex flex-wrap items-center gap-2"
      >
        <KunChip size="sm" variant="flat" color="default">
          diff_hint: {{ item.hint }}
        </KunChip>
        <span>{{ item.note }}</span>
      </li>
    </ul>

    <KunCard :is-transparent="false" content-class="space-y-4">
      <EditFieldDiff
        label="标题"
        diff-hint="inline"
        from="ひぐらしのなく頃に"
        to="ひぐらしのなく頃に 礼"
      />
      <EditFieldDiff
        label="简介"
        diff-hint="lines"
        :from="values.intro"
        to="雏见泽村，昭和五十八年六月。&#10;绵流之夜，连续怪死事件第四次上演。"
      />
      <EditFieldDiff
        label="别名"
        diff-hint="items"
        :from="['寒蝉鸣泣之时', 'Higurashi']"
        :to="['寒蝉鸣泣之时', '寒蝉鸣泣之时 礼']"
      />
      <EditFieldDiff
        label="画廊"
        diff-hint="image"
        :from="[{ image_hash: 'shot-a' }, { image_hash: 'shot-b' }]"
        :to="[{ image_hash: 'shot-a' }, { image_hash: 'shot-d' }]"
        :config="{
          label: '画廊',
          resolveImage,
          formatItem: (v) => String((v as { image_hash: string }).image_hash)
        }"
      />
    </KunCard>
  </div>
</template>
