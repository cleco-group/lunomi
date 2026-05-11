import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Outlet {
  id: string;
  name: string;
  address: string;
  icon: string;
  color: string;
}

interface FormData {
  outlet: Outlet | null;
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const OUTLETS: Outlet[] = [
  { id: 'outlet_cleco_pii', name: 'Cleco Pii', address: 'Jl. Sudirman No. 12', icon: '🏪', color: 'rgba(99,102,241,0.2)' },
  { id: 'outlet_resep_bunce', name: 'Resep Bunce', address: 'Jl. Gatot Subroto No. 5', icon: '🍳', color: 'rgba(245,158,11,0.2)' },
  { id: 'outlet_baby_joy', name: 'Baby Joy', address: 'Jl. Thamrin No. 8', icon: '🍼', color: 'rgba(236,72,153,0.2)' },
];

export default function Register() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    outlet: null,
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const calculatePasswordStrength = (password: string): number => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const getPasswordStrengthLabel = (score: number): string => {
    const labels = ['Terlalu pendek', 'Lemah', 'Cukup', 'Kuat 💪'];
    return score > 0 ? labels[score - 1] : 'Masukkan password';
  };

  const getPasswordStrengthColor = (score: number): string => {
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
    return score > 0 ? colors[score - 1] : 'rgba(255,255,255,0.3)';
  };

  const passwordStrength = calculatePasswordStrength(formData.password);

  const selectOutlet = (outlet: Outlet) => {
    setFormData({ ...formData, outlet });
  };

  const goToStep2 = () => {
    if (!formData.outlet) {
      toast.error('Pilih outlet terlebih dahulu');
      return;
    }
    setCurrentStep(2);
  };

