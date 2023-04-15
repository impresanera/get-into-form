/// <reference types="vite/client" />
interface ImportMetaEnv {
  VITE_ENV: "development" | "staging" | "production" | "testing";

  VITE_API_KEY: string;
  VITE_AUTH_DOMAIN: string;
  VITE_PROJECT_ID: string;
  VITE_STORAGE_BUCKET: string;
  VITE_MESSAGING_SENDER_ID: string;
  VITE_APP_ID: string;

  // dev env
  VITE_AUTH_EM_URL: string;
}
