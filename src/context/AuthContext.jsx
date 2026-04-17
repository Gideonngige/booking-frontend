import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoadingUser(false);
    });
    return unsubscribe; // cleanup on unmount
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loadingUser }}>
      {!loadingUser && children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);