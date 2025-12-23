import { describe, it, expect, beforeAll } from 'vitest'
import { initMssqlPool } from '../src/runtime/config'
import { executeSql } from '../src/runtime/core/executeSql'

describe('MSSQL Connection', () => {
  beforeAll(async () => {
    await initMssqlPool({
      user: process.env.MSSQL_USER || '',
      password: process.env.MSSQL_PASSWORD || '',
      server: process.env.MSSQL_SERVER || '',
      database: process.env.MSSQL_DATABASE || '',
      port: Number(process.env.MSSQL_PORT),
      encrypt: process.env.MSSQL_ENCRYPT === 'true',
      trustServerCertificate: process.env.MSSQL_TRUST_CERTIFICATE === 'true',
    })
  })

  it('debería conectarse a la base de datos', async () => {
    const result = await executeSql<Array<{ number: number }>>(/* sql */`
      SELECT 1 AS number
    `)

    expect(result).toBeDefined()
    expect(result.length).toBeGreaterThan(0)
    expect(result[0]?.number).toBe(1)
  })

  it('debería ejecutar consultas con parámetros', async () => {
    const result = await executeSql<Array<{ value: number }>>(/* sql */`
      SELECT @value AS value
    `, { value: 42 })

    expect(result[0]?.value).toBe(42)
  })
})
