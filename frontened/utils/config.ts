const environment = process.env.NEXT_PUBLIC_ENVIRONMENT;

let apiUrl = process.env.NEXT_PUBLIC_API_URL_DEVELOPMENT;

if (environment === "production") {
  apiUrl = process.env.NEXT_PUBLIC_API_URL_PRODUCTION;
}

export const config = {
  environment,
  apiUrl,
};