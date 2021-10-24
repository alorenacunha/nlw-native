import React, { createContext, useContext, useEffect, useState } from "react";
import * as AuthSessions from "expo-auth-session";
import { api } from "../components/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GITHUB_CLIENT_SECRET = "83b7dc4ed8343e51a855a1920c9d1834462529aa";
const GITHUB_CLIENT_ID = "767de1741f6879ba5cdc";
const GITHUB_SCOPE = "read:user";
const JWT_SECRET = "7a7b6dd3d28fb8fbe4ce69eae793b7e5";

const USER_STORAGE = "@nlw-native:user";
const TOKEN_STORAGE = "@nlw-native:token";

type User = {
  id: string;
  avatar_url: string;
  name: string;
  login: string;
};

type AuthContextData = {
  user: User | null;
  isSigningIn: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

type AuthProviderProps = {
  children: React.ReactNode;
};

type AuthResponse = {
  token: string;
  user: User;
};

type AuthorizationResponse = {
  params: {
    code?: string;
    error?: string;
  };
  type?: string;
};

export const AuthContext = createContext({} as AuthContextData);

function AuthProvider({ children }: AuthProviderProps) {
  const [isSigningIn, setIsSigningIn] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  async function signIn() {
    try {
      setIsSigningIn(true);
      const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=${GITHUB_SCOPE}`;
      const authSessionResponse = (await AuthSessions.startAsync({ authUrl })) as AuthorizationResponse;

      if (authSessionResponse.type === "success" && authSessionResponse.params.error !== "access_denied") {
        const authResponse = await api.post("/authenticate", { code: authSessionResponse.params.code });
        const { user, token } = authResponse.data as AuthResponse;
        console.log(authResponse.data);

        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        await AsyncStorage.setItem(USER_STORAGE, JSON.stringify(user));
        await AsyncStorage.setItem(TOKEN_STORAGE, token);

        setUser(user);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsSigningIn(false);
    }
  }

  async function signOut() {
    setUser(null);
    await AsyncStorage.removeItem(USER_STORAGE);
    await AsyncStorage.removeItem(TOKEN_STORAGE);
  }

  useEffect(() => {
    async function loadUserStorageData() {
      const userStorage = await AsyncStorage.getItem(USER_STORAGE);
      const tokenStorage = await AsyncStorage.getItem(TOKEN_STORAGE);

      if (userStorage && tokenStorage) {
        api.defaults.headers.common["Authorization"] = `Bearer ${tokenStorage}`;
        setUser(JSON.parse(userStorage));
      } else setUser(null);

      setIsSigningIn(false);
    }

    loadUserStorageData();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        user,
        isSigningIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  return context;
}

export { AuthProvider, useAuth };
