import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "../services/firebase/config";
import {
  signInSecurely,
  signInWithBiometrics as firebaseSignInWithBiometrics,
  createSecureUser,
  signOutSecurely,
  validateCurrentSession,
  setupTokenListener,
  getCurrentTokenInfo,
} from "../services/firebase/secureAuth";
import {
  canUseSecureBiometricAuth,
  getLastSecureEmail,
  isSecureStoreAvailable,
  validateSecureAuthData,
} from "../services/storage/secureAuth";
import { getUserProfile, UserProfile } from "../services/firebase/firestore";
import {
  authenticateWithBiometrics,
  checkBiometricCapabilities,
  BiometricCapabilities,
} from "../services/biometric/auth";
import { cleanupOldAuthData } from "../utils/cleanupOldData";
import NotificationService from "../services/notifications";

interface User {
  id: string;
  email: string;
  name: string;
  balance?: number;
  profilePicture?: string;
  isActive?: boolean;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  initializing: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>;
  signUp: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ success: boolean; message: string }>;
  signInWithBiometrics: () => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<{ success: boolean; message: string }>;
  biometricCapabilities: BiometricCapabilities | null;
  canUseBiometrics: boolean;
  lastAuthEmail: string | null;
  isSecureStoreReady: boolean;
  sessionValid: boolean;
  refreshToken: () => Promise<boolean>;
  getTokenInfo: () => Promise<any>;
  checkBiometrics: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useSecureAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useSecureAuth must be used within a SecureAuthProvider");
  }
  return context;
};

const convertFirebaseUser = (
  firebaseUser: FirebaseUser,
  profile?: UserProfile | null
): User => {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || "",
    name: profile?.name || firebaseUser.displayName || "User",
    balance: profile?.balance || 0,
    profilePicture: firebaseUser.photoURL || undefined,
    isActive: profile?.isActive ?? true,
  };
};

