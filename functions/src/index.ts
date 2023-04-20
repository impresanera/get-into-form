import "source-map-support/register";
import { forms, formAutomation } from "./forms";
import { getIsFirstUser, newUserSignUp } from "./auth";
import { runInEnv } from "./config";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const api_prd = {
  forms: runInEnv("prd", forms),
  firstUser: runInEnv("prd", getIsFirstUser),
  newUserSignUp: runInEnv("prd", newUserSignUp),
  formAutomation: runInEnv("prd", formAutomation),
};
export const api_stg = {
  forms: runInEnv("stg", forms),
  firstUser: runInEnv("stg", getIsFirstUser),
  newUserSignUp: runInEnv("stg", newUserSignUp),
  formAutomation: runInEnv("stg", formAutomation),
};
export const api_dev = {
  forms: runInEnv("dev", forms),
  firstUser: runInEnv("dev", getIsFirstUser),
  newUserSignUp: runInEnv("dev", newUserSignUp),
  formAutomation: runInEnv("dev", formAutomation),
};
export const api_uat = {
  forms: runInEnv("uat", forms),
  firstUser: runInEnv("uat", getIsFirstUser),
  newUserSignUp: runInEnv("uat", newUserSignUp),
  formAutomation: runInEnv("uat", formAutomation),
};
