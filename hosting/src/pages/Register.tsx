import { useNavigate } from "react-router-dom";
import { emailPasswordSignUp } from "../firebase/firebase";
import { useState } from "react";
import { BasicButton } from "../components/Buttons";

export function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setLoading(true);

    type RegType = {
      email: string;
      password: string;
      name: string;
    };

    const f = new FormData(e.currentTarget);
    const values = Object.fromEntries<string>(
      f.entries() as IterableIterator<[string, string]>
    ) as RegType;

    const { email, password, name } = values;

    const result = await emailPasswordSignUp(email, password, name);
    console.log(values, result);

    setLoading(false);

    if (result.ok) {
      navigate("/dashboard");
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

        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="name"
          >
            Name
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="name"
            name="name"
            type="text"
            required
            inputMode="text"
            placeholder="Full name"
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
          <BasicButton
            text="Create Account"
            loading={loading}
            type="submit"
            className="gap"
          />
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
