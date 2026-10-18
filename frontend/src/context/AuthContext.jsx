import { createContext, useContext, useEffect, useState } from "react";
import httpClient from "../axiosCalls/axios";

const AuthenticationContext = createContext();

export const AuthProvider = ({ children }) => {
  const [activeSessionUser, setActiveSessionUser] = useState(null);
  const [isSessionValidating, setIsSessionValidating] = useState(true);

  // Global Auth Modal control state
  const [authModalVisibilityState, setAuthModalVisibilityState] = useState(false);
  const [authModalDisplayMode, setAuthModalDisplayMode] = useState("login"); // "login" | "signup"

  const triggerAuthModalOpen = (requestedMode = "login") => {
    setAuthModalDisplayMode(requestedMode);
    setAuthModalVisibilityState(true);
  };

  const triggerAuthModalClose = () => {
    setAuthModalVisibilityState(false);
  };

  // Re-verify session on mount
  useEffect(() => {
    let activeComponent = true;

    const verifyActiveSession = async () => {
      try {
        const profileResponse = await httpClient.get("/customers/me");
        if (activeComponent) {
          setActiveSessionUser(profileResponse.data);
        }
      } catch {
        if (activeComponent) {
          setActiveSessionUser(null);
        }
      } finally {
        if (activeComponent) {
          setIsSessionValidating(false);
        }
      }
    };

    verifyActiveSession();

    // Listen to unauthorized session events from axios interceptor
    const handleUnauthorizedEvent = () => {
      setActiveSessionUser(null);
    };
    window.addEventListener("shopkart:unauthorized-session", handleUnauthorizedEvent);

    return () => {
      activeComponent = false;
      window.removeEventListener("shopkart:unauthorized-session", handleUnauthorizedEvent);
    };
  }, []);

  const performUserLogin = async (credentialsEmail, credentialsPassword) => {
    const authResponse = await httpClient.post("/customers/login", {
      email: credentialsEmail,
      password: credentialsPassword,
    });

    if (authResponse.data?.Customer) {
      setActiveSessionUser(authResponse.data.Customer);
    } else {
      const refreshedProfile = await httpClient.get("/customers/me");
      setActiveSessionUser(refreshedProfile.data);
    }
    return authResponse.data;
  };

  const performUserSignup = async ({ name: newName, email: newEmail, password: newPassword, phoneNo: newPhone }) => {
    const registrationResponse = await httpClient.post("/customers/register", {
      name: newName,
      email: newEmail,
      password: newPassword,
      phoneNo: newPhone,
    });

    if (registrationResponse.data?.Customer) {
      setActiveSessionUser(registrationResponse.data.Customer);
    } else {
      const refreshedProfile = await httpClient.get("/customers/me");
      setActiveSessionUser(refreshedProfile.data);
    }
    return registrationResponse.data;
  };

  const terminateUserSession = async () => {
    try {
      await httpClient.post("/customers/logout");
    } finally {
      setActiveSessionUser(null);
    }
  };

  const contextBundle = {
    // Standard names for compatibility
    user: activeSessionUser,
    setUser: setActiveSessionUser,
    loading: isSessionValidating,
    login: performUserLogin,
    signup: performUserSignup,
    logout: terminateUserSession,
    isAuthModalOpen: authModalVisibilityState,
    authModalMode: authModalDisplayMode,
    openAuthModal: triggerAuthModalOpen,
    closeAuthModal: triggerAuthModalClose,

    // Modern descriptive aliases
    currentUser: activeSessionUser,
    isAuthenticated: Boolean(activeSessionUser),
    isVerifyingAuth: isSessionValidating,
    showAuthModal: triggerAuthModalOpen,
    hideAuthModal: triggerAuthModalClose,
  };

  return (
    <AuthenticationContext.Provider value={contextBundle}>
      {children}
    </AuthenticationContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthenticationContext);
  if (!context) {
    throw new Error("useAuth must be consumed within an AuthProvider");
  }
  return context;
};

export default useAuth;
