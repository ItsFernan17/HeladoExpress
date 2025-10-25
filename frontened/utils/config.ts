const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || 'development';

// Usar variables de entorno con fallback al puerto 3001 para NestJS
let apiUrl = process.env.NEXT_PUBLIC_API_URL_DEVELOPMENT || 'http://localhost:3001/api/v1';
let baseUrl = 'http://localhost:3001';

if (environment === "production") {
  apiUrl = process.env.NEXT_PUBLIC_API_URL_PRODUCTION || 'https://midominio.com/api/v1';
  baseUrl = 'https://midominio.com'; // Update this for production
}

export const config = {
  environment,
  apiUrl,
  baseUrl,
};