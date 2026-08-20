import { addComponent, defineNuxtModule } from '@nuxt/kit'
import { EDIT_UI_COMPONENT_NAMES } from '@nextmoe/edit-ui-vue'

export interface EditUiModuleOptions {
  /**
   * Prefix applied to every registered component tag. `SchemaForm` becomes
   * `<EditSchemaForm>` by default; a site migrating off a local copy can set
   * its own prefix and keep every template untouched.
   */
  prefix?: string
  /** Register the components globally (Nuxt's default) instead of lazily. */
  global?: boolean
}

export default defineNuxtModule<EditUiModuleOptions>({
  meta: {
    name: '@nextmoe/edit-ui-nuxt',
    configKey: 'editUi',
    compatibility: { nuxt: '>=4.0.0' }
  },
  defaults: {
    prefix: 'Edit',
    global: false
  },
  setup(options) {
    // The component list is not duplicated here: it is the
    // EDIT_UI_COMPONENT_NAMES single source from @nextmoe/edit-ui-vue, so a new
    // component registers itself with no change in this module.
    for (const name of EDIT_UI_COMPONENT_NAMES) {
      addComponent({
        name: `${options.prefix ?? ''}${name}`,
        export: name,
        filePath: '@nextmoe/edit-ui-vue',
        global: options.global
      })
    }
  }
})
