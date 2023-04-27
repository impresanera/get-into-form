import { PropsWithChildren, useEffect } from "react";
import { useNavigate, useRoutes } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { NotFound } from "./pages/NotFound";
import { Register } from "./pages/Register";
import { useCurrentUser } from "./firebase/User";
import { FormPage } from "./pages/Forms";
import { FormDataPage } from "./pages/FormsData";
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
      children: [
        {
          path: "/app/forms",
          element: (
            <ProtectedRoute>
              <FormPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "/app/forms/:id",
          element: (
            <ProtectedRoute>
              <FormDataPage />
            </ProtectedRoute>
          ),
        },
      ],
    },
    {
      path: "/dashboard",
      element: (
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      ), //<Redirect path="/app" />,
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

export const ProtectedRoute = ({ children }: PropsWithChildren) => {
  const [user, loading] = useCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user && !loading) {
      // user is not authenticated
      navigate("/login");
    }
  }, [user]);
  return <>{children}</>;
};
