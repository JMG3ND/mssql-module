import { getMssqlPool } from '../config/mssql'

export const executeSql = async <T = unknown>(query: string, params?: Record<string, unknown>): Promise<T> => {
  const pool = getMssqlPool()
  const request = pool.request()

  if (params) {
    Object.keys(params).forEach((key) => {
      request.input(key, params[key])
    })
  }

  const result = await request.query(query)
  return result.recordset as T
}
