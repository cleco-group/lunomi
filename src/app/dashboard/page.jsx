"use client"
import { useLoginStore } from '@/src/store/useLoginStore'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import {
  LayoutDashboard, FileText, Building2, Wallet, Settings2,
  Users, Megaphone, Package, BarChart2, Brain, CheckSquare,
  Bell, Settings, ShoppingCart, Clock, ChevronDown,
  Wifi, LogOut, Search, Zap, Monitor, Coffee, MousePointer2,
  Palette, Share2, Terminal, Cpu
} from 'lucide-react'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard Owner', active: true },
  { icon: FileText, label: 'Ringkasan Bisnis' },
  { icon: Building2, label: 'Outlet & Cabang' },
  { icon: Wallet, label: 'Keuangan', hasChild: true },
  { icon: Settings2, label: 'Operasional', hasChild: true },
  { icon: Users, label: 'Absensi & Payroll' },
  { icon: Users, label: 'Karyawan & Role' },
  { icon: Megaphone, label: 'Marketing & Promo' },
  { icon: Package, label: 'Produk & Inventory', hasChild: true },
  { icon: BarChart2, label: 'Laporan & Analitik' },
  { icon: Brain, label: 'AI Insight' },
  { icon: CheckSquare, label: 'Approval Center', badge: 12 },
  { icon: Bell, label: 'Notifikasi & Alert' },
  { icon: Settings, label: 'Pengaturan' },
]

const stats = [
  { icon: '💰', label: 'TOTAL REVENUE HARI INI', value: 'Rp 45.230.000', change: '↑ 12.5% dari kemarin', color: '#00E5A0', up: true },
  { icon: '🏢', label: 'TOTAL OUTLET', value: '18', sub: 'Aktif 17 | Nonaktif 1', color: '#2563EB', up: null },
  { icon: '📈', label: 'LABA BERSIH HARI INI', value: 'Rp 8.450.000', change: '↑ 15.2% dari kemarin', color: '#00E5A0', up: true },
  { icon: '👥', label: 'TOTAL KARYAWAN', value: '156', sub: 'Hadir 142 | Tidak Hadir 14', color: '#7C6BFF', up: null },
  { icon: '🛒', label: 'PENJUALAN BULAN INI', value: 'Rp 1.256.800.000', change: '↑ 11.8% dari bulan lalu', color: '#F0A500', up: true },
  { icon: '⭐', label: 'RATING OUTLET', value: '4.7 / 5.0', sub: 'Dari 2.345 review', color: '#F0A500', up: null },
]

const bottomStats = [
  { icon: '🛒', label: 'Transaksi Aktif', value: '128', sub: 'Sedang berlangsung' },
  { icon: '⏰', label: 'Order Pending', value: '34', sub: 'Menunggu diproses' },
  { icon: '🪑', label: 'Meja Terpakai', value: '86 / 120', sub: '71.6%' },
  { icon: '📊', label: 'Rata-rata Penjualan / Struk', value: 'Rp 58.230', sub: '↑ 8.4%' },
  { icon: '👤', label: 'Customer Hari Ini', value: '1.245', sub: '↑ 14.2%' },
  { icon: '🔄', label: 'Repeat Customer', value: '42.3%', sub: '↑ 5.6%' },
  { icon: '⭐', label: 'Rating Hari Ini', value: '4.7', sub: 'Dari 2.345 review' },
  { icon: '🔁', label: 'Data Sync', value: '100%', sub: 'Semua sistem normal' },
]

