import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import httpClient from "../axiosCalls/axios";
import { useAuth } from "../context/AuthContext";

export default function SignUp() {
  const [registrationFormData, setRegistrationFormData] = useState({
    name: "",
    email: "",
    phoneNo: "",
    password: "",
  });
  const [registrationFaultMessage, setRegistrationFaultMessage] = useState("");
  const [isSubmittingRegistration, setIsSubmittingRegistration] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const routerNavigator = useNavigate();
  const { setUser: setActiveCustomerUser } = useAuth();

  const handleInputChange = (e) => {
    setRegistrationFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setRegistrationFaultMessage("");
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    setRegistrationFaultMessage("");
    setIsSubmittingRegistration(true);

    try {
      const responseOutcome = await httpClient.post("/customers/register", registrationFormData);
      setActiveCustomerUser(responseOutcome.data.Customer);
      routerNavigator("/home", { replace: true });
    } catch (networkError) {
      setRegistrationFaultMessage(
        networkError.response?.data?.message ||
          "Registration could not be completed. Please check your details."
      );
    } finally {
      setIsSubmittingRegistration(false);
    }
  };

  const handleAutofillDemo = () => {
    const randomSuffix = Math.floor(Math.random() * 9000 + 1000);
    setRegistrationFormData({
      name: "Eleanor Vance",
      email: `eleanor_${randomSuffix}@shopkart.io`,
      phoneNo: "9876543210",
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
            Create Account
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Join ShopKart to discover curated studio gear and architectural objects.
          </p>
        </div>

        {/* Form Panel Card */}
        <div className="rounded-3xl lux-glass-modal p-6 sm:p-8 shadow-xl">
          {registrationFaultMessage && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/90 px-4 py-2.5 text-xs text-rose-700 animate-slide-up">
              <svg className="h-4 w-4 shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{registrationFaultMessage}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleRegistrationSubmit}>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Full Legal Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={registrationFormData.name}
                onChange={handleInputChange}
                placeholder="Eleanor Vance"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                value={registrationFormData.email}
                onChange={handleInputChange}
                placeholder="eleanor@example.com"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Contact Phone
              </label>
              <input
                type="tel"
                name="phoneNo"
                required
                value={registrationFormData.phoneNo}
                onChange={handleInputChange}
                placeholder="9876543210"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Password (min. 6 characters)
              </label>
              <div className="relative mt-1">
                <input
                  type={isPasswordVisible ? "text" : "password"}
                  name="password"
                  required
                  value={registrationFormData.password}
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
              disabled={isSubmittingRegistration}
              className="w-full mt-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-indigo-600/25 transition hover:bg-indigo-700 disabled:opacity-50 active:scale-98"
            >
              {isSubmittingRegistration ? "Creating Profile..." : "Create Account"}
            </button>
          </form>

          {/* Quick Demo Autofill */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">Testing signup?</span>
            <button
              type="button"
              onClick={handleAutofillDemo}
              className="text-[11px] font-bold text-indigo-600 hover:underline"
            >
              Generate demo details
            </button>
          </div>
        </div>

        {/* Footer Link to Login */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Already have an active account?{" "}
          <Link to="/login" className="font-bold text-indigo-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
