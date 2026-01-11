# MovieSearch

Aplicacion Angular 21 que consume Supabase para listar y buscar peliculas, con interfaz construida en PrimeNG y rutas standalone.

## Stack

- Angular 21 (standalone + signals)
- PrimeNG con tema Aura
- Supabase (tabla `movies`)
- Vitest via `ng test`

## Configuracion rapida

1. `npm install`
2. Copia `src/environments/environment.template.ts` a `src/environments/environment.ts` y completa `supabaseUrl` y `supabaseKey` con tus credenciales.
3. En Supabase, crea la tabla `movies` con columnas sugeridas: `id` (int, pk), `title` (text), `overview` (text), `poster_url` (text), `release_year` (int), `genre` (text), `director` (text), `created_at` (timestamp).
4. `npm start` y abre http://localhost:4200/.

## Scripts disponibles

- `npm start`: servidor de desarrollo con recarga.
- `npm run build`: build de produccion en `dist/`.
- `npm test`: pruebas unitarias con Vitest.

## Funcionalidad

- Listado de peliculas desde Supabase.
- Busqueda por titulo y filtros por genero y anio.
- Tarjetas con PrimeNG, estados de carga y vacio.

## Notas

- Para builds de produccion se inyectan variables en `src/environments/environment.prod.ts` durante el proceso de CI/CD.
