import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthModal({ isOpen, onClose, initialMode = "login" }) {
  const [activeAuthMode, setActiveAuthMode] = useState(initialMode); // "login" | "signup"
  const { login: authenticateUser, signup: registerNewAccount } = useAuth();

  const [credentialsFormState, setCredentialsFormState] = useState({
    name: "",
    email: "",
    password: "",
    phoneNo: "",
  });
  const [isRevealingPassword, setIsRevealingPassword] = useState(false);
  const [isAuthenticationPending, setIsAuthenticationPending] = useState(false);
  const [authenticationErrorMessage, setAuthenticationErrorMessage] = useState(null);

  useEffect(() => {
    setActiveAuthMode(initialMode);
    setAuthenticationErrorMessage(null);
  }, [initialMode, isOpen]);

  useEffect(() => {
    const handleDismissOnEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleDismissOnEscape);
    return () => window.removeEventListener("keydown", handleDismissOnEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFormFieldChange = (e) => {
    setCredentialsFormState((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setAuthenticationErrorMessage(null);
  };

  const handleAuthenticationSubmit = async (e) => {
    e.preventDefault();
    setIsAuthenticationPending(true);
    setAuthenticationErrorMessage(null);

    try {
      if (activeAuthMode === "login") {
        await authenticateUser(credentialsFormState.email, credentialsFormState.password);
      } else {
        await registerNewAccount({
          name: credentialsFormState.name,
          email: credentialsFormState.email,
          password: credentialsFormState.password,
          phoneNo: credentialsFormState.phoneNo,
        });
      }
      onClose();
    } catch (authError) {
      console.error("Authentication exception:", authError);
      setAuthenticationErrorMessage(
        authError.response?.data?.message ||
          (activeAuthMode === "login"
            ? "Invalid email or password credentials."
            : "Registration failed. Please verify details.")
      );
    } finally {
      setIsAuthenticationPending(false);
    }
  };

  // Demo Credentials Autofill Helper
  const handleAutofillDemo = () => {
    if (activeAuthMode === "login") {
      setCredentialsFormState({
        name: "",
        email: "demo@shopkart.io",
        password: "password123",
        phoneNo: "",
      });
    } else {
      setCredentialsFormState({
        name: "Devin Vance",
        email: `devin_${Math.floor(Math.random() * 1000)}@shopkart.io`,
        password: "password123",
        phoneNo: "9876543210",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl lux-glass-modal p-6 sm:p-8 shadow-2xl animate-slide-up">
        {/* Dismiss Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-800"
          aria-label="Dismiss auth dialog"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Brand Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 font-serif-editorial text-xl font-bold text-white shadow-md shadow-indigo-600/20">
            S
          </div>
          <h2 className="font-serif-editorial text-2xl font-bold tracking-tight text-slate-900">
            {activeAuthMode === "login" ? "Welcome back" : "Create Account"}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {activeAuthMode === "login"
              ? "Access your curated wishlist, shopping bag, and orders."
              : "Experience thoughtfully curated artifacts for elevated living."}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setActiveAuthMode("login")}
            className={`rounded-lg py-2 text-xs font-bold transition-all ${
              activeAuthMode === "login"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setActiveAuthMode("signup")}
            className={`rounded-lg py-2 text-xs font-bold transition-all ${
              activeAuthMode === "signup"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Feedback Notice */}
        {authenticationErrorMessage && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/90 px-3.5 py-2.5 text-xs text-rose-700 animate-fade-in">
            <svg className="h-4 w-4 shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{authenticationErrorMessage}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form className="space-y-3.5" onSubmit={handleAuthenticationSubmit}>
          {activeAuthMode === "signup" && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={credentialsFormState.name}
                onChange={handleFormFieldChange}
                placeholder="Eleanor Vance"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              value={credentialsFormState.email}
              onChange={handleFormFieldChange}
              placeholder="eleanor@example.com"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10"
            />
          </div>

          {activeAuthMode === "signup" && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Contact Phone
              </label>
              <input
                type="tel"
                name="phoneNo"
                required
                value={credentialsFormState.phoneNo}
                onChange={handleFormFieldChange}
                placeholder="9876543210"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Password
            </label>
            <div className="relative mt-1">
              <input
                type={isRevealingPassword ? "text" : "password"}
                name="password"
                required
                value={credentialsFormState.password}
                onChange={handleFormFieldChange}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 pr-10 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10"
              />
              <button
                type="button"
                onClick={() => setIsRevealingPassword(!isRevealingPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-700 transition"
              >
                {isRevealingPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isAuthenticationPending}
            className="w-full mt-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-indigo-600/25 transition hover:bg-indigo-700 disabled:opacity-50 active:scale-98"
          >
            {isAuthenticationPending
              ? "Authenticating..."
              : activeAuthMode === "login"
              ? "Sign In to Account"
              : "Register Account"}
          </button>
        </form>

        {/* Demo Fast-fill Option */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">Testing credentials?</span>
          <button
            type="button"
            onClick={handleAutofillDemo}
            className="text-[11px] font-bold text-indigo-600 hover:underline"
          >
            Auto-fill demo credentials
          </button>
        </div>
      </div>
    </div>
  );
}
