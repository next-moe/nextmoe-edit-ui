<template>
  <div class="bg-background text-foreground flex min-h-dvh flex-col">
    <NuxtLoadingIndicator color="var(--color-primary)" />
    <SiteHeader />

    <div
      class="mx-auto flex w-full max-w-[88rem] flex-1 gap-10 px-4 sm:px-6"
    >
      <aside
        class="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-56 shrink-0 overflow-y-auto py-8 lg:block"
      >
        <SiteSidebarNav />
      </aside>

      <main data-docs-content class="min-w-0 flex-1 space-y-10 py-8">
        <slot />
        <SitePager />
      </main>

      <aside
        class="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-52 shrink-0 overflow-y-auto py-8 xl:block"
      >
        <SiteToc />
      </aside>
    </div>

    <SiteFooter />
    <KunMessageProvider />
  </div>
</template>
