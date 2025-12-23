# MSSQL Module for Nuxt

A Nuxt module for seamless integration with Microsoft SQL Server databases. This module provides automatic connection pooling, runtime configuration support, and easy-to-use server utilities for working with MSSQL databases in your Nuxt applications.

## Features

- 🔌 **Automatic Connection Pooling** - Manages a global connection pool initialized on server startup
- ⚙️ **Runtime Configuration** - Uses Nuxt's `runtimeConfig` for secure environment variable management
- 🚀 **Server Auto-imports** - Database utilities are automatically available in your server routes
- 🔒 **Type-safe** - Full TypeScript support with proper type definitions
- 🔄 **Auto-reconnection** - Handles connection lifecycle with proper cleanup on shutdown
- 📦 **Zero Configuration** - Works out of the box with sensible defaults

## Quick Setup

1. Install the module:

```bash
npm install mssql-module mssql
# or
pnpm add mssql-module mssql
# or
yarn add mssql-module mssql
```

2. Add `mssql-module` to the `modules` section of `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['mssql-module']
})
```

3. Configure your environment variables in `.env`:

```env
NUXT_MSSQL_USER=your_username
NUXT_MSSQL_PASSWORD=your_password
NUXT_MSSQL_SERVER=localhost
NUXT_MSSQL_DATABASE=your_database
NUXT_MSSQL_PORT=1433
NUXT_MSSQL_ENCRYPT=true
NUXT_MSSQL_TRUST_CERTIFICATE=false
```

That's it! The module will automatically initialize the connection pool when your Nuxt server starts.

## Usage

### In Server Routes

Use the auto-imported `getMssqlPool()` function in your server routes:

```typescript
// server/api/users.get.ts
export default defineEventHandler(async () => {
  const pool = getMssqlPool()
  
  const result = await pool.request()
    .query('SELECT * FROM users')
  
  return result.recordset
})
```

### With SQL Parameters

```typescript
// server/api/user/[id].get.ts
export default defineEventHandler(async (event) => {
  const pool = getMssqlPool()
  const id = getRouterParam(event, 'id')
  
  const result = await pool.request()
    .input('id', id)
    .query(/* sql */ `
      SELECT * FROM users 
      WHERE id = @id
    `)
  
  return result.recordset[0]
})
```

### Execute Complex Queries

```typescript
// server/api/orders.post.ts
export default defineEventHandler(async (event) => {
  const pool = getMssqlPool()
  const body = await readBody(event)
  
  const result = await pool.request()
    .input('userId', body.userId)
    .input('total', body.total)
    .query(/* sql */ `
      INSERT INTO orders (user_id, total, created_at)
      VALUES (@userId, @total, GETDATE())
      SELECT SCOPE_IDENTITY() AS orderId
    `)
  
  return { orderId: result.recordset[0].orderId }
})
```

## Configuration

### Runtime Config

The module automatically sets up runtime configuration. You can also define it explicitly in `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['mssql-module'],
  runtimeConfig: {
    mssql: {
      user: process.env.NUXT_MSSQL_USER,
      password: process.env.NUXT_MSSQL_PASSWORD,
      server: process.env.NUXT_MSSQL_SERVER || 'localhost',
      database: process.env.NUXT_MSSQL_DATABASE,
      port: parseInt(process.env.NUXT_MSSQL_PORT || '1433'),
      encrypt: process.env.NUXT_MSSQL_ENCRYPT === 'true',
      trustServerCertificate: process.env.NUXT_MSSQL_TRUST_CERTIFICATE === 'true'
    }
  }
})
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NUXT_MSSQL_USER` | Database username | - |
| `NUXT_MSSQL_PASSWORD` | Database password | - |
| `NUXT_MSSQL_SERVER` | Database server hostname | `localhost` |
| `NUXT_MSSQL_DATABASE` | Database name | - |
| `NUXT_MSSQL_PORT` | Database port | `1433` |
| `NUXT_MSSQL_ENCRYPT` | Enable encryption | `false` |
| `NUXT_MSSQL_TRUST_CERTIFICATE` | Trust server certificate | `false` |

## Advanced Usage

### Using Stored Procedures

```typescript
export default defineEventHandler(async () => {
  const pool = getMssqlPool()
  
  const result = await pool.request()
    .input('status', 'active')
    .execute('sp_GetUsersByStatus')
  
  return result.recordset
})
```

### Transactions

```typescript
export default defineEventHandler(async (event) => {
  const pool = getMssqlPool()
  const transaction = pool.transaction()
  
  try {
    await transaction.begin()
    
    await transaction.request()
      .input('userId', 1)
      .query('UPDATE accounts SET balance = balance - 100 WHERE user_id = @userId')
    
    await transaction.request()
      .input('userId', 2)
      .query('UPDATE accounts SET balance = balance + 100 WHERE user_id = @userId')
    
    await transaction.commit()
    return { success: true }
  } catch (error) {
    await transaction.rollback()
    throw error
  }
})
```

## API Reference

### `getMssqlPool()`

Returns the initialized MSSQL connection pool.

**Returns:** `mssql.ConnectionPool`

**Throws:** Error if the pool hasn't been initialized (plugin hasn't run)

```typescript
const pool = getMssqlPool()
```

### `initMssqlPool(config)`

Manually initialize the connection pool (usually handled automatically by the plugin).

**Parameters:**
- `config`: Object with MSSQL configuration

**Returns:** `Promise<mssql.ConnectionPool>`

## Development

```bash
# Install dependencies
pnpm install

# Generate type stubs
pnpm run dev:prepare

# Develop with the playground
pnpm run dev

# Build the module
pnpm run prepack

# Run tests
pnpm test

# Run lint
pnpm run lint
```

## Troubleshooting

### Connection not initialized error

Make sure:
1. The module is properly registered in `nuxt.config.ts`
2. Environment variables are correctly set
3. The server has started (the plugin runs on server startup)

### TypeScript errors with `nitro/runtime`

Install Nitro types:

```bash
npm install -D nitro
```

And ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "types": ["nitro/types"]
  }
}
```

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
