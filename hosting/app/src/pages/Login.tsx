import { useNavigate } from "react-router-dom";
import { emailPasswordLogin } from "../firebase/firebase";
import { toast } from "react-hot-toast";
import { firebaseAuthErrorMsg } from "../firebase/errors";
import { BasicButton } from "../components/Buttons";
import { useState } from "react";

export function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault();
    setLoading(true);

    const fm = new FormData(event.currentTarget);
    type LoginType = {
      email: string;
      password: string;
    };

    const values = Object.fromEntries<string>(
      fm.entries() as IterableIterator<[string, string]>
    ) as LoginType;
    const result = await emailPasswordLogin(values.email, values.password);
    setLoading(false);

    if (result.ok) {
      navigate("/dashboard");
    } else {
      console.log(result);
      const errMsg = firebaseAuthErrorMsg(result.error.code);
      toast(errMsg || "Something went wrong");
    }
  };
  return (
    <div className="w-full h-screen grid place-content-center">
      <form
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
        onSubmit={handleSubmit}
      >
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="email"
          >
            Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            type="email"
            name="email"
            required
            inputMode="email"
            placeholder="Email"
          />
        </div>

        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <input
            className="shadow appearance-none rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            type="password"
            name="password"
            required
            placeholder="******************"
          />
          {/* <p className="text-red-500 text-xs italic">
            Please choose a password.
          </p> */}
        </div>
        <div className="flex items-center justify-between gap-3">
          <BasicButton loading={loading} type="submit" className="gap">
            Login
          </BasicButton>
          {/* <a
            className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
            href="#"
          >
            Forgot Password?
          </a> */}
        </div>
      </form>
      {/* <p className="text-center text-gray-500 text-xs">
        &copy;{new Date().getFullYear()}
      </p> */}
    </div>
  );
}
