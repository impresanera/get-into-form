import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirstUser } from "../api/forms";

export function Home() {
  const [isFirstUser, setIsFirstUser] = useState<boolean>();
  const navigate = useNavigate();

  console.log({ isFirstUser });

  useEffect(() => {
    const firstUserReq = async () => {
      const result = await getFirstUser();

      if (!result.error) {
        setIsFirstUser(result.ok);

        if (isFirstUser === true) {
          return navigate("/register");
        } else if (isFirstUser === false) {
          return navigate("/login");
        } else {
          return void 0;
        }
      }
    };

    firstUserReq();
  }, [isFirstUser]);

  return <div className="App">Home</div>;
}
