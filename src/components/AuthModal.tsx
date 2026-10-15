import React, { useState } from 'react';
import { X, LogIn, Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setErrorMsg(
        err.code === 'auth/popup-closed-by-user'
          ? 'Login Google dibatalkan.'
          : err.message || 'Gagal login dengan Google.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await loginWithEmail(email.trim(), password);
      } else {
        if (!displayName.trim()) {
          throw new Error('Nama lengkap wajib diisi.');
        }
        if (password.length < 6) {
          throw new Error('Password minimal 6 karakter.');
        }
        await registerWithEmail(email.trim(), password, displayName.trim());
      }
    } catch (err: any) {
      let friendly = err.message;
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        friendly = 'Email atau password salah. Silakan periksa kembali.';
      } else if (err.code === 'auth/email-already-in-use') {
        friendly = 'Email ini sudah terdaftar. Silakan login.';
      } else if (err.code === 'auth/weak-password') {
        friendly = 'Password terlalu lemah (minimal 6 karakter).';
      } else if (err.code === 'auth/invalid-email') {
        friendly = 'Format email tidak valid.';
      }
      setErrorMsg(friendly);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-[#141A17] border border-[#2A352E] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#1B241F] text-[#A7B0AA] hover:text-[#F5F7F5] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-[#145A43]/40 border border-[#1ED760]/30 flex items-center justify-center text-[#1ED760] mx-auto mb-3">
            <LogIn className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-[#F5F7F5]">
            {mode === 'login' ? 'Masuk ke SPI 1A Music Room' : 'Daftar Akun Mahasiswa'}
          </h3>
          <p className="text-xs text-[#A7B0AA]">
            Khusus mahasiswa Sejarah Peradaban Islam 1A UIN RMS
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex rounded-xl bg-[#0B0F0D] p-1 border border-[#2A352E]">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-[#1B241F] text-[#1ED760] shadow-sm'
                : 'text-[#A7B0AA] hover:text-[#F5F7F5]'
            }`}
          >
            Masuk / Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-[#1B241F] text-[#1ED760] shadow-sm'
                : 'text-[#A7B0AA] hover:text-[#F5F7F5]'
            }`}
          >
            Daftar Akun Baru
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Google One-Click Login */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl bg-[#1B241F] hover:bg-[#2A352E] text-[#F5F7F5] border border-[#2A352E] text-xs font-semibold flex items-center justify-center gap-3 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Lanjutkan dengan Google
        </button>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-[#2A352E]"></div>
          <span className="flex-shrink mx-3 text-[10px] uppercase font-semibold text-[#A7B0AA]">
            Atau dengan Email
          </span>
          <div className="flex-grow border-t border-[#2A352E]"></div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-[#F5F7F5] mb-1">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A7B0AA]" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nama Lengkap Mahasiswa"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#1B241F] border border-[#2A352E] text-xs text-[#F5F7F5] placeholder-[#A7B0AA] focus:outline-none focus:border-[#1ED760]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#F5F7F5] mb-1">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A7B0AA]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@gmail.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#1B241F] border border-[#2A352E] text-xs text-[#F5F7F5] placeholder-[#A7B0AA] focus:outline-none focus:border-[#1ED760]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#F5F7F5] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A7B0AA]" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#1B241F] border border-[#2A352E] text-xs text-[#F5F7F5] placeholder-[#A7B0AA] focus:outline-none focus:border-[#1ED760]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#1ED760] hover:bg-[#1ED760]/90 text-[#0B0F0D] text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#1ED760]/20 transition-all cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === 'login' ? (
              'Masuk Sekarang'
            ) : (
              'Buat Akun SPI 1A'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