export const SecureAuthProvider: React.FC<AuthProviderProps> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const notificationService = NotificationService.getInstance();
  const [biometricCapabilities, setBiometricCapabilities] =
    useState<BiometricCapabilities | null>(null);
  const [canUseBiometrics, setCanUseBiometrics] = useState(false);
  const [lastAuthEmail, setLastAuthEmail] = useState<string | null>(null);
  const [isSecureStoreReady, setIsSecureStoreReady] = useState(false);
  const [sessionValid, setSessionValid] = useState(false);
  const convertFirebaseUser = (
    firebaseUser: FirebaseUser,
    profile?: UserProfile | null
  ): User => {
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || "",
      name: profile?.name || firebaseUser.displayName || "User",
      balance: profile?.balance || 0,
      profilePicture:
        profile?.profilePicture || firebaseUser.photoURL || undefined,
      isActive: profile?.isActive ?? true,
    };
  };

  const checkBiometrics = async () => {
    try {
      const capabilities = await checkBiometricCapabilities();
      setBiometricCapabilities(capabilities);

      const authStatus = await canUseSecureBiometricAuth();
      setCanUseBiometrics(authStatus.canUse);

      const email = await getLastSecureEmail();
      setLastAuthEmail(email);
    } catch (error) {}
  };

  const checkSecureStore = async () => {
    try {
      const available = await isSecureStoreAvailable();
      setIsSecureStoreReady(available);

      if (available) {
        await validateSecureAuthData();
      }
    } catch (error) {
      setIsSecureStoreReady(false);
    }
  };

  const checkSession = async () => {
    try {
      const valid = await validateCurrentSession();
      setSessionValid(valid);
    } catch (error) {
      setSessionValid(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        setUserProfile(profile);

        const userData = convertFirebaseUser(firebaseUser, profile);
        setUser(userData);

        await checkBiometrics();
        await checkSession();
      } else {
        setUser(null);
        setUserProfile(null);
        setSessionValid(false);
      }

      if (initializing) {
        setInitializing(false);
      }
    });

    const initializeAuth = async () => {
      await cleanupOldAuthData();
      await checkSecureStore();
      await checkBiometrics();
      await checkSession();
    };

    initializeAuth();
    const tokenUnsubscribe = setupTokenListener(async (user) => {
      if (user) {
        await checkSession();
      }
    });

    return () => {
      unsubscribe();
      tokenUnsubscribe();
    };
  }, [initializing]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await signInSecurely(email, password);

      if (result.success) {
        await checkBiometrics();
        await checkSession();
        await notificationService.notifySecurity("login");

        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error("❌ Secure sign in error:", error);
      return { success: false, message: "Erro inesperado durante o login" };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const result = await createSecureUser(email, password, name);

      if (result.success) {
        await checkBiometrics();

        await notificationService.notifySecurity("login");

        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error("❌ Secure sign up error:", error);
      return { success: false, message: "Erro inesperado durante o cadastro" };
    } finally {
      setLoading(false);
    }
  };

  const signInWithBiometrics = async () => {
    setLoading(true);
    try {
      if (!isSecureStoreReady) {
        return {
          success: false,
          message: "Armazenamento seguro não disponível. Use email e senha.",
        };
      }
      const authStatus = await canUseSecureBiometricAuth();

      if (!authStatus.canUse || !authStatus.authData) {
        return {
          success: false,
          message:
            authStatus.reason || "Autenticação biométrica não disponível",
        };
      }

      if (!biometricCapabilities?.isAvailable) {
        return {
          success: false,
          message:
            "Autenticação biométrica não está disponível neste dispositivo",
        };
      }
      const biometricResult = await authenticateWithBiometrics(
        `Acesse o SafeBank como ${authStatus.authData.email}`
      );

      if (biometricResult.success) {
        const firebaseResult = await firebaseSignInWithBiometrics();

        if (firebaseResult.success) {
          await checkSession();

          if (!user && firebaseResult.user) {
            try {
              const profile = await getUserProfile(firebaseResult.user.uid);
              setUserProfile(profile);

              const userData = convertFirebaseUser(
                firebaseResult.user,
                profile
              );
              setUser(userData);
            } catch (profileError) {
            }
          }

          await notificationService.notifySecurity("biometric");

          await new Promise((resolve) => setTimeout(resolve, 500));

          return {
            success: true,
            message: firebaseResult.message,
          };
        } else {
          return {
            success: false,
            message: firebaseResult.message,
          };
        }
      } else {
        if (biometricResult.error === "MISSING_PERMISSION") {
          return {
            success: false,
            message:
              "Biometric permission error. Please restart the app. If the problem persists, this may be due to testing in Expo Go - try building the app natively.",
          };
        }

        return {
          success: false,
          message: biometricResult.message,
        };
      }
    } catch (error) {
      return { success: false, message: "Falha na autenticação biométrica" };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const result = await signOutSecurely();

      if (result.success) {
        await notificationService.notifySecurity("logout");

        setUser(null);
        setUserProfile(null);
        setSessionValid(false);

        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error("❌ Secure sign out error:", error);
      return { success: false, message: "Erro durante logout" };
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const { refreshCurrentToken } = await import(
        "../services/firebase/secureAuth"
      );
      const success = await refreshCurrentToken();

      if (success) {
        await checkSession();
      }

      return success;
    } catch (error) {
      console.error("❌ Error refreshing token:", error);
      return false;
    }
  };

  const getTokenInfo = async () => {
    try {
      return await getCurrentTokenInfo();
    } catch (error) {
      console.error("❌ Error getting token info:", error);
      return null;
    }
  };

  const refreshUserProfile = async () => {
    if (user) {
      const profile = await getUserProfile(user.id);
      setUserProfile(profile);

      if (profile) {
        setUser((prev) =>
          prev
            ? {
                ...prev,
                name: profile.name,
                balance: profile.balance,
                isActive: profile.isActive,
              }
            : null
        );
      }
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    initializing,
    signIn,
    signUp,
    signInWithBiometrics,
    signOut,
    biometricCapabilities,
    canUseBiometrics,
    lastAuthEmail,
    isSecureStoreReady,
    sessionValid,
    refreshToken,
    getTokenInfo,
    checkBiometrics,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
