import { defineNuxtModule, createResolver, addServerImportsDir, addServerPlugin } from '@nuxt/kit'
import { setConfigConnectionInRuntimeNuxt } from './runtime/core'

export default defineNuxtModule({
  meta: {
    name: 'mssql-module',
    configKey: 'mssqlModule',
  },
  defaults: {},
  setup(_options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    setConfigConnectionInRuntimeNuxt(nuxt)

    addServerPlugin(resolve('./runtime/plugins/connectmssql'))
    addServerImportsDir(resolve('./runtime/core'))
  },
})
