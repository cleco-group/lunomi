"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/src/lib/supabase'
import { useLoginStore } from '@/src/store/useLoginStore'
import { Search, ArrowLeft, ArrowRight, Building2, CheckCircle2 } from 'lucide-react'

export default function StepOutlet() {
  const { setStep, setOutlet } = useLoginStore()
  const [data, setData] = useState([])
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    supabase
      .from('outlets')
      .select('id, name, address, is_active')
      .eq('is_active', true)
      .then(({ data: rows, error: err }) => {
        if (err) setError('Gagal memuat daftar outlet. Coba lagi.')
        else setData(rows || [])
        setLoading(false)
      })
  }, [])

  const filtered = data.filter(o => o.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <h3 className="font-semibold text-gray-700 mb-1">2. Pilih Outlet</h3>
      <p className="text-sm text-gray-400 mb-4">Pilih outlet yang ingin Anda gunakan</p>
      <div className="flex items-center border rounded-lg px-3 mb-3 focus-within:border-blue-500">
        <Search size={16} className="text-gray-400 mr-2" />
        <input
          className="w-full py-2 outline-none text-sm"
          placeholder="Cari outlet..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {error && (
        <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">{error}</div>
      )}
      <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
        {loading ? (
          <div className="text-center py-8 text-sm text-gray-400">Memuat outlet...</div>
        ) : filtered.map((o) => (
          <div
            key={o.id}
            onClick={() => setSelected(o)}
            className={`p-3 border rounded-lg cursor-pointer flex items-center gap-3 transition ${selected?.id === o.id ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-300'}`}
          >
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Building2 size={18} className="text-gray-500" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">{o.name}</div>
              <div className="text-xs text-gray-400">{o.address}</div>
            </div>
            {selected?.id === o.id && <CheckCircle2 size={20} className="text-blue-600" />}
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mb-4">Total {data.length} Outlet</p>
      <div className="flex gap-2">
        <button onClick={() => setStep(1)} className="flex-1 border py-3 rounded-lg flex items-center justify-center gap-2 text-sm hover:bg-gray-50">
          <ArrowLeft size={16} /> Kembali
        </button>
        <button
          onClick={() => { if (selected) { setOutlet(selected); setStep(3) } }}
          className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition ${selected ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
        >
          Lanjutkan <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}