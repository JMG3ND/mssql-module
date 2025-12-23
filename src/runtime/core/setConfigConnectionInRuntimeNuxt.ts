import { getConfig } from '../config'
import type { Nuxt } from 'nuxt/schema'

export function setConfigConnectionInRuntimeNuxt(nuxt: Nuxt) {
  nuxt.options.runtimeConfig.mssql = getConfig()
}
