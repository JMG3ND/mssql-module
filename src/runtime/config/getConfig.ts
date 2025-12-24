import type { config } from 'mssql'

export const getConfig = (): config => {
  return {
    user: process.env.NUXT_MSSQL_USER || '',
    password: process.env.NUXT_MSSQL_PASSWORD || '',
    server: process.env.NUXT_MSSQL_SERVER || 'localhost',
    database: process.env.NUXT_MSSQL_DATABASE || '',
    port: process.env.NUXT_MSSQL_PORT ? Number.parseInt(process.env.NUXT_MSSQL_PORT) : 1433,
    options: {
      encrypt: process.env.NUXT_MSSQL_ENCRYPT === 'true',
      trustServerCertificate: process.env.NUXT_MSSQL_TRUST_CERTIFICATE === 'true',
    },
  }
}
