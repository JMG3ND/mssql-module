import { describe, it, expect, beforeAll } from 'vitest'
import { executeSql } from '../src/runtime/core/executeSql'

describe('MSSQL Connection', () => {
  beforeAll(async () => {
    // Configurar variables de entorno para pruebas
    process.env.MSSQL_USER = 'Jose'
    process.env.MSSQL_PASSWORD = 'Jose*03052404'
    process.env.MSSQL_SERVER = 'SM1-NOA-1'
    process.env.MSSQL_DATABASE = 'SIMBASQL'
    process.env.MSSQL_PORT = '1433'
    process.env.MSSQL_ENCRYPT = 'false'
    process.env.MSSQL_TRUST_SERVER_CERTIFICATE = 'true'
  })

  it('debería conectarse a la base de datos', async () => {
    const result = await executeSql<Array<{ number: number }>>('SELECT 1 AS number')

    expect(result).toBeDefined()
    expect(result.length).toBeGreaterThan(0)
    expect(result[0]?.number).toBe(1)
  })

  it('debería ejecutar consultas con parámetros', async () => {
    const result = await executeSql<Array<{ value: number }>>(
      'SELECT @value AS value',
      { value: 42 },
    )

    expect(result[0]?.value).toBe(42)
  })
})
