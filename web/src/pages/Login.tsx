import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import toast from 'react-hot-toast';

const DEMO_ACCOUNTS = {
  owner: { email: 'owner@lunomi.local', password: 'demo123' },
  manager: { email: 'manager@lunomi.local', password: 'demo123' },
  cashier: { email: 'kasir@lunomi.local', password: 'demo123' },
  kitchen: { email: 'kitchen@lunomi.local', password: 'demo123' },
};

export default function Login() {
  const [email, setEmail] = useState('owner@lunomi.local');
  const [password, setPassword] = useState('demo123');
  const [selectedRole, setSelectedRole] = useState<keyof typeof DEMO_ACCOUNTS>('owner');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useSupabaseAuth();
  const navigate = useNavigate();

  const handleRoleChange = (role: keyof typeof DEMO_ACCOUNTS) => {
    setSelectedRole(role);
    setEmail(DEMO_ACCOUNTS[role].email);
    setPassword(DEMO_ACCOUNTS[role].password);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Email dan password harus diisi');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      toast.success('Login berhasil!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Login gagal. Pastikan akun sudah dibuat di Supabase.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ 
      background: '#061820',
      backgroundImage: 'radial-gradient(ellipse 80% 60% at 20% 0%, rgba(13,59,74,0.8) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 100%, rgba(201,168,76,0.1) 0%, transparent 60%)'
    }}>
      {/* Animated Orbs */}
      <div className="orb orb-1" style={{
        position: 'fixed',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        filter: 'blur(80px)',
        pointerEvents: 'none',
        background: 'rgba(13,59,74,0.7)',
        top: '-200px',
        right: '-150px',
        animation: 'drift 12s ease-in-out infinite'
      }} />
      <div className="orb orb-2" style={{
        position: 'fixed',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        filter: 'blur(80px)',
        pointerEvents: 'none',
        background: 'rgba(201,168,76,0.06)',
        bottom: '-150px',
        left: '-100px',
        animation: 'drift 12s ease-in-out infinite 3s'
      }} />
      <div className="orb orb-3" style={{
        position: 'fixed',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        filter: 'blur(80px)',
        pointerEvents: 'none',
        background: 'rgba(13,59,74,0.4)',
        top: '40%',
        left: '30%',
        animation: 'drift 12s ease-in-out infinite 6s'
      }} />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo & Title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg"
                 style={{ 
                   background: 'rgba(13,59,74,0.5)', 
                   backdropFilter: 'blur(20px)',
                   WebkitBackdropFilter: 'blur(20px)',
                   border: '1px solid rgba(201,168,76,0.2)' 
                 }}>
              <span className="font-black text-2xl" style={{ color: '#C9A84C' }}>L</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Lunomi POS</h1>
            <p className="text-xs font-semibold mt-1 tracking-widest" style={{ color: '#C9A84C', letterSpacing: '.12em' }}>
              POS PINTAR
            </p>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Sistem POS Pintar untuk F&B Indonesia
            </p>
          </div>

          {/* Login Card */}
          <div className="rounded-3xl p-7 shadow-2xl" 
               style={{ 
                 background: 'rgba(13,59,74,0.5)', 
                 backdropFilter: 'blur(20px)',
                 WebkitBackdropFilter: 'blur(20px)',
                 border: '1px solid rgba(201,168,76,0.2)' 
               }}>
            
            {/* Role Selector */}
            <div className="mb-5">
              <p className="text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Pilih Role Akses
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['owner', 'manager', 'cashier', 'kitchen'] as const).map((role) => (
                  <label key={role}>
                    <input 
                      type="radio" 
                      name="role" 
                      value={role}
                      checked={selectedRole === role}
                      onChange={() => handleRoleChange(role)}
                      className="hidden"
                    />
                    <div
                      className="p-3 rounded-xl text-center transition-all cursor-pointer"
                      style={{
                        background: selectedRole === role ? 'rgba(201,168,76,0.18)' : 'rgba(255,255,255,0.05)',
                        border: selectedRole === role ? '1.5px solid rgba(201,168,76,0.55)' : '1.5px solid rgba(255,255,255,0.1)',
                        color: selectedRole === role ? '#C9A84C' : 'rgba(255,255,255,0.6)',
                        boxShadow: selectedRole === role ? '0 0 12px rgba(201,168,76,0.2)' : 'none'
                      }}
                    >
                      <div className="text-xl mb-1">
                        {role === 'owner' && '👤'}
                        {role === 'manager' && '📋'}
                        {role === 'cashier' && '💳'}
                        {role === 'kitchen' && '👨‍🍳'}
                      </div>
                      <div className="text-xs font-semibold capitalize">
                        {role === 'cashier' ? 'Kasir' : role}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@lunomi.local"
                  className="w-full px-4 py-3 rounded-xl text-sm transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'white'
                  }}
                />
              </div>

              <div className="mb-5">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 rounded-xl text-sm transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: 'white'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base opacity-50 hover:opacity-90 transition"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm mb-4 font-bold transition-all"
                style={{
                  background: 'linear-gradient(135deg, #C9A84C, #a8863a)',
                  color: '#0D3B4A',
                  boxShadow: '0 4px 20px rgba(201,168,76,0.3)',
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? (
                  <>
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Memverifikasi...
                  </>
                ) : (
                  'Masuk ke Lunomi'
                )}
              </button>

              {/* Demo Accounts */}
              <div className="rounded-xl p-3 text-xs" 
                   style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
                <div className="font-semibold mb-1.5" style={{ color: 'rgba(255,220,100,0.85)' }}>
                  Akun Demo — klik role untuk auto-isi
                </div>
                <div className="space-y-0.5" style={{ color: 'rgba(255,220,100,0.7)' }}>
                  <div>👤 owner@lunomi.local · demo123</div>
                  <div>📋 manager@lunomi.local · demo123</div>
                  <div>💳 kasir@lunomi.local · demo123</div>
                  <div>👨‍🍳 kitchen@lunomi.local · demo123</div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes drift {
          0%, 100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(30px,-20px) scale(1.05); }
          66% { transform: translate(-20px,15px) scale(0.97); }
        }
      `}</style>
    </div>
  );
}
