# Excelsior — Preparación Física

MVP del club Excelsior con Next.js. Entrada por rol (Preparador / Deportista) sin cuentas de email.

## Stack

- **Next.js 16** (App Router)
- Datos en el navegador (`localStorage`)
- UI con shadcn / Tailwind

## Cómo empezar

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Serás redirigido a `/login`.

## Inicio de sesión

En la pantalla de inicio elige:

- **Preparador** — entra al panel de planificación, rutinas y ejercicios
- **Deportista** — elige tu categoría y entra a tu entrenamiento

No hace falta email ni contraseña.

## Rutas principales

| Ruta | Descripción |
|------|-------------|
| `/login` | Selección Preparador / Deportista |
| `/pf/dashboard` | Planificación del preparador |
| `/pf/rutinas` | Rutinas |
| `/pf/ejercicios` | Catálogo de ejercicios |
| `/atleta/dashboard` | Entrenamiento del deportista |
