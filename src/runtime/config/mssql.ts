import mssql from 'mssql'

declare global {
  var mssqlPool: mssql.ConnectionPool | undefined
}

interface MssqlConfig {
  user: string
  password: string
  server: string
  database: string
  port: number
  encrypt: boolean
  trustServerCertificate: boolean
}

const toMssqlConfig = (config: MssqlConfig): mssql.config => {
  return {
    user: config.user,
    password: config.password,
    server: config.server,
    database: config.database,
    port: config.port,
    options: {
      encrypt: config.encrypt,
      trustServerCertificate: config.trustServerCertificate,
    },
  }
}

const initMssqlPool = async (config: MssqlConfig): Promise<mssql.ConnectionPool> => {
  if (!globalThis.mssqlPool) {
    const mssqlConfig = toMssqlConfig(config)
    globalThis.mssqlPool = await new mssql.ConnectionPool(mssqlConfig).connect()
  }
  return globalThis.mssqlPool
}

// Exporta el pool directamente (será undefined hasta que se inicialice)
const getMssqlPool = (): mssql.ConnectionPool => {
  if (!globalThis.mssqlPool) {
    throw new Error('MSSQL pool not initialized. Make sure the Nitro plugin has run.')
  }
  return globalThis.mssqlPool
}

const closeMssqlPool = async (): Promise<void> => {
  if (globalThis.mssqlPool) {
    await globalThis.mssqlPool.close()
    globalThis.mssqlPool = undefined
  }
}

process.on('beforeExit', async () => {
  await closeMssqlPool()
})

process.on('SIGINT', async () => {
  await closeMssqlPool()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await closeMssqlPool()
  process.exit(0)
})

export { initMssqlPool, getMssqlPool }
