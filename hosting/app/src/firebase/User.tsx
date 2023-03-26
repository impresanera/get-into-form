import { useAuthState } from "react-firebase-hooks/auth";
import { firebaseAuth } from "./firebase";

export const useCurrentUser = () => {
  const [user, loading, error] = useAuthState(firebaseAuth);

  return [user] as const;
};
