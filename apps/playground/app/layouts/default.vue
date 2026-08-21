<template>
  <div class="bg-background text-foreground flex min-h-dvh flex-col">
    <NuxtLoadingIndicator color="var(--color-primary)" />
    <SiteHeader />
    <main class="flex-1">
      <slot />
    </main>
    <SiteFooter />
    <KunMessageProvider />
  </div>
</template>