  const goToStep3 = () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error('Nama lengkap harus diisi');
      return;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Format email tidak valid');
      return;
    }
    if (!formData.phone.trim() || !/^08\d{8,11}$/.test(formData.phone)) {
      toast.error('Format HP tidak valid. Contoh: 0812xxxxxxxx');
      return;
    }
    if (formData.password.length < 8) {
      toast.error('Password minimal 8 karakter');
      return;
    }
    if (!/[A-Z]/.test(formData.password)) {
      toast.error('Password harus mengandung huruf kapital');
      return;
    }
    if (!/[0-9]/.test(formData.password)) {
      toast.error('Password harus mengandung angka');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Konfirmasi password tidak cocok');
      return;
    }
    setCurrentStep(3);
  };

  const submitRegistration = async () => {
    setLoading(true);
    
    setTimeout(() => {
      const registrations = JSON.parse(localStorage.getItem('lunomi_registrations') || '[]');
      registrations.push({
        outlet: formData.outlet,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: 'admin',
        status: 'active',
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('lunomi_registrations', JSON.stringify(registrations));
      
      setLoading(false);
      setShowSuccessModal(true);
      toast.success('Pendaftaran berhasil!');
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative"
         style={{
           background: '#020617',
           backgroundImage: 'radial-gradient(ellipse 80% 60% at 20% 0%, rgba(99,102,241,0.35) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 100%, rgba(59,130,246,0.3) 0%, transparent 60%)'
         }}>
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3 shadow-lg"
               style={{
                 background: 'rgba(255,255,255,0.07)',
                 backdropFilter: 'blur(20px)',
                 border: '1px solid rgba(255,255,255,0.12)'
               }}>
            <span className="text-2xl">🏪</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Daftar Outlet Baru</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Bergabung dengan ekosistem Lunomi POS
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-0 mb-6">
          {[1, 2, 3].map((step, idx) => (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    background: step < currentStep ? 'linear-gradient(135deg, #6366f1, #4f46e5)' :
                                step === currentStep ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.08)',
                    border: step === currentStep ? '2px solid #6366f1' : '2px solid rgba(255,255,255,0.15)',
                    color: step <= currentStep ? '#a5b4fc' : 'rgba(255,255,255,0.35)'
                  }}
                >
                  {step < currentStep ? '✓' : step}
                </div>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {step === 1 ? 'Outlet' : step === 2 ? 'Data Admin' : 'Review'}
                </span>
              </div>
              {idx < 2 && (
                <div className="h-0.5 w-16 mx-1 mb-4 transition-all"
                     style={{
                       background: step < currentStep ? 'linear-gradient(90deg, #6366f1, #4f46e5)' : 'rgba(255,255,255,0.15)'
                     }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Select Outlet */}
        {currentStep === 1 && (
          <div className="rounded-3xl p-7 shadow-2xl"
               style={{
                 background: 'rgba(255,255,255,0.07)',
                 backdropFilter: 'blur(20px)',
                 border: '1px solid rgba(255,255,255,0.12)'
               }}>
            <h2 className="font-bold text-white mb-1">Pilih Outlet</h2>
            <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Pilih outlet tempat kamu akan menjadi admin
            </p>
            <div className="space-y-3">
              {OUTLETS.map((outlet) => (
                <div
                  key={outlet.id}
                  onClick={() => selectOutlet(outlet)}
                  className="rounded-2xl p-4 flex items-center gap-3 cursor-pointer transition-all"
                  style={{
                    background: formData.outlet?.id === outlet.id ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                    border: formData.outlet?.id === outlet.id ? '1.5px solid rgba(99,102,241,0.7)' : '1.5px solid rgba(255,255,255,0.1)',
                    boxShadow: formData.outlet?.id === outlet.id ? '0 0 16px rgba(99,102,241,0.25)' : 'none'
                  }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                       style={{ background: outlet.color }}>
                    {outlet.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-white text-sm">{outlet.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {outlet.address}
                    </div>
                  </div>
                  {formData.outlet?.id === outlet.id && (
                    <div className="text-indigo-400 text-lg">✓</div>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={goToStep2}
              className="w-full py-3 rounded-xl text-sm mt-5 font-bold text-white transition-all"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                boxShadow: '0 4px 20px rgba(99,102,241,0.4)'
              }}
            >
              Lanjut →
            </button>
            <p className="text-center mt-3 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Sudah punya akun?{' '}
              <button onClick={() => navigate('/login')} className="text-indigo-400 hover:underline">
                Masuk
              </button>
            </p>
          </div>
        )}

        {/* Step 2: Admin Data */}
        {currentStep === 2 && (
          <div className="rounded-3xl p-7 shadow-2xl"
               style={{
                 background: 'rgba(255,255,255,0.07)',
                 backdropFilter: 'blur(20px)',
                 border: '1px solid rgba(255,255,255,0.12)'
               }}>
            <h2 className="font-bold text-white mb-1">Data Admin</h2>
            <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Buat akun admin untuk outlet{' '}
              <span className="text-indigo-400 font-semibold">{formData.outlet?.name}</span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  placeholder="Nama lengkap admin"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.15)'
                  }}
                />
              </div>

              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Email
                </label>
                <input
                  type="email"
                  placeholder="admin@outlet.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.15)'
                  }}
                />
              </div>

              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Nomor HP
                </label>
                <input
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.15)'
                  }}
                />
              </div>

              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 karakter, huruf besar & angka"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 pr-12 rounded-xl text-sm text-white transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.15)'
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
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-1 flex-1 rounded-sm transition-all"
                      style={{
                        background: i <= passwordStrength ? getPasswordStrengthColor(passwordStrength) : 'rgba(255,255,255,0.1)'
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs mt-1" style={{ color: getPasswordStrengthColor(passwordStrength) }}>
                  {getPasswordStrengthLabel(passwordStrength)}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Ulangi password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 pr-12 rounded-xl text-sm text-white transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.15)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base opacity-50 hover:opacity-90 transition"
                  >
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setCurrentStep(1)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.7)'
                }}
              >
                ← Kembali
              </button>
              <button
                onClick={goToStep3}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
              >
                Review →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <div className="rounded-3xl p-7 shadow-2xl"
               style={{
                 background: 'rgba(255,255,255,0.07)',
                 backdropFilter: 'blur(20px)',
                 border: '1px solid rgba(255,255,255,0.12)'
               }}>
            <h2 className="font-bold text-white mb-1">Review & Konfirmasi</h2>
            <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Periksa data sebelum mendaftar
            </p>

            <div className="space-y-3 mb-5">
              <div className="rounded-xl p-4"
                   style={{
                     background: 'rgba(255,255,255,0.05)',
                     border: '1px solid rgba(255,255,255,0.1)'
                   }}>
                <p className="text-xs font-semibold mb-2 uppercase tracking-widest"
                   style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Outlet
                </p>
                <p className="text-white font-semibold text-sm">{formData.outlet?.name}</p>
              </div>

              <div className="rounded-xl p-4 space-y-2"
                   style={{
                     background: 'rgba(255,255,255,0.05)',
                     border: '1px solid rgba(255,255,255,0.1)'
                   }}>
                <p className="text-xs font-semibold mb-2 uppercase tracking-widest"
                   style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Data Admin
                </p>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Nama</span>
                  <span className="text-white font-medium">{formData.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Email</span>
                  <span className="text-white font-medium">{formData.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>HP</span>
                  <span className="text-white font-medium">{formData.phone}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Password</span>
                  <span className="text-white font-medium">••••••••</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep(2)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.7)'
                }}
              >
                ← Edit
              </button>
              <button
                onClick={submitRegistration}
                disabled={loading}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
              </button>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
               style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
            <div className="rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
                 style={{
                   background: 'rgba(255,255,255,0.07)',
                   backdropFilter: 'blur(20px)',
                   border: '1px solid rgba(255,255,255,0.12)'
                 }}>
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-xl font-extrabold text-white mb-2">Pendaftaran Berhasil!</h2>
              <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Akun admin telah dibuat untuk
              </p>
              <p className="font-bold text-indigo-400 mb-4">{formData.outlet?.name}</p>
              <div className="rounded-xl p-3 text-xs mb-5 text-left space-y-1"
                   style={{
                     background: 'rgba(34,197,94,0.1)',
                     border: '1px solid rgba(34,197,94,0.3)',
                     color: '#86efac'
                   }}>
                <div className="flex justify-between">
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Email</span>
                  <span className="font-semibold">{formData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Role</span>
                  <span className="font-semibold">Admin Outlet</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Status</span>
                  <span className="font-semibold text-green-400">Aktif</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
              >
                Lanjut ke Login →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
