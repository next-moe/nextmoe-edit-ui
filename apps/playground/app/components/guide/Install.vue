<script setup lang="ts">
const nuxtInstall = `pnpm add @nextmoe/edit-ui-nuxt @nextmoe/edit-ui-vue @nextmoe/edit-ui-core
pnpm add @kungal/ui-nuxt @kungal/ui-tokens @kungal/ui-vue
pnpm add -D tailwindcss @tailwindcss/vite @iconify-json/lucide`

const vueInstall = `pnpm add @nextmoe/edit-ui-vue @nextmoe/edit-ui-core
pnpm add @kungal/ui-vue @kungal/ui-tokens
pnpm add @iconify/vue          # see "Icons" under Path A
pnpm add -D tailwindcss @tailwindcss/vite`

const peers = [
  {
    name: '@nextmoe/edit-ui-core',
    peers: 'none',
    note: 'Bundles diff ^9. No Vue anywhere in its dependency closure.'
  },
  {
    name: '@nextmoe/edit-ui-vue',
    peers: 'vue ^3.5.0 · @kungal/ui-vue ^2',
    note: 'Also pulls @vueuse/core, @vueuse/integrations and sortablejs as normal dependencies.'
  },
  {
    name: '@nextmoe/edit-ui-nuxt',
    peers: 'vue ^3.5.0 · nuxt ^4.0.0 · @kungal/ui-vue ^2',
    note: 'Ships raw TS loaded by Nuxt jiti — no build output.'
  }
]
</script>

<template>
  <SiteSection
    id="install"
    title="Install"
    description="Three packages, published public under AGPL-3.0-only. The Nuxt module depends on the Vue package, which depends on the core — installing all three explicitly keeps the versions visible in your manifest."
  >
    <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
      <SiteCodeBlock :code="nuxtInstall" label="nuxt app" />
      <SiteCodeBlock :code="vueInstall" label="vue + vite app" />
    </div>

    <div class="border-default-200 overflow-x-auto rounded-lg border">
      <table class="w-full text-left text-xs">
        <thead class="bg-content2 text-default-600">
          <tr>
            <th class="px-3 py-2 font-medium">Package</th>
            <th class="px-3 py-2 font-medium">Peer dependencies</th>
            <th class="px-3 py-2 font-medium">Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in peers"
            :key="row.name"
            class="border-default-200 border-t"
          >
            <td class="text-default-700 px-3 py-2 font-mono whitespace-nowrap">
              {{ row.name }}
            </td>
            <td class="text-default-600 px-3 py-2 font-mono">
              {{ row.peers }}
            </td>
            <td class="text-default-500 px-3 py-2">{{ row.note }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </SiteSection>
</template>
