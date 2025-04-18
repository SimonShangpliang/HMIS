import { createContext, useContext, useState, useEffect,useMemo } from "react";
import { refreshAccessToken } from "../services/authService";
import createAxiosInstance from "../utils/axiosInstance";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(
    {
      role:"user"
    }
  )
      // Create axiosInstance once and memoize it
      const axiosInstance = useMemo(() => {
        const instance = createAxiosInstance(setToken);
        console.log('axiosInstance created:', !!instance);
        return instance;
    }, []); // Empty dependency array since setToken reference is stable

    useEffect(() => {
        const refresh = async () => {

            try {
                const res = await refreshAccessToken();
                setToken(res.data.accessToken);
            } catch (err) {
                setToken(null);
            }
        };

        refresh();
    }, []);

    useEffect(() => {
      const authInterceptor = axiosInstance.interceptors.request.use(
          (config) => {
              if (token) {
                  config.headers.Authorization = `Bearer ${token}`;
              }
              return config;
          },
          (error) => Promise.reject(error)
      );

      return () => {
          axiosInstance.interceptors.request.eject(authInterceptor);
      };
  }, [token, axiosInstance]);

   // Memoize the context value to prevent unnecessary re-renders
   const contextValue = useMemo(() => ({
    token,
    role,
    setToken,
    setRole,
    axiosInstance
    ,user,setUser
    }), [token, role, axiosInstance]);
    console.log('Providing context value:', contextValue);

  return (
    <AuthContext.Provider value={ contextValue }>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
