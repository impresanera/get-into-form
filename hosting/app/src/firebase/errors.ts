export const firebaseAuthErrorMsg = (code: string) => {
  return code.replace(/(\-)|(auth\/)/g, " ").trim();
};
