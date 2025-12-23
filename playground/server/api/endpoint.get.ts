export default defineEventHandler(async () => {
  const response = await executeSql<Array<{ number: number }>>(/* sql */`
    SELECT 1 AS number
  `)
  return response
})
