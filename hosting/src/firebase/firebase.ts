import { initializeApp, FirebaseError } from "firebase/app";
import { Analytics, getAnalytics } from "firebase/analytics";
import * as Auth from "firebase/auth";
import { Result } from "..";
import { appendEnv, config } from "../config";

const firebaseConfig = {
  apiKey: "AIzaSyBQ-VvHbJbY1QKRnilK8cYclPB6dnHBGjo",
  authDomain: "impresaner-forms.firebaseapp.com",
  projectId: "impresaner-forms",
  storageBucket: "impresaner-forms.appspot.com",
  messagingSenderId: "824913390931",
  appId: "1:824913390931:web:6e7d5fe387b5a0755d05a6",
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
