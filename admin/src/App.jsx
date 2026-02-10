import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider } from "antd";
import { antdDarkTheme } from "./config/antdTheme";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Users from "./pages/Users";
import Customers from "./pages/Customers";
// import Settings from "./pages/Settings";
import Categories from "./pages/Categories";
import Subcategories from "./pages/Subcategories";
import Coupons from "./pages/Coupons";
import Shipping from "./pages/Shipping";
import Pages from "./pages/Pages";
import PageEditor from "./pages/PageEditor";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";

const queryClient = new QueryClient();

const Protected = ({ children }) => {
  const raw = localStorage.getItem("user");
  try {
    const user = raw ? JSON.parse(raw) : null;
    if (user && user.is_admin) return children;
  } catch {}
  return <Navigate to="/login" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ConfigProvider theme={antdDarkTheme}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <Protected>
                <Dashboard />
              </Protected>
            }
          />
          <Route
            path="/categories"
            element={
              <Protected>
                <Categories />
              </Protected>
            }
          />
          <Route
            path="/subcategories"
            element={
              <Protected>
                <Subcategories />
              </Protected>
            }
          />
          <Route
            path="/products"
            element={
              <Protected>
                <Products />
              </Protected>
            }
          />
          <Route
            path="/orders"
            element={
              <Protected>
                <Orders />
              </Protected>
            }
          />
          <Route
            path="/users"
            element={
              <Protected>
                <Users />
              </Protected>
            }
          />
          <Route
            path="/customers"
            element={
              <Protected>
                <Customers />
              </Protected>
            }
          />
          <Route
            path="/coupons"
            element={
              <Protected>
                <Coupons />
              </Protected>
            }
          />
          <Route
            path="/shipping"
            element={
              <Protected>
                <Shipping />
              </Protected>
            }
          />
          <Route
            path="/pages"
            element={
              <Protected>
                <Pages />
              </Protected>
            }
          />
          <Route
            path="/pages/edit/:slug"
            element={
              <Protected>
                <PageEditor />
              </Protected>
            }
          />
          {/* <Route path="/settings" element={<Settings />} /> */}
          <Route path="*" element={<NotFound />} />
        </Routes>
    </ConfigProvider>
  </QueryClientProvider>
);

export default App;
