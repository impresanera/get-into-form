import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, Routes } from "react-router-dom";
import { Result } from "..";
import { config } from "../config";

function afterCheck(isFirstUser?: boolean) {}

const getFirstUser = async (): Promise<Result<boolean>> => {
  try {
    const res = await axios.get(`${config.VITE_FUNCTION_BASE_URL}/firstUser`);
    return { ok: res.data };
  } catch (error) {
    return { error };
  }
};

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
