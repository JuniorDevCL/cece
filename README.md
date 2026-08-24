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
POSTGRES_URL="postgresql://..."
AUTH_SECRET="genera-un-secreto-largo"
AUTH_URL="http://localhost:3000"
```

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

## Despliegue en Vercel

1. Conecta el repo `JuniorDevCL/cece`
2. En **Storage → Postgres**, crea una base Neon (Vercel Postgres)
3. En **Settings → Environment Variables**, agrega:
   - `POSTGRES_URL` (automática al conectar storage)
   - `AUTH_SECRET` (genera uno seguro)
   - `AUTH_URL` = `https://tu-dominio.vercel.app`
4. Redeploy
5. Ejecuta el seed una vez (local apuntando a la DB de producción o desde CLI):

```bash
npm run db:seed
```

## Funcionalidades

- Login real por usuario (PF y deportistas)
- Planificación por categoría, rutinas de 3 días, ejercicios con YouTube
- Progreso de ejercicios guardado por deportista en la nube
- **Marcar presente** en días de pesas (L/M/V)
- Panel PF de asistencia por categoría y fecha
- Crear nuevas cuentas de deportistas desde `/pf/deportistas`
