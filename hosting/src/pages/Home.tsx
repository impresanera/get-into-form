import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirstUser } from "../api/forms";

export function Home() {
  const [isFirstUser, setIsFirstUser] = useState<boolean>();
  const [isLoadingFirstUser, setIsLoadingIsFirstUser] = useState<boolean>();
  const [error, setError] = useState<Error>();
  const navigate = useNavigate();

  useEffect(() => {
    const firstUserReq = async () => {
      setIsLoadingIsFirstUser(true);

      const result = await getFirstUser();

      if (result.ok) {
        setIsFirstUser(result.value);

        if (isFirstUser === true) {
          return navigate("/register");
        } else if (isFirstUser === false) {
          return navigate("/login");
        } else {
          return void 0;
        }
      } else {
        setError(result.error);
      }

      setIsLoadingIsFirstUser(false);
    };

    firstUserReq();
  }, [isFirstUser]);

  if (isLoadingFirstUser) {
    return <div className="App">Loading...</div>;
  } else {
    return (
      <div className="App">
        Home
        <div>{`${isLoadingFirstUser} ${isFirstUser}`}</div>
        <div>{error?.stack}</div>
      </div>
    );
  }
}
