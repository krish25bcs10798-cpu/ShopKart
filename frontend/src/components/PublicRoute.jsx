import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicRoute({ children }) {
  const { user: activeCustomer, loading: isAuthValidating } = useAuth();

  if (isAuthValidating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 font-serif-editorial text-xl font-bold text-white shadow-md animate-pulse">
          S
        </div>
        <p className="mt-4 text-xs font-semibold text-slate-500 tracking-wider uppercase">
          Verifying session...
        </p>
      </div>
    );
  }

  if (activeCustomer) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
