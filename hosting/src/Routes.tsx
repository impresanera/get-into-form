import { useEffect } from "react";
import { Route, useNavigate, useRoutes } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { NotFound } from "./pages/NotFound";
import { Register } from "./pages/Register";
export const Routes = () =>
  useRoutes([
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/app",
      element: <Dashboard />,
    },

    {
      path: "/dashboard",
      element: <Redirect path="/app" />,
    },
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ]);

function Redirect({ path }: { path: string }) {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(path);
  }, []);

  return <></>;
}
