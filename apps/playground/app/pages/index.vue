<script setup lang="ts">
import { npmUrl, PACKAGES, REPO_URL } from '~/site'

const version = useRuntimeConfig().public.version

useSeoMeta({
  title: '@nextmoe/edit-ui — schema-driven edit components for Vue and Nuxt',
  description:
    'Live demo of @nextmoe/edit-ui: a form rendered from a server-sent field schema, its per-field controls, and the diff / proposal / revision views.'
})

const install = 'pnpm add @nextmoe/edit-ui-nuxt @nextmoe/edit-ui-vue @nextmoe/edit-ui-core'
</script>

<template>
  <div class="space-y-12">
    <section class="space-y-5">
      <div class="space-y-3">
        <h1 class="text-3xl font-bold sm:text-4xl">
          Schema-driven edit components
        </h1>
        <p class="text-default-500 max-w-2xl">
          One form rendered from the field schema your API sends, the per-field
          controls that go with it, and the diff / proposal / revision views for
          reviewing what someone changed. Composes
          <KunLink
            href="https://github.com/kungal/kun-ui"
            target="_blank"
            color="primary"
            underline="hover"
          >
            KunUI
          </KunLink>
          and ships no CSS of its own.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <KunButton href="/guide" color="primary" variant="solid">
          Integration guide
        </KunButton>
        <KunButton :href="REPO_URL" target="_blank" variant="flat" color="default">
          <KunIcon name="lucide:github" />
          GitHub
        </KunButton>
        <KunChip size="sm" variant="flat" color="success">
          v{{ version }} on npm
        </KunChip>
        <KunChip size="sm" variant="flat" color="default">AGPL-3.0-only</KunChip>
      </div>

      <SiteCodeBlock :code="install" label="install" />

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KunCard
          v-for="pkg in PACKAGES"
          :key="pkg.name"
          :is-transparent="false"
          :is-hoverable="true"
          padding="md"
          content-class="space-y-2"
        >
          <KunLink
            :href="npmUrl(pkg.name)"
            target="_blank"
            color="primary"
            underline="hover"
            size="sm"
          >
            <span class="font-mono text-xs break-all">{{ pkg.name }}</span>
          </KunLink>
          <p class="text-default-500 text-xs leading-relaxed">
            {{ pkg.summary }}
          </p>
        </KunCard>
      </div>

      <KunInfo
        color="info"
        variant="flat"
        icon="lucide:info"
        title="Everything below is live"
        description="The schema, the values and the injected functions (upload / search / resolve) are local fixtures, so this page never touches a network. The components' own built-in strings are zh-CN today; every field label you see comes from the site's config, not from the package."
      />
    </section>

    <SiteSection
      id="full"
      title="Full configuration"
      description="Every control the package ships, grouped into sections, in both layouts. The last field carries a control the package does not know — it degrades to a read-only display instead of throwing."
    >
      <DemoFull />
    </SiteSection>

    <SiteSection
      id="minimal"
      title="Minimal configuration"
      description="The same component with three fields and no groups. This is the smallest useful integration."
    >
      <DemoMinimal />
    </SiteSection>

    <SiteSection
      id="diff"
      title="Field diffs"
      description="FieldDiff routes one field's before/after by its diff_hint."
    >
      <DemoDiff />
    </SiteSection>

    <SiteSection
      id="review"
      title="Review and history"
      description="The proposal queue and the revision timeline — the read side of an edit workflow."
    >
      <DemoReview />
    </SiteSection>

    <KunCard :is-transparent="false" content-class="space-y-3">
      <h2 class="text-lg font-semibold">Wire it into your app</h2>
      <p class="text-default-500 text-sm">
        Two paths: a Nuxt module that auto-imports every component, or direct
        imports in any Vue 3 app. Both need one Tailwind
        <code>@source</code> line that is easy to miss.
      </p>
      <div>
        <KunButton href="/guide" color="primary" variant="flat">
          Read the integration guide
          <KunIcon name="lucide:arrow-right" />
        </KunButton>
      </div>
    </KunCard>
  </div>
</template>
