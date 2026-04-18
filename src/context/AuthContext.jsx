import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        // Pull role from localStorage (set during login)
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          setUserRole(parsed.role);
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
        localStorage.removeItem("user");
      }
      setLoadingUser(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, userRole, loadingUser }}>
      {!loadingUser && children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);