import { useNavigate } from "react-router-dom";
import { emailPasswordSignUp } from "../firebase/firebase";

export function Register() {
  const navigate = useNavigate();
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

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
    if (result.ok) {
      navigate("/dashboard");
    }
  };
  return (
    <div>
      Register
      <form method="POST" onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="email" required />
        <input type="text" name="name" placeholder="name" required />
        <input
          type="password"
          name="password"
          placeholder="password"
          required
        />
        <button type="submit">Signup</button>
      </form>
    </div>
  );
}
