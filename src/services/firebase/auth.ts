import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  signOut as firebaseSignOut,
  User as FirebaseUser,
  AuthError
} from "firebase/auth";
import { auth } from "./config";
import { createUserProfile } from "./firestore";

interface CreateUserResponse {
  user: FirebaseUser;
  success: boolean;
  message?: string;
}

interface SignInResponse {
  user: FirebaseUser;
  success: boolean;
  message?: string;
}

interface AuthErrorResponse {
  success: false;
  message: string;
  code?: string;
}

const getErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'This email is already in use by another account.',
    'auth/invalid-credential': 'Invalid credentials.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/operation-not-allowed': 'Operation not allowed.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'User not found.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Check your internet connection.',
  };
  
  return errorMessages[errorCode] || 'Unexpected error. Please try again.';
};

const validateUserInput = (email: string, password: string, name: string): string | null => {
  if (!email.trim()) return 'Email is required.';
  if (!password.trim()) return 'Password is required.';
  if (!name.trim()) return 'Name is required.';
  if (name.trim().length < 2) return 'Name must be at least 2 characters.';
  if (password.length < 6) return 'Password must be at least 6 characters.';
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Invalid email address.';
  
  return null;
};

export const createUser = async (
  email: string, 
  password: string, 
  name: string
): Promise<CreateUserResponse | AuthErrorResponse> => {
  const validationError = validateUserInput(email, password, name);
  if (validationError) {
    return {
      success: false,
      message: validationError
    };
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      email.trim().toLowerCase(), 
      password
    );

    await updateProfile(userCredential.user, {
      displayName: name.trim(),
    });

    const firestoreResult = await createUserProfile(
      userCredential.user.uid,
      email.trim().toLowerCase(),
      name.trim()
    );

    if (!firestoreResult.success) {
      console.error('❌ Failed to create user profile in Firestore:', firestoreResult.message);
    }

    return {
      user: userCredential.user,
      success: true,
      message: 'Account created successfully!'
    };

  } catch (error) {

    const authError = error as AuthError;
    
    return {
      success: false,
      message: getErrorMessage(authError.code),
      code: authError.code
    };
  }
};

export const signIn = async (
  email: string, 
  password: string
): Promise<SignInResponse | AuthErrorResponse> => {
  if (!email.trim()) {
    return {
      success: false,
      message: 'Email is required.'
    };
  }
  
  if (!password.trim()) {
    return {
      success: false,
      message: 'Password is required.'
    };
  }

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth, 
      email.trim().toLowerCase(), 
      password
    );

    return {
      user: userCredential.user,
      success: true,
      message: 'Login successful!'
    };

  } catch (error) {

    const authError = error as AuthError;
    
    return {
      success: false,
      message: getErrorMessage(authError.code),
      code: authError.code
    };
  }
};

export const signOut = async (): Promise<{ success: boolean; message?: string }> => {
  try {
    await firebaseSignOut(auth);
    
    return {
      success: true,
      message: 'Successfully signed out'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to sign out. Please try again.'
    };
  }
};