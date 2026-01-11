// Este archivo se usa solo en builds de producción (GitHub Actions)
// Las variables se reemplazarán en tiempo de build mediante el script
export const environment = {
  production: true,
  supabaseUrl: '__SUPABASE_URL__',
  supabaseKey: '__SUPABASE_KEY__',
};
