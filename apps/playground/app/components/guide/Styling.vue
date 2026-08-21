<script setup lang="ts">
const nuxtCss = `/* app/assets/css/main.css — paths are relative to THIS file */
@import 'tailwindcss';
@import '@kungal/ui-tokens';
@import '@kungal/ui-vue/style.css';

@source '../../../node_modules/@kungal/ui-vue';
@source '../../../node_modules/@nextmoe/edit-ui-vue/dist';`

const viteCss = `/* src/style.css — one directory below node_modules */
@import 'tailwindcss';
@import '@kungal/ui-tokens';
@import '@kungal/ui-vue/style.css';

@source '../node_modules/@kungal/ui-vue';
@source '../node_modules/@nextmoe/edit-ui-vue/dist';`
</script>

<template>
  <SiteSection
    id="tailwind"
    title="The Tailwind v4 @source line"
    description="The single step that costs people an afternoon."
  >
    <KunInfo
      color="danger"
      variant="flat"
      icon="lucide:triangle-alert"
      title="Miss this and the UI degrades with no error at all"
      description="These packages ship no CSS. Every class in them is a KunUI utility, and Tailwind v4 only emits the utilities it finds in the files it scans — node_modules is not scanned by default. Without the @source line below, the classes the components use are simply never generated: no build error, no console warning, just a form with collapsed spacing, no borders and no colour."
    />

    <div class="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <SiteCodeBlock :code="nuxtCss" label="nuxt" />
      <SiteCodeBlock :code="viteCss" label="vue + vite" />
    </div>

    <ul class="text-default-500 list-disc space-y-2 pl-5 text-sm">
      <li>
        <span class="text-default-700 font-medium"
          >Point at <code>/dist</code>, not at the package root</span
        >: <code>dist</code> is the only directory the package publishes, and
        narrowing the scan keeps the emitted CSS to the classes really used.
      </li>
      <li>
        <span class="text-default-700 font-medium">Relative to the CSS file</span>,
        not to the project root. A Nuxt entry at
        <code>app/assets/css/main.css</code> needs three
        <code>../</code> to reach <code>node_modules</code>; a Vite entry at
        <code>src/style.css</code> needs one.
      </li>
      <li>
        <span class="text-default-700 font-medium">Both directories are usually
        git-ignored</span> and Tailwind scans them anyway — an explicit
        <code>@source</code> is not subject to the automatic content-detection
        rules. If your classes are still missing, check the path itself first.
      </li>
      <li>
        <span class="text-default-700 font-medium">KunUI needs the same
        treatment</span> — the second <code>@source</code> line above is not
        optional either, and <code>@kungal/ui-tokens</code> is what defines the
        palette these classes resolve against.
      </li>
      <li>
        <span class="text-default-700 font-medium">Dark mode</span> is a
        <code>.kun-dark-mode</code> class on <code>&lt;html&gt;</code> — KunUI's
        own switch. The components never write a <code>dark:</code> prefix; they
        use semantic tokens that already flip.
      </li>
    </ul>
  </SiteSection>
</template>
