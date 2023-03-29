const env = import.meta.env;
export const config = env; // as const;
const envStruct = {
  development: "dev",
  staging: "stg",
  production: "prd",
  testing: "uat",
} as const;

export const appendEnv = <T extends string>(
  str: T
): `${T}_${typeof envStruct[typeof config.VITE_ENV]}` => {
  return `${str}_${envStruct[config.VITE_ENV]}`;
};
