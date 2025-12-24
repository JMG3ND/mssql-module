import mssql from 'mssql'

declare global {
  var mssqlPool: mssql.ConnectionPool | undefined
}

const initMssqlPool = async (config: mssql.config): Promise<mssql.ConnectionPool> => {
  if (!globalThis.mssqlPool) {
    globalThis.mssqlPool = await new mssql.ConnectionPool({ ...config }).connect()
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
