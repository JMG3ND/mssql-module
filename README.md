# Módulo MSSQL para Nuxt

Un módulo de Nuxt para integración perfecta con bases de datos Microsoft SQL Server. Este módulo proporciona pooling automático de conexiones, soporte de configuración en tiempo de ejecución y utilidades de servidor fáciles de usar para trabajar con bases de datos MSSQL en tus aplicaciones Nuxt.

## Características

- 🔌 **Pooling Automático de Conexiones** - Administra un pool global de conexiones inicializado al arrancar el servidor
- ⚙️ **Configuración en Tiempo de Ejecución** - Usa el `runtimeConfig` de Nuxt para gestión segura de variables de entorno
- 🚀 **Auto-importaciones de Servidor** - Las utilidades de base de datos están disponibles automáticamente en tus rutas de servidor
- 🔒 **Tipado Seguro** - Soporte completo de TypeScript con definiciones de tipos adecuadas
- 🔄 **Auto-reconexión** - Gestiona el ciclo de vida de la conexión con limpieza apropiada al apagar
- 📦 **Configuración Cero** - Funciona de forma inmediata con valores predeterminados sensibles

## Configuración Rápida

1. Instala el módulo:

```bash
npm install mssql-module mssql
# o
pnpm add mssql-module mssql
# o
yarn add mssql-module mssql
```

2. Agrega `mssql-module` a la sección `modules` de `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['mssql-module']
})
```

3. Configura tus variables de entorno en `.env`:

```env
NUXT_MSSQL_USER=tu_usuario
NUXT_MSSQL_PASSWORD=tu_contraseña
NUXT_MSSQL_SERVER=localhost
NUXT_MSSQL_DATABASE=tu_base_de_datos
NUXT_MSSQL_PORT=1433
NUXT_MSSQL_ENCRYPT=true
NUXT_MSSQL_TRUST_CERTIFICATE=false
```

¡Eso es todo! El módulo inicializará automáticamente el pool de conexiones cuando tu servidor Nuxt se inicie.

## Uso

### En Rutas de Servidor

Usa la función auto-importada `getMssqlPool()` en tus rutas de servidor:

```typescript
// server/api/users.get.ts
export default defineEventHandler(async () => {
  const pool = getMssqlPool()
  
  const result = await pool.request()
    .query('SELECT * FROM users')
  
  return result.recordset
})
```

### Con Parámetros SQL

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

### Ejecutar Consultas Complejas

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

## Configuración

### Runtime Config

El módulo configura automáticamente la configuración en tiempo de ejecución. También puedes definirla explícitamente en `nuxt.config.ts`:

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

### Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `NUXT_MSSQL_USER` | Nombre de usuario de la base de datos | - |
| `NUXT_MSSQL_PASSWORD` | Contraseña de la base de datos | - |
| `NUXT_MSSQL_SERVER` | Nombre del servidor de la base de datos | `localhost` |
| `NUXT_MSSQL_DATABASE` | Nombre de la base de datos | - |
| `NUXT_MSSQL_PORT` | Puerto de la base de datos | `1433` |
| `NUXT_MSSQL_ENCRYPT` | Habilitar encriptación | `false` |
| `NUXT_MSSQL_TRUST_CERTIFICATE` | Confiar en el certificado del servidor | `false` |

## Uso Avanzado

### Usando Procedimientos Almacenados

```typescript
export default defineEventHandler(async () => {
  const pool = getMssqlPool()
  
  const result = await pool.request()
    .input('status', 'active')
    .execute('sp_GetUsersByStatus')
  
  return result.recordset
})
```

### Transacciones

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

## Referencia de API

### `getMssqlPool()`

Devuelve el pool de conexiones MSSQL inicializado.

**Devuelve:** `mssql.ConnectionPool`

**Lanza:** Error si el pool no ha sido inicializado (el plugin no se ha ejecutado)

```typescript
const pool = getMssqlPool()
```

### `initMssqlPool(config)`

Inicializa manualmente el pool de conexiones (generalmente manejado automáticamente por el plugin).

**Parámetros:**
- `config`: Objeto con configuración de MSSQL

**Devuelve:** `Promise<mssql.ConnectionPool>`

## Desarrollo

```bash
# Instalar dependencias
pnpm install

# Generar stubs de tipos
pnpm run dev:prepare

# Desarrollar con el playground
pnpm run dev

# Construir el módulo
pnpm run prepack

# Ejecutar pruebas
pnpm test

# Ejecutar lint
pnpm run lint
```

## Solución de Problemas

### Error de conexión no inicializada

Asegúrate de que:
1. El módulo está registrado correctamente en `nuxt.config.ts`
2. Las variables de entorno están configuradas correctamente
3. El servidor ha iniciado (el plugin se ejecuta al arrancar el servidor)

### Errores de TypeScript con `nitro/runtime`

Instala los tipos de Nitro:

```bash
npm install -D nitro
```

Y asegúrate de que tu `tsconfig.json` incluye:

```json
{
  "compilerOptions": {
    "types": ["nitro/types"]
  }
}
```

## Licencia

MIT License

## Contribuciones

¡Las contribuciones son bienvenidas! Por favor, no dudes en enviar un Pull Request.
