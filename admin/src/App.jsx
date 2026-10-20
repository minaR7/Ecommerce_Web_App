import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider } from "antd";
import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
import SiteContent from "./pages/SiteContent";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { usersApi } from "./services/api";

const queryClient = new QueryClient();

const Protected = ({ children }) => {
  // Three states:
  //   'checking'   — waiting on usersApi.getMe()
  //   'ok'         — 200 response, is_admin=true → render children
  //   'denied'     — 200 response, but user is NOT admin → show Access Denied page
  //   'redirecting'— 401 (session invalid / expired). In this case our fetchApi
  //                  has already cleared the session and done window.location.replace
  //                  to /login. Do NOT fire any React Router Navigate here, because
  //                  stacking a 2nd navigation on top causes the Chrome
  //                  "Throttling navigation to prevent hanging" crash.
  const [state, setState] = useState('checking');
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await usersApi.getMe();
        if (!cancelled) setState(me?.is_admin ? 'ok' : 'denied');
      } catch (err) {
        // FetchApi already handled session-clearing + window.location.replace('/login')
        // for any 401. For network errors or any other failure, DON'T bounce the user
        // around; just render a single "Access denied" card with a manual Log in link.
        const msg = String(err?.message || '').toLowerCase();
        const wasSession = msg.includes('session') || msg.includes('unauthorized');
        if (!cancelled) setState(wasSession ? 'redirecting' : 'denied');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (state === 'checking' || state === 'redirecting') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        background: '#000',
        padding: 24,
      }}>
        {state === 'redirecting' ? 'Redirecting to login…' : 'Checking access…'}
      </div>
    );
  }
  if (state === 'denied') {
    // Explicitly static page — no React Router Navigate, no window.location writes.
    // This eliminates any possible redirect bounce.
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
        color: '#fff',
        padding: 24,
      }}>
        <div style={{
          background: '#111',
          border: '1px solid #1f1f1f',
          borderRadius: 8,
          padding: 32,
          maxWidth: 420,
          width: '100%',
          textAlign: 'center',
        }}>
          <h2 style={{ color: '#fff', margin: 0, marginBottom: 12, fontSize: 22 }}>
            Access Denied
          </h2>
          <p style={{ color: '#a1a1aa', margin: 0, marginBottom: 24 }}>
            You do not have permission to access the admin panel, or your session has expired.
          </p>
          <a
            href="/login"
            style={{
              display: 'inline-block',
              background: '#fff',
              color: '#000',
              padding: '10px 20px',
              borderRadius: 6,
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }
  return children;
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
            path="/pages/create"
            element={
              <Protected>
                <PageEditor />
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
          <Route
            path="/site-content"
            element={
              <Protected>
                <SiteContent />
              </Protected>
            }
          />
          {/* <Route path="/settings" element={<Settings />} /> */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
    </ConfigProvider>
  </QueryClientProvider>
);

export default App;
