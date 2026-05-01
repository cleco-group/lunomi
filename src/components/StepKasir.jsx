"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/src/lib/supabase'
import { useLoginStore } from '@/src/store/useLoginStore'
import { Search, ArrowLeft, ArrowRight, User, CheckCircle2 } from 'lucide-react'

export default function StepKasir() {
  const { outlet, setKasir, setStep } = useLoginStore()
  const [data, setData] = useState([])
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!outlet?.id) return
    setLoading(true)
    setError(null)
    supabase
      .from('kasir')
      .select('id, name, outlet_id')
      .eq('outlet_id', outlet.id)
      .then(({ data: rows, error: err }) => {
        if (err) setError('Gagal memuat daftar kasir. Coba lagi.')
        else setData(rows || [])
        setLoading(false)
      })
  }, [outlet])

  const filtered = data.filter(k => k.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <h3 className="font-semibold mb-1" style={{ color: '#0F172A' }}>3. Pilih / Cari Kasir</h3>
      <p className="text-sm mb-4" style={{ color: '#64748B' }}>Pilih nama kasir yang akan menggunakan sistem</p>
      <div className="flex items-center border rounded-xl px-3 mb-3 focus-within:border-blue-500" style={{ borderColor: '#E5E7EB' }}>
        <Search size={16} className="text-gray-400 mr-2" />
        <input
          className="w-full py-2 outline-none text-sm bg-transparent"
          placeholder="Cari nama kasir..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {error && (
        <div className="text-sm mb-3 px-3 py-2 rounded-xl" style={{ color: '#FF4757', background: '#FFF1F2', border: '1px solid #FFD0D5' }}>{error}</div>
      )}
      <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
        {loading ? (
          <div className="text-center py-8 text-sm" style={{ color: '#64748B' }}>Memuat kasir...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-4 text-sm" style={{ color: '#64748B' }}>Tidak ada kasir ditemukan</div>
        ) : filtered.map((k) => (
          <div
            key={k.id}
            onClick={() => setSelected(k)}
            className="p-3 border rounded-xl cursor-pointer flex items-center gap-3 transition"
            style={{ borderColor: selected?.id === k.id ? '#2563EB' : '#E5E7EB', background: selected?.id === k.id ? '#EFF6FF' : 'white' }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#DBEAFE' }}>
              <User size={18} style={{ color: '#2563EB' }} />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm" style={{ color: '#0F172A' }}>{k.name}</div>
              <div className="text-xs" style={{ color: '#64748B' }}>Kasir</div>
            </div>
            {selected?.id === k.id && <CheckCircle2 size={20} style={{ color: '#2563EB' }} />}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={() => setStep(2)} className="flex-1 border py-3 rounded-xl flex items-center justify-center gap-2 text-sm hover:bg-gray-50" style={{ borderColor: '#E5E7EB' }}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <button
          onClick={() => { if (selected) { setKasir(selected); setStep(4) } }}
          className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition"
          style={{ background: selected ? '#2563EB' : '#E5E7EB', color: selected ? 'white' : '#94A3B8', cursor: selected ? 'pointer' : 'not-allowed' }}
        >
          Lanjutkan <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
