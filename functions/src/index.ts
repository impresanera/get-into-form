import "source-map-support/register";
import { forms, formAutomation, hola } from "./forms";
import { getIsFirstUser, newUserSignUp } from "./auth";
import { runInEnv } from "./config";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const api_prd = {
  forms: runInEnv("prd", forms),
  hola: runInEnv("prd", hola),
  firstUser: runInEnv("prd", getIsFirstUser),
  newUserSignUp: runInEnv("prd", newUserSignUp),
  formAutomation: runInEnv("prd", formAutomation),
};
export const api_stg = {
  forms: runInEnv("stg", forms),
  hola: runInEnv("stg", hola),
  firstUser: runInEnv("stg", getIsFirstUser),
  newUserSignUp: runInEnv("stg", newUserSignUp),
  formAutomation: runInEnv("stg", formAutomation),
};
export const api_dev = {
  forms: runInEnv("dev", forms),
  hola: runInEnv("dev", hola),
  firstUser: runInEnv("dev", getIsFirstUser),
  newUserSignUp: runInEnv("dev", newUserSignUp),
  formAutomation: runInEnv("dev", formAutomation),
};
export const api_uat = {
  forms: runInEnv("uat", forms),
  hola: runInEnv("uat", hola),
  firstUser: runInEnv("uat", getIsFirstUser),
  newUserSignUp: runInEnv("uat", newUserSignUp),
  formAutomation: runInEnv("uat", formAutomation),
};
