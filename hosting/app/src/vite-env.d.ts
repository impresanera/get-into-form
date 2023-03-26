/// <reference types="vite/client" />
interface ImportMetaEnv {
  VITE_FUNCTION_BASE_URL: string;
  VITE_ENV: "development" | "staging" | "production";
  VITE_AUTH_EM_URL: string;
}
