"use client"
import { useState } from 'react'
import { useLoginStore } from '@/src/store/useLoginStore'

export default function StepEmail() {
  const { setStep, setEmail } = useLoginStore()
  const [val, setVal] = useState('')

  return (
    <div>
      <h3 className="font-semibold mb-1" style={{ color: '#0F172A' }}>1. Masukkan Email</h3>
      <p className="text-sm mb-4" style={{ color: '#64748B' }}>Masukkan email akun bisnis yang terdaftar</p>
      <label className="text-sm font-medium block mb-1" style={{ color: '#0F172A' }}>Email</label>
      <div className="flex items-center border rounded-xl px-4 mb-3 focus-within:border-blue-500 transition" style={{ borderColor: '#E5E7EB' }}>
        <span className="mr-2 text-gray-400">✉️</span>
        <input
          className="w-full py-3 outline-none text-sm bg-transparent"
          placeholder="nama@bisnis.com"
          value={val}
          style={{ color: '#0F172A' }}
          onChange={(e) => { setVal(e.target.value); setEmail(e.target.value) }}
        />
      </div>
      <p className="text-xs mb-5" style={{ color: '#64748B' }}>
        🔒 Akun email ini digunakan untuk mengelola semua outlet bisnis Anda.
      </p>
      <button
        className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition hover:opacity-90"
        style={{ background: '#2563EB' }}
        onClick={() => setStep(2)}
      >
        Lanjutkan →
      </button>
    </div>
  )
}