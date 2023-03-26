import "source-map-support/register";
import { forms } from "./forms";
import { getIsFirstUser } from "./auth";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export { forms, getIsFirstUser as firstUser };
