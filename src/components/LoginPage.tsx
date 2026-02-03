import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import BackgroundSlider from '@/components/BackgroundSlider';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!selectedRole) return;
    
    setLoading(true);
    try {
      await signInWithGoogle(selectedRole);
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        const errorMessage = error.message || 'Failed to sign in. Please try again.';
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      <BackgroundSlider />
      
      <div className="relative z-10 bg-black/40 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo className="w-24 h-24" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            6IXX Lending Partners
          </h1>
          <p className="text-gray-200 text-lg font-medium">Fast Cash • $100 to $5,000</p>
          <p className="text-gray-300 text-sm mt-1">Luxury Lifestyle Financing</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="text-center mb-4">
            <p className="text-sm font-medium text-gray-200">I am a:</p>
          </div>

          <button
            onClick={() => setSelectedRole('borrower')}
            className={`w-full py-4 px-6 rounded-xl border-2 transition-all transform hover:scale-105 ${
              selectedRole === 'borrower'
                ? 'border-blue-500 bg-blue-500/30 shadow-lg shadow-blue-500/50 backdrop-blur-sm'
                : 'border-white/30 bg-white/10 backdrop-blur-sm hover:border-blue-400 hover:bg-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="font-semibold text-white text-lg">Borrower</div>
                <div className="text-sm text-gray-200">Get cash fast</div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedRole === 'borrower'
                  ? 'border-blue-400 bg-blue-500'
                  : 'border-white/50'
              }`}>
                {selectedRole === 'borrower' && (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          </button>

          <button
            onClick={() => setSelectedRole('lender')}
            className={`w-full py-4 px-6 rounded-xl border-2 transition-all transform hover:scale-105 ${
              selectedRole === 'lender'
                ? 'border-purple-500 bg-purple-500/30 shadow-lg shadow-purple-500/50 backdrop-blur-sm'
                : 'border-white/30 bg-white/10 backdrop-blur-sm hover:border-purple-400 hover:bg-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="font-semibold text-white text-lg">Lender</div>
                <div className="text-sm text-gray-200">Review requests</div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedRole === 'lender'
                  ? 'border-purple-400 bg-purple-500'
                  : 'border-white/50'
              }`}>
                {selectedRole === 'lender' && (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          </button>
        </div>

        <button
          onClick={handleSignIn}
          disabled={!selectedRole || loading}
          className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all transform hover:scale-105 ${
            selectedRole && !loading
              ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black shadow-lg shadow-yellow-500/50 hover:shadow-yellow-500/70'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Signing in...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </span>
          )}
        </button>

        <p className="text-xs text-gray-300 text-center mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
