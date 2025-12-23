import { defineNitroPlugin, useRuntimeConfig } from 'nitro/runtime'
import { initMssqlPool } from '../config/mssql'
import { consola } from 'consola'

export default defineNitroPlugin(async () => {
  const config = useRuntimeConfig()

  // Inicializa el pool al arrancar el servidor
  await initMssqlPool(config.mssql)
  consola.success('MSSQL connection pool initialized')
})
