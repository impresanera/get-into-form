/// <reference types="vite/client" />
interface ImportMetaEnv {
  VITE_ENV: "development" | "staging" | "production" | "testing";

  // dev env
  VITE_AUTH_EM_URL: string;
}
