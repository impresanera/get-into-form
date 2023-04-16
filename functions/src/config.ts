const env = {
  development: "dev",
  staging: "stg",
  production: "prd",
  testing: "uat", // user assertion test
} as const;

type ENV = typeof env;
type EnvKeys = ENV[keyof ENV];

export const appendEnv = <T extends string>(str: T): `${T}_${EnvKeys}` => {
  return `${str}_${env[process.env.NODE_ENV]}`;
};

export const runInEnv = <T>(envKey: EnvKeys, fn: T) => {
  if (envKey === env[process.env.NODE_ENV]) {
    return fn;
  } else {
    return () => "";
  }
};
