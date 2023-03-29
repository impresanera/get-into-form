// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseError } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import * as Auth from "firebase/auth";
import { Result } from "..";
import { appendEnv, config } from "../config";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBH3lZKDi4rDGftxnkWulAKejkvKz879nw",
  authDomain: "get-into-form.firebaseapp.com",
  projectId: "get-into-form",
  storageBucket: "get-into-form.appspot.com",
  messagingSenderId: "671261208280",
  appId: "1:671261208280:web:b34d2b37ba05f7928a31ad",
  measurementId: "G-NS9VPREQV2",
};

export function getFunctionUrl(): string {
  if (import.meta.env.VITE_ENV === "development") {
    return `http://127.0.0.1:5001/${
      firebaseConfig.projectId
    }/us-central1/${appendEnv("api")}-`;
  }

  return `https://us-central1-${
    firebaseConfig.projectId
  }.cloudfunctions.net/${appendEnv("api")}-`;
}

// Initialize Firebase
export const fireApp = initializeApp(firebaseConfig);
const auth = Auth.getAuth();

export const firebaseAuth = auth;

if (import.meta.env.VITE_ENV === "development") {
  Auth.connectAuthEmulator(auth, config.VITE_AUTH_EM_URL);
}

export const fireAnalytics = getAnalytics(fireApp);
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
    }

    return { ok: res.user };
  } catch (error: unknown) {
    if (error instanceof FirebaseError) {
      return {
        error: {
          code: error.code,
          message: error.message,
          meta: error,
        },
      };
    }

    return { error };
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
      ok: res.user,
    };
  } catch (error) {
    return { error: error as FirebaseError };
  }
}

export async function signOut(): Promise<Result<null, FirebaseError>> {
  try {
    const res = await Auth.signOut(auth);
    console.log({ res });
    return {
      ok: null,
    };
  } catch (error) {
    return { error: error as FirebaseError };
  }
}
