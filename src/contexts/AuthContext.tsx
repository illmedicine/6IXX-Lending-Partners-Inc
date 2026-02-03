import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User as FirebaseUser,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { User, UserRole } from '@/types';
import { getUserByUid, createUser, updateUser } from '@/lib/firestore';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: (role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserPhone: (phoneNumber: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        const userData = await getUserByUid(firebaseUser.uid);
        setUser(userData);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async (role: UserRole) => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      
      console.log('Google sign-in successful, checking Firestore...');
      
      // Check if user exists in Firestore
      let userData = await getUserByUid(firebaseUser.uid);
      
      if (!userData) {
        console.log('Creating new user in Firestore...');
        // Create new user
        const newUser: Omit<User, 'createdAt'> = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'User',
          photoURL: firebaseUser.photoURL || undefined,
          role: role,
        };
        
        try {
          await createUser(newUser);
          console.log('User created successfully');
          userData = await getUserByUid(firebaseUser.uid);
        } catch (createError: any) {
          console.error('Error creating user:', createError);
          throw new Error('Failed to create user account. Please check Firestore permissions.');
        }
      } else if (userData.role !== role) {
        console.log('Updating user role...');
        // Update role if user selected a different one
        await updateUser(firebaseUser.uid, { role });
        userData = { ...userData, role };
      }
      
      console.log('Authentication complete:', userData);
      setUser(userData);
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      if (error.code === 'auth/popup-blocked') {
        alert('Popup was blocked. Please allow popups for this site and try again.');
      } else if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        // User closed popup, don't show error
        return;
      } else if (error.message?.includes('Firestore')) {
        alert('Database error: ' + error.message);
      }
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateUserPhone = async (phoneNumber: string) => {
    if (user) {
      await updateUser(user.uid, { phoneNumber });
      setUser({ ...user, phoneNumber });
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    signInWithGoogle,
    signOut,
    updateUserPhone,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
