import { createBrowserRouter } from "react-router-dom";

// pages
import { Home } from "./pages/home";
import { Login } from "./pages/login";
import { Networks } from "./pages/networks";
import { Admin } from "./pages/admin";
import { Empresa } from "./pages/empresa";
import { Private } from "./routes/Private";
import { ErrorPage } from "./pages/error";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/admin",
    element: (
      <Private>
        <Admin />
      </Private>
    ),
  },
  {
    path: "/admin/social",
    element: (
      <Private>
        <Networks />
      </Private>
    ),
  },
  {
    path: "/admin/empresa",
    element: (
      <Private>
        <Empresa />
      </Private>
    ),
  },
  {
    path: "*",
    element: <ErrorPage />,
  },
]);

export { router };
