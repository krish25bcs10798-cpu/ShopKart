import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import httpClient from "../axiosCalls/axios";

export default function Login() {
  const [loginCredentialsForm, setLoginCredentialsForm] = useState({ email: "", password: "" });
  const [loginFaultMessage, setLoginFaultMessage] = useState("");
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const routerNavigator = useNavigate();
  const { setUser: setActiveCustomerUser } = useAuth();

  const handleInputChange = (e) => {
    setLoginCredentialsForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setLoginFaultMessage("");
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginFaultMessage("");
    setIsSubmittingLogin(true);

    try {
      const responseOutcome = await httpClient.post("/customers/login", loginCredentialsForm);
      setActiveCustomerUser(responseOutcome.data.Customer);
      routerNavigator("/home", { replace: true });
    } catch (networkError) {
      setLoginFaultMessage(
        networkError.response?.data?.message ||
          "Invalid credentials. Please verify your email address and password."
      );
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  const handleAutofillDemoCredentials = () => {
    setLoginCredentialsForm({
      email: "demo@shopkart.io",
      password: "password123",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12 selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 font-serif-editorial text-2xl font-bold text-white shadow-md shadow-indigo-600/20 transition group-hover:scale-105">
              S
            </span>
          </Link>
          <h1 className="mt-4 font-serif-editorial text-3xl font-bold tracking-tight text-slate-900">
            Welcome Back
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Sign in to access your curated wishlist, shopping bag, and orders.
          </p>
        </div>

        {/* Form Panel Card */}
        <div className="rounded-3xl lux-glass-modal p-6 sm:p-8 shadow-xl">
          {loginFaultMessage && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/90 px-4 py-2.5 text-xs text-rose-700 animate-slide-up">
              <svg className="h-4 w-4 shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{loginFaultMessage}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLoginSubmit}>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                value={loginCredentialsForm.email}
                onChange={handleInputChange}
                placeholder="eleanor@example.com"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  type={isPasswordVisible ? "text" : "password"}
                  name="password"
                  required
                  value={loginCredentialsForm.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 pr-10 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10"
                />
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-700 transition"
                >
                  {isPasswordVisible ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingLogin}
              className="w-full mt-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-indigo-600/25 transition hover:bg-indigo-700 disabled:opacity-50 active:scale-98"
            >
              {isSubmittingLogin ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Quick Demo Credentials Autofill */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">Testing credentials?</span>
            <button
              type="button"
              onClick={handleAutofillDemoCredentials}
              className="text-[11px] font-bold text-indigo-600 hover:underline"
            >
              Auto-fill demo credentials
            </button>
          </div>
        </div>

        {/* Footer Link to Signup */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Do not possess an account yet?{" "}
          <Link to="/signup" className="font-bold text-indigo-600 hover:underline">
            Register for access
          </Link>
        </p>
      </div>
    </div>
  );
}
