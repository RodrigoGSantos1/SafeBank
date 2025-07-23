import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser,
  AuthError,
  onIdTokenChanged,
  getIdToken
} from 'firebase/auth';
import { auth } from './config';
import { createUserProfile } from './firestore';
import { saveSecureAuthData, getSecureAuthData, clearSecureAuthData, getDecryptedPassword } from '../storage/secureAuth';

interface SecureAuthResult {
  success: boolean;
  message: string;
  user?: FirebaseUser;
}

interface TokenInfo {
  idToken: string;
  refreshToken: string;
  expirationTime: number;
}

export const getCurrentIdToken = async (forceRefresh = false): Promise<string | null> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return null;
    }

    const idToken = await getIdToken(currentUser, forceRefresh);
    return idToken;
  } catch (error) {
    return null;
  }
};

export const signInSecurely = async (
  email: string,
  password: string
): Promise<SecureAuthResult> => {
  try {
    if (!email.trim() || !password.trim()) {
      return {
        success: false,
        message: 'Email e senha são obrigatórios',
      };
    }

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.trim().toLowerCase(),
      password
    );

    const user = userCredential.user;

    const idToken = await getIdToken(user);
    const refreshToken = user.refreshToken;

    if (!refreshToken) {
      return {
        success: false,
        message: 'Erro interno: token de autenticação não recebido',
      };
    }

    await saveSecureAuthData(email, password);

    return {
      success: true,
      message: 'Login realizado com sucesso!',
      user,
    };

  } catch (error) {

    const authError = error as AuthError;
    let message = 'Login error';

    switch (authError.code) {
      case 'auth/user-not-found':
        message = 'User not found';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email';
        break;
      case 'auth/user-disabled':
        message = 'Account disabled';
        break;
      case 'auth/too-many-requests':
        message = 'Too many attempts. Try again later';
        break;
      default:
        message = 'Login error. Try again';
    }

    return {
      success: false,
      message,
    };
  }
};

export const signInWithBiometrics = async (): Promise<SecureAuthResult> => {
  try {
    const authData = await getSecureAuthData();

    if (!authData) {
      return {
        success: false,
        message: 'Authentication data not found. Please login again',
      };
    }

    const password = await getDecryptedPassword();

    if (!password) {
      return {
        success: false,
        message: 'Error accessing saved credentials. Please login again',
      };
    }

    const userCredential = await signInWithEmailAndPassword(
      auth,
      authData.email,
      password
    );

    const user = userCredential.user;

    return {
      success: true,
      message: `Welcome back, ${authData.email}!`,
      user,
    };

  } catch (error) {

    const authError = error as AuthError;
    let message = 'Biometric authentication error';

    switch (authError.code) {
      case 'auth/wrong-password':
        message = 'Saved credentials expired. Please login again';
        break;
      case 'auth/user-not-found':
        message = 'User not found. Please login again';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email. Please login again';
        break;
      case 'auth/user-disabled':
        message = 'Account disabled';
        break;
      case 'auth/too-many-requests':
        message = 'Too many attempts. Try again later';
        break;
      default:
        message = 'Authentication error. Please login again';
    }

    return {
      success: false,
      message,
    };
  }
};

export const createSecureUser = async (
  email: string,
  password: string,
  name: string
): Promise<SecureAuthResult> => {
  try {
    if (!email.trim() || !password.trim() || !name.trim()) {
      return {
        success: false,
        message: 'Todos os campos são obrigatórios',
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        message: 'A senha deve ter pelo menos 6 caracteres',
      };
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.trim().toLowerCase(),
      password
    );

    const user = userCredential.user;

    await createUserProfile(
      user.uid,
      user.email || email,
      name.trim()
    );

    const refreshToken = user.refreshToken;
    if (refreshToken) {
      await saveSecureAuthData(email, refreshToken);
    }

    return {
      success: true,
      message: 'Account created successfully!',
      user,
    };

  } catch (error) {
    console.error('❌ Error creating secure user:', error);

    const authError = error as AuthError;
    let message = 'Error creating account';

    switch (authError.code) {
      case 'auth/email-already-in-use':
        message = 'This email is already in use';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email';
        break;
      case 'auth/weak-password':
        message = 'Password too weak. Use at least 6 characters';
        break;
      default:
        message = 'Error creating account. Try again';
    }

    return {
      success: false,
      message,
    };
  }
};

export const signOutSecurely = async (): Promise<SecureAuthResult> => {
  try {
    await firebaseSignOut(auth);

    return {
      success: true,
      message: 'Logout completed successfully',
    };

  } catch (error) {
    console.error('❌ Error in secure sign out:', error);

    return {
      success: false,
      message: 'Logout error',
    };
  }
};

export const signOutCompletelySecurely = async (): Promise<SecureAuthResult> => {
  try {
    await firebaseSignOut(auth);

    await clearSecureAuthData();

    return {
      success: true,
      message: 'Complete logout completed successfully',
    };

  } catch (error) {
    console.error('❌ Error in complete secure sign out:', error);

    try {
      await clearSecureAuthData();
    } catch (clearError) {
      console.error('❌ Error clearing secure data:', clearError);
    }

    return {
      success: false,
      message: 'Complete logout error',
    };
  }
};

export const validateCurrentSession = async (): Promise<boolean> => {
  try {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      return false;
    }

    const idToken = await getCurrentIdToken(true);

    return !!idToken;
  } catch (error) {
    console.error('❌ Error validating session:', error);
    return false;
  }
};

export const setupTokenListener = (
  onTokenChanged: (user: FirebaseUser | null) => void
) => {
  return onIdTokenChanged(auth, onTokenChanged);
};

export const refreshCurrentToken = async (): Promise<boolean> => {
  try {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      return false;
    }

    const newIdToken = await getIdToken(currentUser, true);

    if (newIdToken) {
      const newRefreshToken = currentUser.refreshToken;
      if (newRefreshToken) {
        const authData = await getSecureAuthData();
        if (authData) {
          await saveSecureAuthData(authData.email, newRefreshToken);
        }
      }

      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ Error refreshing token:', error);
    return false;
  }
};

export const getCurrentTokenInfo = async (): Promise<TokenInfo | null> => {
  try {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      return null;
    }

    const idToken = await getIdToken(currentUser);
    const refreshToken = currentUser.refreshToken;

    if (!idToken || !refreshToken) {
      return null;
    }

    const payload = JSON.parse(atob(idToken.split('.')[1]));
    const expirationTime = payload.exp * 1000;

    return {
      idToken,
      refreshToken,
      expirationTime,
    };
  } catch (error) {
    console.error('❌ Error getting token info:', error);
    return null;
  }
}; 