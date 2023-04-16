import { initializeApp, FirebaseError } from "firebase/app";
import { Analytics, getAnalytics } from "firebase/analytics";
import * as Auth from "firebase/auth";
import { Result } from "..";
import { appendEnv, config } from "../config";

const firebaseConfig = {
  apiKey: config.VITE_API_KEY,
  authDomain: config.VITE_AUTH_DOMAIN,
  projectId: config.VITE_PROJECT_ID,
  storageBucket: config.VITE_STORAGE_BUCKET,
  messagingSenderId: config.VITE_MESSAGING_SENDER_ID,
  appId: config.VITE_APP_ID,
};

export function getFunctionUrl(): string {
  if (config.VITE_ENV === "development") {
    const { protocol, hostname } = new URL(import.meta.url);
    const localhost = `${protocol}//${hostname}:5001`;
    return `${localhost}/${firebaseConfig.projectId}/us-central1/${appendEnv(
      "api"
    )}-`;
  }

  return `https://us-central1-${
    firebaseConfig.projectId
  }.cloudfunctions.net/${appendEnv("api")}-`;
}

// Initialize Firebase
export const fireApp = initializeApp(firebaseConfig);
const auth = Auth.getAuth();

export const firebaseAuth = auth;

let fireAnalytics: Analytics;
if (config.VITE_ENV === "development") {
  Auth.connectAuthEmulator(auth, config.VITE_AUTH_EM_URL);
}

if (config.VITE_ENV === "production") {
  fireAnalytics = getAnalytics(fireApp);
}

Auth.setPersistence(auth, { type: "LOCAL" });

export async function emailPasswordSignUp(
  email: string,
  password: string,
  displayName?: string
): Promise<Result<Auth.User>> {
  try {
    const res = await Auth.createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    if (displayName) {
      await Auth.updateProfile(res.user, {
        displayName,
      });
      await res.user.reload();
    }

    return { ok: true, value: res.user };
  } catch (error: unknown) {
    if (error instanceof FirebaseError) {
      return {
        ok: false,
        error: {
          code: error.code,
          message: error.message,
          meta: error,
        },
      };
    }

    return { error, ok: false };
  }
}

export async function emailPasswordLogin(
  email: string,
  password: string
): Promise<Result<Auth.User, FirebaseError>> {
  try {
    const res = await Auth.signInWithEmailAndPassword(auth, email, password);
    console.log({ res });

    return {
      ok: true,
      value: res.user,
    };
  } catch (error) {
    return { error: error as FirebaseError, ok: false };
  }
}

export async function signOut(): Promise<Result<null, FirebaseError>> {
  try {
    const res = await Auth.signOut(auth);
    console.log({ res });
    return {
      ok: true,
      value: null,
    };
  } catch (error) {
    return { error: error as FirebaseError, ok: false };
  }
}

export { fireAnalytics };