export default function Dashboard() {
  const { kasir, outlet, reset } = useLoginStore()
  const router = useRouter()

  useEffect(() => {
    if (!kasir) router.push('/login')
  }, [kasir])

  function handleLogout() {
    reset()
    router.push('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F1F5F9]" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px' }}>

      {/* SIDEBAR */}
      <div className="flex flex-col w-56 flex-shrink-0 overflow-y-auto shadow-2xl z-50" style={{ background: '#0F172A', color: 'white' }}>
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-black text-xl shadow-lg">L</div>
            <div>
              <div className="font-black text-lg leading-none">Lunomi</div>
              <div className="text-[10px] font-bold text-orange-400 tracking-widest uppercase">POS PINTAR</div>
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full border-2 border-green-400 p-0.5 shadow-lg">
              <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=Andi" className="w-full h-full rounded-full bg-slate-800" alt="avatar" />
            </div>
            <div>
              <div className="font-black text-sm">Andi Setiawan</div>
              <div className="text-[10px] text-slate-400 font-bold">Owner / CEO</div>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>
            <span className="text-[10px] font-black text-green-400 uppercase">Online</span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium">Shift #SR24050101</div>
          <div className="text-[10px] text-slate-500 font-medium">09:00 - 21:00</div>
        </div>

        <nav className="flex-1 py-4">
          {menuItems.map((item, i) => (
            <div key={i} className={`flex items-center justify-between px-6 py-3 cursor-pointer transition-all ${item.active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}
              style={{ borderRadius: item.active ? '0 30px 30px 0' : '0', marginRight: item.active ? '15px' : '0' }}>
              <div className="flex items-center gap-4">
                <item.icon size={18} className={item.active ? 'text-white' : 'text-slate-500'} />
                <span className="text-xs font-black uppercase tracking-wide">{item.label}</span>
              </div>
              {item.badge && <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg">{item.badge}</span>}
            </div>
          ))}
        </nav>

        <div className="p-4 space-y-3 border-t border-white/10">
          <div className="bg-indigo-600/20 border border-indigo-500/30 rounded-2xl p-4 cursor-pointer hover:bg-indigo-600/30 transition-all group">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><Brain size={16} /></div>
              <span className="font-black text-xs">Tanya CEO</span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold">Chat dengan AI Assistant</p>
          </div>
          <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-4 cursor-pointer hover:bg-slate-800/80 transition-all group">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><Zap size={16} /></div>
              <span className="font-black text-xs">Instruksi Cepat</span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold">Beri Tugas ke AI / Tim</p>
          </div>
          <div className="flex justify-between text-[10px] text-slate-600 font-bold px-2">
            <span>Lunomi POS Pintar</span>
            <span>v1.0.0</span>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="h-20 bg-white border-b-2 border-slate-200 flex items-center justify-between px-8 shadow-sm z-40">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">👑</span>
              <h1 className="font-black text-2xl text-slate-900 tracking-tight">DASHBOARD OWNER</h1>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pusat Kendali & Pengambilan Keputusan Bisnis - Lunomi Group</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-slate-50 border-2 border-slate-200 rounded-2xl px-5 py-2.5 cursor-pointer hover:bg-slate-100 transition-all">
              <Building2 size={18} className="text-blue-600" />
              <span className="font-black text-sm text-slate-900">Lunomi Coffee Senopati</span>
              <ChevronDown size={18} className="text-slate-400" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
              <span className="font-black text-sm text-green-600 uppercase">Online</span>
            </div>
            <div className="relative cursor-pointer group">
              <div className="p-3 bg-slate-50 rounded-2xl border-2 border-slate-200 group-hover:bg-slate-100 transition-all">
                <Bell size={22} className="text-slate-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white shadow-lg">8</div>
            </div>
            <div className="text-right border-l-2 border-slate-200 pl-6">
              <div className="font-black text-sm text-slate-900">Rabu, 1 Mei 2024</div>
              <div className="font-bold text-xs text-slate-500">10:30:45</div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STATS */}
          <div className="grid grid-cols-6 gap-4">
            {stats.map((s, i) => (
              <div key={i} className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner" style={{ background: s.color + '15' }}>{s.icon}</div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{s.label}</span>
                    <div className="font-black text-lg text-slate-900 leading-none">{s.value}</div>
                  </div>
                </div>
                {s.change && (
                  <div className={`text-[11px] font-black flex items-center gap-2 ${s.up ? 'text-emerald-500' : 'text-red-500'}`}>
                    {s.change}
                    {s.up && <div className="w-12 h-2 bg-emerald-100 rounded-full overflow-hidden relative"><div className="absolute inset-0 bg-emerald-500 w-2/3"></div></div>}
                  </div>
                )}
                {s.sub && <div className="text-[11px] font-bold text-slate-400 mt-1.5">{s.sub}</div>}
              </div>
            ))}
          </div>

          {/* COMMAND CENTER - V4 COMPLETE PIXEL ART ROOM */}
          <div className="relative w-full aspect-[21/9] bg-[#1a202c] rounded-[40px] overflow-hidden border-[8px] border-[#2d3748] shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            
            {/* Room Background */}
            <div className="absolute inset-0">
              {/* Wall */}
              <div className="absolute top-0 left-0 right-0 h-[65%] bg-[#2d3748] border-b-[6px] border-[#1a202c]">
                {/* Wall Panels */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(90deg, transparent 98%, #000 98%)', backgroundSize: '80px 100%' }}></div>
                {/* Posters */}
                <div className="absolute top-16 left-1/4 w-16 h-20 bg-blue-900/40 border-2 border-white/10 rounded p-1 flex flex-col gap-1">
                  <div className="h-1 w-full bg-white/20"></div><div className="h-1 w-2/3 bg-white/20"></div><div className="flex-1 bg-blue-400/20"></div>
                </div>
                <div className="absolute top-16 right-1/4 w-20 h-16 bg-emerald-900/40 border-2 border-white/10 rounded p-1 flex flex-col gap-1">
                  <div className="h-1 w-full bg-white/20"></div><div className="flex-1 bg-emerald-400/20"></div>
                </div>
              </div>
              {/* Floor */}
              <div className="absolute bottom-0 left-0 right-0 h-[35%] bg-[#4a5568]">
                <div className="absolute inset-0" style={{ 
                  backgroundImage: 'linear-gradient(#2d3748 2px, transparent 2px), linear-gradient(90deg, #2d3748 2px, transparent 2px)', 
                  backgroundSize: '80px 80px', transform: 'perspective(800px) rotateX(55deg)', transformOrigin: 'top', opacity: 0.4
                }}></div>
              </div>
            </div>

            {/* Header Title */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50">
              <div className="bg-black/60 backdrop-blur-xl px-12 py-3 rounded-full border-2 border-white/10 shadow-2xl">
                <h2 className="text-white font-black text-3xl tracking-[0.4em] uppercase italic" style={{ textShadow: '4px 4px 0 #000' }}>LUNOMI COMMAND CENTER</h2>
              </div>
            </div>

            {/* ALL ZONES - 6 ZONES + CEO */}
            <div className="absolute inset-0 z-10 p-10 grid grid-cols-3 grid-rows-2 gap-x-16 gap-y-8">
              
              {/* 1. FINANCE ZONE (Top Left) */}
              <div className="relative group">
                <div className="bg-emerald-600 px-4 py-1 rounded-t-xl text-[11px] font-black text-white shadow-lg inline-block italic uppercase tracking-wider">Finance Zone</div>
                <div className="bg-[#1a202c]/95 border-2 border-[#4a5568] rounded-r-2xl rounded-bl-2xl p-4 shadow-2xl backdrop-blur-md flex gap-4">
                  <div className="w-32 h-24 bg-black/60 rounded-xl border border-white/5 p-2 flex items-end gap-1 shadow-inner">
                    {[40, 70, 50, 90, 60, 85].map((h, i) => <div key={i} className="flex-1 bg-emerald-400/80 rounded-t-sm" style={{ height: h + '%' }}></div>)}
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=Fin" className="w-16 h-16 mb-1 drop-shadow-lg" alt="Fin AI" />
                    <div className="text-xs font-black text-white">Fin AI</div>
                    <div className="text-[8px] text-emerald-400 font-black uppercase tracking-tighter">Cashflow & Profit</div>
                  </div>
                </div>
                <div className="w-full h-4 bg-[#2d3748] rounded-b-2xl shadow-2xl"></div>
              </div>

              {/* 2. CEO HUB (Center - Spans 2 rows) */}
              <div className="row-span-2 flex flex-col items-center justify-end pb-6">
                {/* Main Screen */}
                <div className="w-full aspect-video bg-black rounded-3xl border-[6px] border-[#4a5568] p-4 shadow-[0_0_80px_rgba(37,99,235,0.25)] relative overflow-hidden mb-8">
                  <div className="flex h-full gap-4">
                    <div className="w-1/3 flex flex-col gap-3">
                      <div className="flex-1 bg-[#1a202c] rounded-2xl border border-white/10 p-3 flex flex-col justify-center shadow-inner">
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Revenue</div>
                        <div className="text-lg font-black text-white">Rp 45.2M</div>
                        <div className="text-[10px] text-emerald-400 font-black">↑ 12.5%</div>
                      </div>
                      <div className="flex-1 bg-[#1a202c] rounded-2xl border border-white/10 p-3 flex flex-col justify-center shadow-inner">
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Trans</div>
                        <div className="text-lg font-black text-white">3.245</div>
                        <div className="text-[10px] text-emerald-400 font-black">↑ 9.8%</div>
                      </div>
                    </div>
                    <div className="flex-1 bg-[#1a202c] rounded-2xl border border-white/10 relative overflow-hidden shadow-inner">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Indonesia_provinces_blank.png/640px-Indonesia_provinces_blank.png" className="absolute inset-0 w-full h-full object-contain opacity-40 invert scale-110" alt="map" />
                      <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/80 px-3 py-1.5 rounded-full border border-white/20">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                        <span className="text-[9px] font-black text-white tracking-[0.2em]">LIVE SYSTEM</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* CEO & Desk */}
                <div className="relative w-full flex justify-center">
                  <div className="absolute -top-24 -right-16 bg-white px-6 py-4 rounded-[30px] shadow-2xl border-2 border-slate-100 z-50 w-64">
                    <p className="text-xs font-black text-slate-800 leading-relaxed italic">"Semua bisnis terkendali, semua data jadi keputusan strategis."</p>
                    <div className="absolute -bottom-3 left-10 w-6 h-6 bg-white border-r-2 border-b-2 border-slate-100 rotate-45"></div>
                  </div>
                  <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=Andi&flip=true" className="w-32 h-32 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] relative z-40" alt="CEO" />
                  <div className="absolute bottom-0 w-64 h-20 bg-[#2d3748] rounded-t-[30px] border-t-8 border-[#4a5568] z-30 shadow-2xl flex justify-center items-start pt-4 gap-6">
                    <div className="w-12 h-2 bg-black/40 rounded-full"></div><div className="w-20 h-2 bg-black/40 rounded-full"></div>
                  </div>
                </div>
                <div className="bg-black/90 px-10 py-2.5 rounded-full mt-4 z-50 border-4 border-[#4a5568] shadow-2xl">
                  <div className="text-xs font-black text-white tracking-[0.3em] uppercase italic">CEO Andi Setiawan</div>
                </div>
              </div>

              {/* 3. OPERATIONS ZONE (Top Right) */}
              <div className="relative group">
                <div className="flex justify-end">
                  <div className="bg-blue-600 px-4 py-1 rounded-t-xl text-[11px] font-black text-white shadow-lg inline-block italic uppercase tracking-wider">Operations Zone</div>
                </div>
                <div className="bg-[#1a202c]/95 border-2 border-[#4a5568] rounded-l-2xl rounded-br-2xl p-4 shadow-2xl backdrop-blur-md flex gap-4">
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=Ops" className="w-16 h-16 mb-1 drop-shadow-lg" alt="Ops AI" />
                    <div className="text-xs font-black text-white">Ops AI</div>
                    <div className="text-[8px] text-blue-400 font-black uppercase tracking-tighter">Kitchen & Orders</div>
                  </div>
                  <div className="w-32 h-24 grid grid-cols-2 grid-rows-2 gap-2">
                    {[1,2,3,4].map(i => <div key={i} className="bg-black/60 rounded-lg border border-white/5 flex items-center justify-center relative overflow-hidden shadow-inner">
                      <div className="absolute inset-0 bg-blue-500/5 animate-pulse"></div><Monitor size={16} className="text-blue-400/20" />
                    </div>)}
                  </div>
                </div>
                <div className="w-full h-4 bg-[#2d3748] rounded-b-2xl shadow-2xl"></div>
              </div>

              {/* 4. HR & PAYROLL ZONE (Bottom Left) */}
              <div className="relative group">
                <div className="bg-red-600 px-4 py-1 rounded-t-xl text-[11px] font-black text-white shadow-lg inline-block italic uppercase tracking-wider">HR & Payroll Zone</div>
                <div className="bg-[#1a202c]/95 border-2 border-[#4a5568] rounded-r-2xl rounded-bl-2xl p-4 shadow-2xl backdrop-blur-md flex gap-4">
                  <div className="w-32 h-24 bg-black/60 rounded-xl border border-white/5 p-4 flex flex-col items-center justify-center shadow-inner">
                    <div className="text-[9px] font-black text-slate-500 mb-1 tracking-widest">STAFF</div>
                    <div className="text-2xl font-black text-emerald-400 leading-none">142/156</div>
                    <div className="text-[9px] font-black text-slate-400 mt-2">91.0% ACTIVE</div>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=HR" className="w-16 h-16 mb-1 drop-shadow-lg" alt="HR AI" />
                    <div className="text-xs font-black text-white">HR AI</div>
                    <div className="text-[8px] text-red-400 font-black uppercase tracking-tighter">Staff Performance</div>
                  </div>
                </div>
                <div className="w-full h-4 bg-[#2d3748] rounded-b-2xl shadow-2xl"></div>
              </div>

              {/* 5. MARKETING ZONE (Right Middle - Positioned manually) */}
              <div className="absolute top-[40%] right-10 w-72 z-20">
                <div className="flex justify-end">
                  <div className="bg-purple-600 px-4 py-1 rounded-t-xl text-[11px] font-black text-white shadow-lg inline-block italic uppercase tracking-wider">Marketing Zone</div>
                </div>
                <div className="bg-[#1a202c]/95 border-2 border-[#4a5568] rounded-l-2xl rounded-br-2xl p-4 shadow-2xl backdrop-blur-md flex gap-4">
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=Mkt" className="w-16 h-16 mb-1 drop-shadow-lg" alt="Mkt AI" />
                    <div className="text-xs font-black text-white">Mkt AI</div>
                    <div className="text-[8px] text-purple-400 font-black uppercase tracking-tighter">Campaign & Promo</div>
                  </div>
                  <div className="w-32 h-24 bg-black/60 rounded-xl border border-white/5 p-3 flex flex-col justify-center shadow-inner">
                    <div className="text-[8px] font-black text-slate-500 mb-1">CONVERSION</div>
                    <div className="text-xl font-black text-purple-400">8.7%</div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden"><div className="h-full bg-purple-500 w-[65%]"></div></div>
                  </div>
                </div>
                <div className="w-full h-4 bg-[#2d3748] rounded-b-2xl shadow-2xl"></div>
              </div>

              {/* 6. IT & SYSTEM ZONE (Bottom Right) */}
              <div className="relative group">
                <div className="flex justify-end">
                  <div className="bg-slate-600 px-4 py-1 rounded-t-xl text-[11px] font-black text-white shadow-lg inline-block italic uppercase tracking-wider">IT & System Zone</div>
                </div>
                <div className="bg-[#1a202c]/95 border-2 border-[#4a5568] rounded-l-2xl rounded-br-2xl p-4 shadow-2xl backdrop-blur-md flex gap-4">
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=IT" className="w-16 h-16 mb-1 drop-shadow-lg" alt="IT AI" />
                    <div className="text-xs font-black text-white">IT AI</div>
                    <div className="text-[8px] text-slate-400 font-black uppercase tracking-tighter">Server Security</div>
                  </div>
                  <div className="w-32 h-24 bg-black/60 rounded-xl border border-white/5 p-3 font-mono text-[8px] text-emerald-500 overflow-hidden shadow-inner">
                    <div className="animate-pulse">
                      {">"} SYSTEM_BOOT... OK<br/>{">"} NETWORK_SCAN... 100%<br/>{">"} SECURITY_WALL... ACTIVE<br/>{">"} ALL_SYSTEMS_GO
                    </div>
                  </div>
                </div>
                <div className="w-full h-4 bg-[#2d3748] rounded-b-2xl shadow-2xl"></div>
              </div>

              {/* 7. DESIGN & CREATIVE ZONE (Bottom Right - Positioned manually) */}
              <div className="absolute bottom-10 right-[35%] w-64 z-20">
                <div className="bg-orange-600 px-4 py-1 rounded-t-xl text-[11px] font-black text-white shadow-lg inline-block italic uppercase tracking-wider">Design Zone</div>
                <div className="bg-[#1a202c]/95 border-2 border-[#4a5568] rounded-r-2xl rounded-bl-2xl p-4 shadow-2xl backdrop-blur-md flex gap-4">
                  <div className="w-24 h-20 bg-black/60 rounded-xl border border-white/5 p-2 flex items-center justify-center shadow-inner">
                    <Palette size={24} className="text-orange-400/40" />
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=Des" className="w-14 h-14 mb-1 drop-shadow-lg" alt="Des AI" />
                    <div className="text-xs font-black text-white">Des AI</div>
                    <div className="text-[8px] text-orange-400 font-black uppercase tracking-tighter">Creative Assets</div>
                  </div>
                </div>
                <div className="w-full h-4 bg-[#2d3748] rounded-b-2xl shadow-2xl"></div>
              </div>

            </div>

            {/* DECORATIONS - Filling the room */}
            <div className="absolute bottom-20 left-[32%] z-20 scale-150 drop-shadow-2xl">
              <div className="w-10 h-12 bg-orange-900 rounded-b-xl relative border-t-4 border-orange-800">
                <div className="absolute -top-8 -left-4 w-16 h-16 bg-emerald-900 rounded-full opacity-95 shadow-2xl"></div>
                <div className="absolute -top-6 left-2 w-14 h-14 bg-emerald-800 rounded-full opacity-95 shadow-2xl"></div>
              </div>
            </div>
            <div className="absolute bottom-20 right-[32%] z-20 scale-150 drop-shadow-2xl">
              <div className="w-10 h-12 bg-orange-900 rounded-b-xl relative border-t-4 border-orange-800">
                <div className="absolute -top-8 -left-4 w-16 h-16 bg-emerald-900 rounded-full opacity-95 shadow-2xl"></div>
                <div className="absolute -top-6 left-2 w-14 h-14 bg-emerald-800 rounded-full opacity-95 shadow-2xl"></div>
              </div>
            </div>
            
            {/* Strategy Lounge Sofa */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-96 h-12 bg-blue-900/30 rounded-full blur-xl z-0"></div>
            <div className="absolute bottom-16 left-[42%] w-24 h-8 bg-slate-700 rounded-t-xl border-t-4 border-slate-600 z-20 shadow-2xl"></div>
            <div className="absolute bottom-16 right-[42%] w-24 h-8 bg-slate-700 rounded-t-xl border-t-4 border-slate-600 z-20 shadow-2xl"></div>

            {/* Floating Status Card */}
            <div className="absolute top-40 right-16 z-50 bg-black/80 backdrop-blur-2xl p-5 rounded-[30px] border-2 border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)] w-44">
              <div className="text-[10px] font-black text-slate-500 mb-2 tracking-[0.2em] uppercase">Outlet Aktif</div>
              <div className="text-2xl font-black text-white leading-none mb-4">17 / 18</div>
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Sangat Baik</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Baik</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.8)]"></div>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Warning</span>
                </div>
              </div>
            </div>

          </div>

          {/* LOWER CONTENT GRID */}
          <div className="grid grid-cols-5 gap-6">
            {/* Aktivitas Real-time */}
            <div className="bg-white rounded-[32px] border-2 border-slate-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Aktivitas Real-Time</span>
                <div className="flex items-center gap-2 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Live</span>
                </div>
              </div>
              <div className="space-y-5">
                {[
                  { text: 'Penjualan tertinggi di Outlet Jakarta Selatan', time: '10:30', icon: '💰' },
                  { text: 'Stok hampir habis di Outlet Bandung', time: '10:28', icon: '⚠️' },
                  { text: '5 karyawan belum absen hari ini', time: '10:25', icon: '👥' },
                  { text: 'Order meningkat 18% di Outlet Bali', time: '10:20', icon: '📈' },
                ].map((a, i) => (
                  <div key={i} className="flex gap-4 items-start group cursor-pointer">
                    <span className="text-2xl leading-none group-hover:scale-125 transition-transform">{a.icon}</span>
                    <div className="flex-1">
                      <div className="text-xs font-black text-slate-800 leading-tight mb-1">{a.text}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-4 border-t-2 border-slate-50 text-xs font-black text-blue-600 uppercase tracking-widest cursor-pointer hover:text-blue-700 transition-colors flex items-center gap-2">
                Lihat Semua Aktivitas <ChevronDown size={14} className="-rotate-90" />
              </div>
            </div>

            {/* Performa Outlet */}
            <div className="bg-white rounded-[32px] border-2 border-slate-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Performa Outlet</span>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest cursor-pointer hover:underline">Lihat Semua</span>
              </div>
              <div className="space-y-4">
                {[
                  { name: 'Jakarta Selatan', value: 'Rp 8.920.000', change: '+16.5%', up: true },
                  { name: 'BSD City', value: 'Rp 7.250.000', change: '+12.3%', up: true },
                  { name: 'Bandung', value: 'Rp 6.230.000', change: '-2.1%', up: false },
                  { name: 'Surabaya', value: 'Rp 5.820.000', change: '+8.7%', up: true },
                  { name: 'Bali', value: 'Rp 4.910.000', change: '+11.4%', up: true },
                ].map((o, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-black text-slate-300 w-5 group-hover:text-blue-400 transition-colors">{i + 1}</span>
                      <span className="text-xs font-black text-slate-800">{o.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-slate-900">{o.value}</div>
                      <div className={`text-[10px] font-black ${o.up ? 'text-emerald-500' : 'text-red-500'}`}>{o.change}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 h-12 flex items-end gap-2">
                {[40, 70, 45, 90, 65, 30, 80].map((h, i) => (
                  <div key={i} className="flex-1 bg-blue-50 rounded-t-xl relative group cursor-pointer overflow-hidden">
                    <div className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-t-xl transition-all group-hover:bg-blue-600 group-hover:h-full" style={{ height: h + '%' }}></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alert */}
            <div className="bg-white rounded-[32px] border-2 border-slate-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Alert & Notifikasi</span>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest cursor-pointer hover:underline">Lihat Semua</span>
              </div>
              <div className="space-y-5">
                {[
                  { text: 'Revenue turun di Bandung -22%', time: '10:30', type: 'danger' },
                  { text: 'Stok Habis: Chocolate Frappe 2 Outlet', time: '10:25', type: 'danger' },
                  { text: 'Server POS Outlet Bali Warning', time: '10:20', type: 'warning' },
                  { text: 'Payroll 3 karyawan perlu approval', time: '10:15', type: 'warning' },
                ].map((a, i) => (
                  <div key={i} className="flex gap-4 items-start group cursor-pointer">
                    <div className={`w-3 h-3 rounded-full mt-1.5 shadow-lg group-hover:scale-125 transition-transform ${a.type === 'danger' ? 'bg-red-500 shadow-red-200' : 'bg-orange-500 shadow-orange-200'}`}></div>
                    <div className="flex-1">
                      <div className="text-xs font-black text-slate-800 leading-tight mb-1">{a.text}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insight */}
            <div className="bg-white rounded-[32px] border-2 border-slate-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">AI Insight</span>
              </div>
              <div className="space-y-5">
                {[
                  { text: 'Penjualan turun di jam 14:00-17:00. Rekomendasi promo sore.', icon: <Brain size={18} className="text-purple-500" /> },
                  { text: 'Outlet BSD performa terbaik, Kontribusi laba 22% dari total.', icon: <BarChart2 size={18} className="text-emerald-500" /> },
                  { text: 'Biaya lembur meningkat 18%, Perlu optimasi shift.', icon: <Clock size={18} className="text-orange-500" /> },
                ].map((a, i) => (
                  <div key={i} className="flex gap-4 items-start group cursor-pointer">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center flex-shrink-0 border-2 border-slate-100 shadow-inner group-hover:bg-white group-hover:shadow-md transition-all">{a.icon}</div>
                    <div className="text-xs font-black text-slate-800 leading-tight">{a.text}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ringkasan CEO */}
            <div className="bg-white rounded-[32px] border-2 border-slate-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Keputusan CEO AI</span>
              </div>
              <div className="space-y-4">
                {[
                  'Jalankan Promo Sore 15:00 - 18:00 di semua outlet',
                  'Negosiasi harga bahan baku kopi bulan depan',
                  'Rekrut 2 barista di Outlet Surabaya',
                  'Evaluasi kinerja karyawan bulan ini',
                ].map((a, i) => (
                  <div key={i} className="flex gap-4 items-start group cursor-pointer">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 border-2 border-emerald-200 group-hover:bg-emerald-500 transition-colors">
                       <span className="text-xs font-black text-emerald-600 group-hover:text-white transition-colors">✓</span>
                    </div>
                    <div className="text-xs font-black text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">{a}</div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-4 border-t-2 border-slate-50 text-xs font-black text-blue-600 uppercase tracking-widest cursor-pointer hover:text-blue-700 transition-colors flex items-center gap-2">
                Lihat Semua Instruksi <ChevronDown size={14} className="-rotate-90" />
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="h-20 bg-white border-t-2 border-slate-200 flex items-center justify-between px-10 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] z-40">
          <div className="flex gap-10">
            {bottomStats.map((s, i) => (
              <div key={i} className="flex items-center gap-4 group cursor-pointer">
                <span className="text-2xl group-hover:scale-125 transition-transform">{s.icon}</span>
                <div>
                  <div className="text-sm font-black text-slate-900 leading-none mb-1">{s.value}</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 px-8 py-3 rounded-[24px] bg-indigo-600 cursor-pointer hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 group">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
                <Brain size={22} color="white" />
              </div>
              <div>
                <div className="text-xs font-black text-white uppercase tracking-[0.2em]">Tanya CEO</div>
                <div className="text-[10px] font-bold text-white opacity-70">AI Assistant Online</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
