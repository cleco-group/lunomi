"use client"
import { useState } from 'react'
import { supabase } from '@/src/lib/supabase'
import { useLoginStore } from '@/src/store/useLoginStore'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Lock } from 'lucide-react'

export default function StepPin() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { kasir, setStep } = useLoginStore()
  const router = useRouter()

  async function login() {
    if (pin.length < 5) {
      setError('PIN harus 5 digit.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('kasir')
        .select('id')
        .eq('id', kasir.id)
        .eq('pin', pin)
        .single()
      if (err || !data) {
        setError('PIN salah. Silakan coba lagi.')
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('Terjadi kesalahan. Periksa koneksi internet Anda.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h3 className="font-semibold text-gray-700 mb-1">4. Masukkan PIN / Scan</h3>
      <p className="text-sm text-gray-400 mb-6">Masukkan PIN atau scan barcode kasir untuk masuk</p>
      <div className="flex gap-3 justify-center mb-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`w-12 h-14 border-2 rounded-lg flex items-center justify-center text-2xl transition ${pin[i] ? 'border-blue-500' : 'border-gray-300'}`}>
            {pin[i] ? "•" : ""}
          </div>
        ))}
      </div>
      <input
        type="password"
        inputMode="numeric"
        maxLength={5}
        className="opacity-0 absolute pointer-events-none"
        value={pin}
        onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setError(null) }}
        id="pin-input"
      />
      <label htmlFor="pin-input" className="block text-center text-sm text-blue-600 cursor-pointer mb-4 underline">
        Ketuk di sini untuk input PIN
      </label>
      {error && (
        <div className="text-sm text-center mb-4 px-3 py-2 rounded-lg" style={{ color: '#FF4757', background: '#FFF1F2', border: '1px solid #FFD0D5' }}>{error}</div>
      )}
      <p className="text-xs text-gray-400 text-center mb-6">🔒 Pastikan tidak membagikan PIN atau barcode kepada siapapun.</p>
      <div className="flex gap-2">
        <button onClick={() => setStep(3)} className="flex-1 border py-3 rounded-lg flex items-center justify-center gap-2 text-sm hover:bg-gray-50">
          <ArrowLeft size={16} /> Kembali
        </button>
        <button
          onClick={login}
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-medium hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Lock size={16} /> {loading ? 'Memverifikasi...' : 'Masuk'}
        </button>
      </div>
    </div>
  )
}
