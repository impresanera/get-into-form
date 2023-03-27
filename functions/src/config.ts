const env = {
  development: "dev",
  staging: "stg",
  production: "prd",
  testing: "uat", // user assertion test
} as const;

export const appendEnv = <T extends string>(
  str: T
): `${T}_${typeof env[typeof process.env.NODE_ENV]}` => {
  return `${str}_${env[process.env.NODE_ENV]}`;
};
