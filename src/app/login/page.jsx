"use client"
import { useLoginStore } from '@/src/store/useLoginStore'
import StepEmail from '@/src/components/StepEmail'
import StepOutlet from '@/src/components/StepOutlet'
import StepKasir from '@/src/components/StepKasir'
import StepPin from '@/src/components/StepPin'
import Stepper from '@/src/components/Stepper'

export default function Login() {
  const { step } = useLoginStore()

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#F8FAFC' }}>
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT */}
        <div className="hidden lg:flex w-5/12 flex-col p-8 text-white overflow-y-auto" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563EB 100%)' }}>

          {/* Logo */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-lg" style={{ background: 'linear-gradient(135deg, #2563EB, #7C6BFF)' }}>
              L
            </div>
            <div>
              <div className="font-bold text-lg leading-tight">Lunomi</div>
              <div className="text-xs" style={{ color: '#F0A500' }}>POS PINTAR</div>
            </div>
          </div>

          <h2 className="text-base font-bold mb-2 leading-snug">
            Sistem POS & Manajemen Bisnis Terintegrasi untuk Semua Outlet Anda
          </h2>
          <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Kelola penjualan, stok, resep, keuangan, karyawan hingga laporan bisnis secara real-time dalam satu sistem yang mudah, cepat dan akurat.
          </p>

          <div className="space-y-2 mb-5">
            {[
              { icon: '📊', label: 'Kontrol Bisnis Real-time' },
              { icon: '📦', label: 'Stok & Resep Otomatis' },
              { icon: '👥', label: 'Karyawan & Payroll Terintegrasi' },
              { icon: '🔒', label: 'Aman & Backup Otomatis' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '16px', lineHeight: 1 }}>{f.icon}</span>
                <span className="text-xs font-medium">{f.label}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mt-auto">
            {[
              { value: '1', label: 'Akun Email' },
              { value: '10-50', label: 'Outlet per akun', color: '#F0A500' },
              { value: '✓', label: 'Aman & Terpercaya' },
            ].map((s, i) => (
              <div key={i} className="text-center rounded-xl p-2" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div className="font-bold text-sm" style={{ color: s.color || 'white' }}>{s.value}</div>
                <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
          <div className="w-full max-w-lg">

            {/* Top right info */}
            <div className="flex justify-between items-center mb-6">
              <div className="lg:hidden">
                <span className="font-bold text-lg" style={{ color: '#2563EB' }}>Lunomi</span>
                <span className="text-xs ml-1" style={{ color: '#F0A500' }}>POS PINTAR</span>
              </div>
              <div className="ml-auto text-right">
                <div className="text-xs font-medium" style={{ color: '#0F172A' }}>Multi Outlet</div>
                <div className="text-xs" style={{ color: '#64748B' }}>1 email kelola 10–50 outlet</div>
              </div>
            </div>

            <h1 className="text-xl font-bold mb-1" style={{ color: '#0F172A' }}>Login Kasir</h1>
            <p className="text-xs mb-5" style={{ color: '#64748B' }}>Silakan masuk untuk melanjutkan</p>

            <Stepper />

            <div className="bg-white rounded-2xl shadow-sm border p-5" style={{ borderColor: '#E5E7EB' }}>
              {step === 1 && <StepEmail />}
              {step === 2 && <StepOutlet />}
              {step === 3 && <StepKasir />}
              {step === 4 && <StepPin />}
            </div>
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="border-t py-2 px-8 flex justify-center gap-6 text-xs flex-shrink-0" style={{ borderColor: '#E5E7EB', color: '#64748B', background: '#FFFFFF' }}>
        {['☁️ Real-time Data', '🤖 AI Powered', '🏢 Multi Outlet', '🔒 Secure & Reliable', '📈 Scalable'].map((f, i) => (
          <span key={i}>{f}</span>
        ))}
      </div>
    </div>
  )
}