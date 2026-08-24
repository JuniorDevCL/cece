# Excelsior — Preparación Física

MVP del club Excelsior con Next.js, Auth.js, Vercel Postgres (Neon) y despliegue en Vercel.

## Stack

- **Next.js 16** (App Router)
- **Auth.js** (`next-auth`) — login por email/contraseña
- **Vercel Postgres / Neon** — datos persistentes
- **Drizzle ORM**

## Configuración local

1. Copia `.env.example` a `.env.local` y completa:

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="genera-un-secreto-largo"
AUTH_URL="http://localhost:3000"
```

> Vercel + Neon crea `DATABASE_URL` automáticamente al conectar Storage. La app la usa directamente.

2. Instala dependencias:

```bash
npm install --legacy-peer-deps
```

3. Crea tablas y datos demo:

```bash
npm run db:seed
```

4. Inicia la app:

```bash
npm run dev
```

## Cuentas demo (tras seed)

| Rol | Email | Contraseña |
|-----|-------|------------|
| Preparador | `carlos.pf@cece.club` | `excelsior2026` |
| Deportista | `lucia.vargas@cece.club` | `excelsior2026` |
| Deportista | `diego.rivas@cece.club` | `excelsior2026` |
| Deportista | `sofia.torres@cece.club` | `excelsior2026` |

## Despliegue en Vercel (100% online)

1. Conecta el repo `JuniorDevCL/cece`
2. En **Storage → Postgres**, conecta Neon (crea `DATABASE_URL` automáticamente)
3. En **Settings → Environment Variables** (Production + Preview):
   - `DATABASE_URL` — automática al conectar Neon
   - `AUTH_SECRET` — secreto largo y aleatorio
   - `AUTH_URL` = `https://tu-dominio.vercel.app`
4. **Redeploy** del último commit en `master`

En cada deploy, Vercel ejecuta el seed automáticamente **solo si la base está vacía** (crea tablas + usuarios demo).

Si necesitas forzar la inicialización manualmente (sin usar tu PC), abre en el navegador:

```
https://tu-dominio.vercel.app/api/setup?secret=TU_AUTH_SECRET
```

Para restaurar datos demo desde cero (borra lo existente):

```
https://tu-dominio.vercel.app/api/setup?secret=TU_AUTH_SECRET&force=1
```

## Funcionalidades

- Login real por usuario (PF y deportistas)
- Planificación por categoría, rutinas de 3 días, ejercicios con YouTube
- Progreso de ejercicios guardado por deportista en la nube
- **Marcar presente** en días de pesas (L/M/V)
- Panel PF de asistencia por categoría y fecha
- Crear nuevas cuentas de deportistas desde `/pf/deportistas`
