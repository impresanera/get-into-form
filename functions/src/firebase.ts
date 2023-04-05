import * as firebaseAdmin from "firebase-admin";
import * as functions from "firebase-functions";

firebaseAdmin.initializeApp();
export const db = firebaseAdmin.firestore();
export const logger = functions.logger;
export { functions, firebaseAdmin };
