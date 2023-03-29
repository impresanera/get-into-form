import { useNavigate } from "react-router-dom";
import { emailPasswordLogin } from "../firebase/firebase";
import { toast } from "react-hot-toast";
import { firebaseAuthErrorMsg } from "../firebase/errors";

export function Login() {
  const navigate = useNavigate();
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault();
    const fm = new FormData(event.currentTarget);
    type LoginType = {
      email: string;
      password: string;
    };
    const values = Object.fromEntries<string>(
      fm.entries() as IterableIterator<[string, string]>
    ) as LoginType;
    const result = await emailPasswordLogin(values.email, values.password);

    if (result.ok) {
      navigate("/dashboard");
    } else {
      console.log(result);
      const errMsg = firebaseAuthErrorMsg(result.error.code);
      toast(errMsg || "Something went wrong");
    }
  };
  return (
    <div>
      <div>Login!</div>
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="email" />
        <input type="password" placeholder="password" name="password" />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
