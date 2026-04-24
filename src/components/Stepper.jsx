"use client"
import { useLoginStore } from '@/src/store/useLoginStore'

const steps = [
  { label: "Email", icon: "✉️" },
  { label: "Pilih Outlet", icon: "🏢" },
  { label: "Pilih / Cari Kasir", icon: "👤" },
  { label: "PIN / Barcode", icon: "🔑" },
  { label: "Masuk", icon: "✅" },
]

export default function Stepper() {
  const { step } = useLoginStore()

  return (
    <div className="flex items-start justify-between w-full mb-6">
      {steps.map((s, i) => {
        const num = i + 1
        const done = step > num
        const active = step === num
        return (
          <div key={i} className="flex-1 flex flex-col items-center relative">
            {i < steps.length - 1 && (
              <div className="absolute top-5 left-1/2 w-full h-[2px] z-0" style={{ background: done ? '#2563EB' : '#E5E7EB' }} />
            )}
            <div className="w-10 h-10 rounded-full flex items-center justify-center z-10 text-sm font-bold border-2 transition-all" style={{
              background: done ? '#2563EB' : active ? '#FFFFFF' : '#FFFFFF',
              borderColor: done || active ? '#2563EB' : '#E5E7EB',
              color: done ? '#FFFFFF' : active ? '#2563EB' : '#64748B',
            }}>
              {done ? '✓' : num}
            </div>
            <span className="text-xs mt-2 text-center leading-tight" style={{
              color: active ? '#2563EB' : done ? '#2563EB' : '#64748B',
              fontWeight: active ? 600 : 400,
            }}>
              {s.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}