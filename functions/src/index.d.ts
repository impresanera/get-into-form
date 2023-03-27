declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: "development" | "staging" | "production" | "testing";
  }
}
