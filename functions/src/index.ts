import "source-map-support/register";
import { forms } from "./forms";
import { getIsFirstUser, newUserSignUp } from "./auth";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const api_prd = { forms, firstUser: getIsFirstUser, newUserSignUp };
export const api_stg = { forms, firstUser: getIsFirstUser, newUserSignUp };
export const api_dev = { forms, firstUser: getIsFirstUser, newUserSignUp };
