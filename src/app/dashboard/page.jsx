"use client"
import { useLoginStore } from '@/src/store/useLoginStore'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard, FileText, Building2, Wallet, Settings2,
  Users, Megaphone, Package, BarChart2, Brain, CheckSquare,
  Bell, Settings, ShoppingCart, ChevronDown, Zap, Monitor, Palette
} from 'lucide-react'

// ─── DESIGN TOKENS (sesuai blueprint) ────────────────────────────────────────
const T = {
  primary:   '#2563EB',
  accent:    '#F0A500',
  success:   '#00E5A0',
  danger:    '#FF4757',
  purple:    '#7C6BFF',
  bg:        '#F8FAFC',
  surface:   '#FFFFFF',
  border:    '#E5E7EB',
  text1:     '#0F172A',
  text2:     '#64748B',
}

// ─── NAV ITEMS ────────────────────────────────────────────────────────────────
const NAV = [
  { section: 'Utama' },
  { icon: LayoutDashboard, label: 'Dashboard Owner', active: true },
  { icon: ShoppingCart,    label: 'Kasir (POS)' },
  { icon: FileText,        label: 'Ringkasan Bisnis' },
  { icon: Building2,       label: 'Outlet & Cabang' },
  { section: 'Keuangan & SDM' },
  { icon: Wallet,          label: 'Keuangan',          hasChild: true },
  { icon: Settings2,       label: 'Operasional',        hasChild: true },
  { icon: Users,           label: 'Absensi & Payroll' },
  { icon: Users,           label: 'Karyawan & Role' },
  { section: 'Marketing & Produk' },
  { icon: Megaphone,       label: 'Marketing & Promo' },
  { icon: Package,         label: 'Produk & Inventory', hasChild: true },
  { icon: BarChart2,       label: 'Laporan & Analitik' },
  { section: 'AI Command' },
  { icon: Brain,           label: 'AI Insight',         ai: true },
  { icon: CheckSquare,     label: 'Approval Center',    ai: true, badge: 12 },
  { icon: Bell,            label: 'Notifikasi & Alert', ai: true },
  { icon: Brain,           label: 'Tanya CEO',          ai: true },
  { icon: Zap,             label: 'Instruksi Cepat',    ai: true },
  { section: 'Sistem' },
  { icon: Settings,        label: 'Pengaturan' },
]

// ─── KPI DATA ─────────────────────────────────────────────────────────────────
const KPI = [
  { icon: '💰', label: 'Revenue Hari Ini',    value: 'Rp 45.230.000', delta: '↑ 12.5%', up: true,  sub: 'dari kemarin' },
  { icon: '🏢', label: 'Total Outlet',         value: '18',            delta: null,      up: null,  sub: 'Aktif 17 | Nonaktif 1' },
  { icon: '📈', label: 'Laba Bersih',          value: 'Rp 8.450.000',  delta: '↑ 15.2%', up: true,  sub: 'Margin 18.7%' },
  { icon: '👥', label: 'Total Karyawan',       value: '156',           delta: null,      up: null,  sub: 'Hadir 142 | Absen 14' },
  { icon: '🛒', label: 'Penjualan Bulan Ini',  value: 'Rp 1,256 Jt',  delta: '↑ 11.8%', up: true,  sub: 'Target Rp 1.5M' },
  { icon: '⭐', label: 'Rating Outlet',         value: '4.7 / 5.0',    delta: null,      up: null,  sub: 'Dari 2.345 review' },
]

// ─── AGENTS ───────────────────────────────────────────────────────────────────
const AGENTS = [
  { id:'fin', name:'FIN AI',  role:'Finance & Cashflow',      color: T.success,  status:'ACTIVE',   m1:'Rp 45.2M', l1:'Revenue',  m2:'↑ 12.5%', log:'Memproses laporan cashflow harian...' },
  { id:'hr',  name:'HR AI',   role:'Payroll & Absensi',       color: T.accent,   status:'THINKING', m1:'142/156',  l1:'Hadir',    m2:'91.0%',   log:'Menganalisis pola lembur bulan ini...' },
  { id:'ops', name:'OPS AI',  role:'Kitchen & Operations',    color: T.primary,  status:'ACTIVE',   m1:'128',      l1:'Order',    m2:'Live',    log:'Monitoring stok Chocolate Frappe...' },
  { id:'mkt', name:'MKT AI',  role:'Campaign & Promo',        color: '#f97316',  status:'ACTIVE',   m1:'8.7%',     l1:'Konversi', m2:'↑ 1.2%', log:'Menyiapkan promo sore 15:00-18:00...' },
  { id:'it',  name:'IT AI',   role:'Security & Infrastructure',color: T.purple,  status:'ACTIVE',   m1:'100%',     l1:'Uptime',   m2:'All Clear',log:'Security scan selesai. 0 ancaman.' },
  { id:'des', name:'DES AI',  role:'Creative & Design',       color: '#06b6d4',  status:'WORKING',  m1:'3',        l1:'Aset',     m2:'Hari ini', log:'Membuat banner promo sore...' },
]

const ALERTS = [
  { msg: 'Revenue turun di Bandung -22%',            time: '10:30', agent: 'FIN AI',  type: 'danger' },
  { msg: 'Stok Habis: Chocolate Frappe 2 Outlet',    time: '10:25', agent: 'OPS AI',  type: 'warning' },
  { msg: 'Server POS Outlet Bali Warning',           time: '10:20', agent: 'IT AI',   type: 'purple' },
  { msg: 'Payroll 3 karyawan perlu approval',        time: '10:15', agent: 'HR AI',   type: 'warning' },
]

const ACTIVITIES = [
  { icon:'💰', text:'Penjualan tertinggi — Jakarta Selatan', time:'10:30' },
  { icon:'⚠️', text:'Stok hampir habis — Bandung',          time:'10:28' },
  { icon:'👥', text:'5 karyawan belum absen hari ini',       time:'10:25' },
  { icon:'📈', text:'Order meningkat 18% — Bali',           time:'10:20' },
  { icon:'🤖', text:'CEO AI: Promo sore aktif semua outlet', time:'10:15' },
]

const OUTLETS = [
  { name:'Jakarta Selatan', rev:'Rp 8.92M', delta:'+16.5%', up:true },
  { name:'BSD City',        rev:'Rp 7.25M', delta:'+12.3%', up:true },
  { name:'Bandung',         rev:'Rp 6.23M', delta:'-2.1%',  up:false },
  { name:'Surabaya',        rev:'Rp 5.82M', delta:'+8.7%',  up:true },
  { name:'Bali',            rev:'Rp 4.91M', delta:'+11.4%', up:true },
]

// ─── CEO RESPONSES ────────────────────────────────────────────────────────────
const CEO_RESP = [
  'Saya delegasikan ke FIN AI. Laporan siap dalam 5 menit.',
  'HR AI sedang memproses. Estimasi selesai 2 menit.',
  'OPS AI sudah memicu purchase order otomatis.',
  'MKT AI langsung menjalankan campaign. Notifikasi segera masuk.',
  'IT AI sedang investigasi. Backup aktif sebagai precaution.',
  'Rekomendasi: fokus di outlet BSD dan Jaksel untuk revenue maksimal.',
]

// ═════════════════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const { kasir, reset } = useLoginStore()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [ceoOpen, setCeoOpen] = useState(false)
  const [ceoMsgs, setCeoMsgs] = useState([
    { role:'ai', text:'Halo Pak Andi! Semua sistem berjalan baik. Ada 12 approval menunggu. Ada yang perlu saya bantu?' }
  ])
  const [ceoInput, setCeoInput] = useState('')
  const [ceoIdx, setCeoIdx] = useState(0)

  useEffect(() => { if (!kasir) router.push('/login') }, [kasir])

  function handleLogout() { reset(); router.push('/login') }

  function sendCEO() {
    if (!ceoInput.trim()) return
    const userMsg = { role:'user', text: ceoInput }
    setCeoMsgs(p => [...p, userMsg, { role:'ai', text:'🤖 Menganalisis...' }])
    setCeoInput('')
    const idx = ceoIdx % CEO_RESP.length
    setTimeout(() => {
      setCeoMsgs(p => {
        const n = [...p]
        n[n.length-1] = { role:'ai', text: CEO_RESP[idx] }
        return n
      })
      setCeoIdx(i => i+1)
    }, 1500)
  }

  // ── STYLES INLINE ────────────────────────────────────────────────────────
  const s = {
    // Card base
    card: { background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12 },
    // Section title
    secTitle: { font: `600 14px/1 Inter, sans-serif`, color: T.text1 },
    // Small text
    sm: { fontSize: 12, color: T.text2, fontFamily: 'Inter, sans-serif' },
    // Caption
    cap: { fontSize: 11, color: T.text2, fontFamily: 'Inter, sans-serif' },
  }

  return (
    <div style={{ display:'flex', minHeight:'100vh', background: T.bg, fontFamily:'Inter, sans-serif', fontSize:14, color: T.text1 }}>

      {/* ── OVERLAY MOBILE ── */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:90 }} />
      )}

      {/* ══════════════ SIDEBAR ══════════════ */}
      <aside style={{
        width: 232, minHeight:'100vh', background: T.surface,
        borderRight: `1px solid ${T.border}`,
        display:'flex', flexDirection:'column',
        position:'fixed', left:0, top:0, bottom:0, zIndex:100,
        overflowY:'auto',
        transform: sidebarOpen ? 'translateX(0)' : undefined,
        transition:'transform .25s',
      }}
        className="lunomi-sidebar"
      >
        {/* Logo */}
        <div style={{ padding:'18px 18px 14px', borderBottom:`1px solid ${T.border}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:34, height:34, background: T.primary, borderRadius:9,
              display:'flex', alignItems:'center', justifyContent:'center',
              color:'#fff', fontWeight:800, fontSize:16 }}>L</div>
            <div>
              <div style={{ fontWeight:700, fontSize:15, color: T.text1 }}>Lunomi</div>
              <div style={{ fontSize:10, color: T.text2, letterSpacing:'.08em', textTransform:'uppercase' }}>POS Pintar v1.0.0</div>
            </div>
          </div>
        </div>

        {/* User */}
        <div style={{ padding:'12px 14px', borderBottom:`1px solid ${T.border}`, display:'flex', gap:10, alignItems:'center' }}>
          <div style={{ width:38, height:38, borderRadius:'50%',
            background:`linear-gradient(135deg, ${T.primary}, ${T.purple})`,
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'#fff', fontWeight:700, fontSize:13, flexShrink:0 }}>AS</div>
          <div style={{ minWidth:0 }}>
            <div style={{ fontWeight:700, fontSize:13, color: T.text1 }}>Andi Setiawan</div>
            <div style={{ fontSize:11, color: T.text2 }}>Owner / CEO</div>
            <span style={{ fontSize:10, color: T.primary, background:'#EFF6FF',
              padding:'1px 7px', borderRadius:4, marginTop:3, display:'inline-block' }}>Super Admin</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'8px 10px', overflowY:'auto' }}>
          {NAV.map((item, i) => {
            if (item.section) return (
              <div key={i} style={{ fontSize:10, fontWeight:600, color: T.text2,
                textTransform:'uppercase', letterSpacing:'.08em',
                padding:'12px 10px 4px' }}>{item.section}</div>
            )
            const Icon = item.icon
            return (
              <div key={i} style={{
                display:'flex', alignItems:'center', gap:9,
                padding:'9px 10px', borderRadius:8, cursor:'pointer',
                marginBottom:1,
                background: item.active ? '#EFF6FF' : 'transparent',
                color: item.active ? T.primary : item.ai ? T.purple : T.text2,
                fontWeight: item.active ? 600 : 500, fontSize:13,
              }}
                onMouseEnter={e => { if(!item.active) e.currentTarget.style.background = T.bg }}
                onMouseLeave={e => { if(!item.active) e.currentTarget.style.background = 'transparent' }}
              >
                {Icon && <Icon size={15} style={{ flexShrink:0 }} />}
                <span style={{ flex:1 }}>{item.label}</span>
                {item.badge && (
                  <span style={{ background: T.danger, color:'#fff',
                    fontSize:10, fontWeight:700, padding:'1px 6px', borderRadius:10 }}>{item.badge}</span>
                )}
                {item.hasChild && <ChevronDown size={12} />}
              </div>
            )
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding:'10px 14px 14px', borderTop:`1px solid ${T.border}` }}>
          <div onClick={handleLogout} style={{ display:'flex', alignItems:'center', gap:9,
            padding:'9px 10px', borderRadius:8, cursor:'pointer',
            color: T.danger, fontWeight:500, fontSize:13 }}>
            <span>⬅</span> Keluar
          </div>
        </div>
      </aside>

      {/* ══════════════ MAIN ══════════════ */}
      <main style={{ marginLeft:232, flex:1, display:'flex', flexDirection:'column', minHeight:'100vh' }}
        className="lunomi-main">

        {/* ── TOPBAR ── */}
        <header style={{
          background: T.surface, borderBottom:`1px solid ${T.border}`,
          padding:'0 24px', height:60,
          display:'flex', alignItems:'center', gap:14,
          position:'sticky', top:0, zIndex:50,
        }}>
          {/* Hamburger mobile */}
          <button onClick={() => setSidebarOpen(p=>!p)}
            style={{ display:'none', border:'none', background:'none', cursor:'pointer', padding:4 }}
            className="lunomi-hamburger">
            <div style={{ width:20, height:2, background: T.text1, marginBottom:4 }}/>
            <div style={{ width:20, height:2, background: T.text1, marginBottom:4 }}/>
            <div style={{ width:20, height:2, background: T.text1 }}/>
          </button>

          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontWeight:700, fontSize:18, color: T.text1, letterSpacing:'-.02em' }}>Dashboard Owner</div>
            <div style={{ fontSize:11, color: T.text2 }}>Pusat Kendali & Pengambilan Keputusan — Lunomi Group</div>
          </div>

          {/* Outlet */}
          <div style={{ display:'flex', alignItems:'center', gap:8,
            padding:'6px 12px', borderRadius:8, border:`1px solid ${T.border}`,
            fontSize:12, fontWeight:600, flexShrink:0 }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background: T.success,
              boxShadow:`0 0 0 3px rgba(0,229,160,.2)`, display:'inline-block' }}/>
            <span className="lunomi-hide-xs">Lunomi Group</span>
            <span style={{ fontSize:11, color: T.text2, fontWeight:400 }}>17 Aktif</span>
          </div>

          {/* Bell */}
          <div style={{ position:'relative', cursor:'pointer', flexShrink:0 }}>
            <div style={{ width:36, height:36, borderRadius:8, border:`1px solid ${T.border}`,
              display:'flex', alignItems:'center', justifyContent:'center', color: T.text2 }}>
              <Bell size={16} />
            </div>
            <span style={{ position:'absolute', top:-4, right:-4, background: T.danger,
              color:'#fff', fontSize:9, fontWeight:700, minWidth:16, height:16,
              borderRadius:10, padding:'0 4px', border:'2px solid #fff',
              display:'flex', alignItems:'center', justifyContent:'center' }}>9</span>
          </div>

          {/* CEO Button */}
          <button onClick={() => setCeoOpen(p=>!p)}
            style={{ display:'flex', alignItems:'center', gap:8,
              padding:'7px 14px', borderRadius:8,
              background: T.purple, color:'#fff', border:'none',
              fontWeight:600, fontSize:13, cursor:'pointer', flexShrink:0 }}>
            <Brain size={15} />
            <span className="lunomi-hide-xs">Tanya CEO</span>
          </button>
        </header>

        {/* ── CONTENT ── */}
        <div style={{ padding:'20px 24px', flex:1, overflowY:'auto' }}>

          {/* KPI GRID - 3 cols mobile, 6 desktop */}
          <div style={{ display:'grid', gap:12, marginBottom:20 }}
            className="lunomi-kpi-grid">
            {KPI.map((k, i) => (
              <div key={i} style={{ ...s.card, padding:'16px 18px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                  <div style={{ width:36, height:36, borderRadius:9, background:'#F8FAFC',
                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{k.icon}</div>
                  {k.delta && (
                    <span style={{ fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:6,
                      background: k.up ? '#ECFDF5' : '#FFF1F2',
                      color: k.up ? '#059669' : T.danger }}>{k.delta}</span>
                  )}
                </div>
                <div style={{ fontWeight:700, fontSize:20, color: T.text1, lineHeight:1, marginBottom:4 }}>{k.value}</div>
                <div style={{ fontSize:12, fontWeight:600, color: T.text2, marginBottom:2 }}>{k.label}</div>
                <div style={{ fontSize:11, color: T.text2 }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* ── COMMAND CENTER ── */}
          <div style={{ marginBottom:20 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <div style={{ fontWeight:600, fontSize:14, color: T.text1 }}>⚡ Lunomi Command Center</div>
              <span style={{ fontSize:11, fontWeight:600, color: T.success,
                background:'#ECFDF5', padding:'2px 10px', borderRadius:6 }}>● 6 Agent Online 24/7</span>
            </div>

            {/* Gambar Leonardo + Overlay */}
            <div style={{ position:'relative', borderRadius:14, overflow:'hidden',
              border:`1px solid ${T.border}`, boxShadow:'0 4px 24px rgba(0,0,0,.08)' }}>

              {/* Background image */}
              <img
                src="/images/command-center.jpg"
                alt="Lunomi Command Center"
                style={{ width:'100%', display:'block', objectFit:'cover' }}
              />

              {/* Dark overlay gradient */}
              <div style={{ position:'absolute', inset:0,
                background:'linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.1) 40%, rgba(0,0,0,.6) 100%)' }}/>

              {/* Header bar */}
              <div style={{ position:'absolute', top:0, left:0, right:0,
                background:'rgba(6,10,22,.9)', backdropFilter:'blur(8px)',
                borderBottom:'1px solid rgba(255,255,255,.08)',
                padding:'10px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background: T.success,
                    boxShadow:`0 0 8px ${T.success}` }}/>
                  <span style={{ color: T.accent, fontFamily:'monospace', fontSize:12,
                    fontWeight:'bold', letterSpacing:'.18em' }}>⚡ LUNOMI COMMAND CENTER</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                  <span style={{ color:'#475569', fontFamily:'monospace', fontSize:10 }}>6 AI Agent Aktif</span>
                  {[0,.3,.6,.9,1.2,1.5].map((d,i) => (
                    <div key={i} style={{ width:6, height:6, borderRadius:'50%', background: T.success,
                      animation:`ccPulse 2s ease-in-out ${d}s infinite` }}/>
                  ))}
                </div>
              </div>

              {/* Zone labels */}
              <div style={{ position:'absolute', top:46, left:16,
                background:'rgba(0,229,160,.15)', border:'1px solid rgba(0,229,160,.4)',
                color: T.success, fontSize:10, fontWeight:700,
                padding:'3px 10px', borderRadius:6, fontFamily:'monospace', letterSpacing:'.1em' }}>
                FINANCE ZONE
              </div>
              <div style={{ position:'absolute', top:46, right:16,
                background:'rgba(37,99,235,.15)', border:'1px solid rgba(37,99,235,.4)',
                color:'#60a5fa', fontSize:10, fontWeight:700,
                padding:'3px 10px', borderRadius:6, fontFamily:'monospace', letterSpacing:'.1em' }}>
                OPERATIONS ZONE
              </div>
              <div style={{ position:'absolute', bottom:46, left:16,
                background:'rgba(239,68,68,.15)', border:'1px solid rgba(239,68,68,.4)',
                color:'#f87171', fontSize:10, fontWeight:700,
                padding:'3px 10px', borderRadius:6, fontFamily:'monospace', letterSpacing:'.1em' }}>
                HR & PAYROLL ZONE
              </div>
              <div style={{ position:'absolute', bottom:46, right:16,
                background:'rgba(124,107,255,.15)', border:'1px solid rgba(124,107,255,.4)',
                color:'#a78bfa', fontSize:10, fontWeight:700,
                padding:'3px 10px', borderRadius:6, fontFamily:'monospace', letterSpacing:'.1em' }}>
                IT & SYSTEM ZONE
              </div>

              {/* Center - Revenue panel */}
              <div style={{ position:'absolute', top:'50%', left:'50%',
                transform:'translate(-50%,-50%)',
                background:'rgba(6,10,22,.85)', backdropFilter:'blur(12px)',
                border:'1px solid rgba(255,255,255,.12)', borderRadius:12,
                padding:'12px 20px', textAlign:'center', minWidth:160 }}>
                <div style={{ fontSize:10, color:'rgba(255,255,255,.4)',
                  fontFamily:'monospace', letterSpacing:'.1em', marginBottom:4 }}>REVENUE HARI INI</div>
                <div style={{ fontSize:20, fontWeight:800, color:'#fff', lineHeight:1, marginBottom:4 }}>Rp 45.230.000</div>
                <div style={{ fontSize:12, fontWeight:700, color: T.success }}>↑ 12.5% dari kemarin</div>
                <div style={{ width:'100%', height:1, background:'rgba(255,255,255,.1)', margin:'8px 0' }}/>
                <div style={{ display:'flex', gap:16, justifyContent:'center' }}>
                  <div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,.4)', fontFamily:'monospace' }}>OUTLET</div>
                    <div style={{ fontSize:14, fontWeight:700, color:'#fff' }}>17/18</div>
                  </div>
                  <div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,.4)', fontFamily:'monospace' }}>TRANSAKSI</div>
                    <div style={{ fontSize:14, fontWeight:700, color:'#fff' }}>3.245</div>
                  </div>
                </div>
              </div>

              {/* CEO Label */}
              <div style={{ position:'absolute', bottom:12, left:'50%', transform:'translateX(-50%)',
                background:'rgba(0,0,0,.8)', backdropFilter:'blur(8px)',
                border:'2px solid rgba(255,255,255,.15)', borderRadius:999,
                padding:'5px 20px' }}>
                <div style={{ fontSize:11, fontWeight:800, color:'#fff',
                  letterSpacing:'.2em', textTransform:'uppercase' }}>CEO Andi Setiawan</div>
              </div>
            </div>
          </div>

          {/* ── AGENT CARDS ── */}
          <div style={{ marginBottom:20 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <div style={{ fontWeight:600, fontSize:14, color: T.text1 }}>🤖 AI Agent Team — 24/7 Active</div>
              <span style={{ fontSize:12, color: T.primary, cursor:'pointer' }}>Lihat Log →</span>
            </div>
            <div style={{ display:'grid', gap:12 }} className="lunomi-agent-grid">
              {AGENTS.map(ag => (
                <div key={ag.id} style={{ ...s.card, padding:'16px 18px',
                  borderTop:`3px solid ${ag.color}`, cursor:'pointer',
                  transition:'all .2s' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 20px ${ag.color}22`; e.currentTarget.style.transform='translateY(-1px)' }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform='none' }}
                >
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                    <div style={{ width:38, height:38, borderRadius:9, background: ag.color+'18',
                      display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>
                      {ag.id==='fin'?'💰':ag.id==='hr'?'👥':ag.id==='ops'?'⚙️':ag.id==='mkt'?'📣':ag.id==='it'?'🔒':'🎨'}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:13, color: T.text1 }}>{ag.name}</div>
                      <div style={{ fontSize:11, color: T.text2 }}>{ag.role}</div>
                    </div>
                    <span style={{ fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:6,
                      background: ag.color+'18', color: ag.color,
                      display:'flex', alignItems:'center', gap:4 }}>
                      <span style={{ width:5, height:5, borderRadius:'50%', background: ag.color, display:'inline-block' }}/>
                      {ag.status}
                    </span>
                  </div>
                  <div style={{ display:'flex', gap:16, marginBottom:10 }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:16, color: T.text1 }}>{ag.m1}</div>
                      <div style={{ fontSize:11, color: T.text2 }}>{ag.l1}</div>
                    </div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:14, color: ag.color }}>{ag.m2}</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:6,
                    paddingTop:10, borderTop:`1px solid ${T.border}`,
                    fontSize:11, color: T.text2 }}>
                    <span style={{ width:5, height:5, borderRadius:'50%', background: T.success, flexShrink:0 }}/>
                    {ag.log}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── LOWER GRID ── */}
          <div style={{ display:'grid', gap:14 }} className="lunomi-lower-grid">

            {/* Aktivitas */}
            <div style={{ ...s.card, padding:'16px 18px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <div style={{ fontWeight:600, fontSize:13, color: T.text1 }}>⚡ Aktivitas Real-Time</div>
                <span style={{ fontSize:10, fontWeight:600, color: T.success,
                  background:'#ECFDF5', padding:'2px 8px', borderRadius:6 }}>● LIVE</span>
              </div>
              {ACTIVITIES.map((a, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10,
                  padding:'8px 0', borderBottom: i<ACTIVITIES.length-1 ? `1px solid ${T.border}` : 'none' }}>
                  <span style={{ fontSize:16, width:22, textAlign:'center' }}>{a.icon}</span>
                  <span style={{ flex:1, fontSize:12, fontWeight:500, color: T.text1 }}>{a.text}</span>
                  <span style={{ fontSize:11, color: T.text2, flexShrink:0 }}>{a.time}</span>
                </div>
              ))}
            </div>

            {/* Performa Outlet */}
            <div style={{ ...s.card, padding:'16px 18px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <div style={{ fontWeight:600, fontSize:13, color: T.text1 }}>🏢 Performa Outlet</div>
                <span style={{ fontSize:12, color: T.primary, cursor:'pointer' }}>Lihat →</span>
              </div>
              {OUTLETS.map((o, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10,
                  padding:'8px 0', borderBottom: i<OUTLETS.length-1 ? `1px solid ${T.border}` : 'none' }}>
                  <span style={{ fontWeight:700, fontSize:12, color: T.text2, width:18 }}>{i+1}</span>
                  <span style={{ flex:1, fontSize:12, fontWeight:500, color: T.text1 }}>{o.name}</span>
                  <span style={{ fontSize:12, fontWeight:700, color: T.text1 }}>{o.rev}</span>
                  <span style={{ fontSize:11, fontWeight:600,
                    color: o.up ? '#059669' : T.danger }}>{o.delta}</span>
                </div>
              ))}
            </div>

            {/* Alert */}
            <div style={{ ...s.card, padding:'16px 18px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <div style={{ fontWeight:600, fontSize:13, color: T.text1 }}>🔔 Alert & Notifikasi</div>
                <span style={{ fontSize:12, color: T.primary, cursor:'pointer' }}>Lihat →</span>
              </div>
              {ALERTS.map((a, i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10,
                  padding:'8px 0', borderBottom: i<ALERTS.length-1 ? `1px solid ${T.border}` : 'none' }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', flexShrink:0, marginTop:3,
                    background: a.type==='danger' ? T.danger : a.type==='purple' ? T.purple : T.accent }}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:500, color: T.text1 }}>{a.msg}</div>
                    <div style={{ fontSize:11, color: T.text2 }}>{a.time} • {a.agent}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>{/* /content */}
      </main>

      {/* ══════════════ CEO CHAT ══════════════ */}
      {ceoOpen && (
        <div style={{ position:'fixed', bottom:80, right:24, width:300,
          background: T.surface, borderRadius:16, border:`1px solid ${T.border}`,
          boxShadow:'0 20px 60px rgba(0,0,0,.15)', zIndex:200,
          display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ padding:'12px 16px',
            background:`linear-gradient(135deg, ${T.purple}, #5b4fcf)`,
            display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div style={{ fontWeight:700, fontSize:13, color:'#fff' }}>🤖 CEO AI Orchestrator</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,.7)' }}>Delegasi ke 6 Sub-Agent</div>
            </div>
            <button onClick={() => setCeoOpen(false)}
              style={{ background:'rgba(255,255,255,.15)', border:'none', color:'#fff',
                borderRadius:6, padding:'3px 8px', cursor:'pointer', fontSize:12 }}>✕</button>
          </div>
          <div style={{ padding:12, maxHeight:200, overflowY:'auto',
            display:'flex', flexDirection:'column', gap:8 }}>
            {ceoMsgs.map((m, i) => (
              <div key={i} style={{
                padding:'8px 12px', borderRadius: m.role==='ai' ? '10px 10px 10px 2px' : '10px 10px 2px 10px',
                background: m.role==='ai' ? '#F5F3FF' : T.purple,
                color: m.role==='ai' ? T.text1 : '#fff',
                fontSize:12, alignSelf: m.role==='ai' ? 'flex-start' : 'flex-end',
                maxWidth:'88%' }}>{m.text}</div>
            ))}
          </div>
          <div style={{ padding:'10px 12px', borderTop:`1px solid ${T.border}`,
            display:'flex', gap:8 }}>
            <input
              value={ceoInput}
              onChange={e => setCeoInput(e.target.value)}
              onKeyDown={e => e.key==='Enter' && sendCEO()}
              placeholder="Tanya CEO AI..."
              style={{ flex:1, border:`1px solid ${T.border}`, borderRadius:8,
                padding:'8px 12px', fontSize:12, outline:'none',
                background: T.bg, color: T.text1 }} />
            <button onClick={sendCEO}
              style={{ width:34, height:34, background: T.purple, border:'none',
                borderRadius:8, color:'#fff', cursor:'pointer', fontSize:14 }}>➤</button>
          </div>
        </div>
      )}

      {/* CEO Float Btn */}
      <button onClick={() => setCeoOpen(p=>!p)}
        style={{ position:'fixed', bottom:24, right:24, width:52, height:52,
          borderRadius:'50%', background:`linear-gradient(135deg, ${T.purple}, #5b4fcf)`,
          border:'none', cursor:'pointer', fontSize:22, zIndex:190,
          boxShadow:`0 4px 20px rgba(124,107,255,.45)`,
          display:'flex', alignItems:'center', justifyContent:'center' }}>
        🤖
      </button>

      {/* ══════════════ RESPONSIVE CSS ══════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        * { box-sizing: border-box; }

        /* KPI: 3 cols default, 2 mobile */
        .lunomi-kpi-grid {
          grid-template-columns: repeat(3, 1fr);
        }

        /* Agent: 3 cols default */
        .lunomi-agent-grid {
          grid-template-columns: repeat(3, 1fr);
        }

        /* Lower: 3 cols default */
        .lunomi-lower-grid {
          grid-template-columns: repeat(3, 1fr);
        }

        @keyframes ccPulse {
          0%,100% { opacity:1 }
          50% { opacity:.2 }
        }

        /* TABLET */
        @media (max-width: 1024px) {
          .lunomi-kpi-grid   { grid-template-columns: repeat(3, 1fr) !important; }
          .lunomi-agent-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .lunomi-lower-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }

        /* MOBILE */
        @media (max-width: 768px) {
          .lunomi-sidebar   { transform: translateX(-232px); }
          .lunomi-main      { margin-left: 0 !important; }
          .lunomi-hamburger { display: block !important; }
          .lunomi-hide-xs   { display: none !important; }
          .lunomi-kpi-grid  { grid-template-columns: repeat(2, 1fr) !important; }
          .lunomi-agent-grid{ grid-template-columns: repeat(2, 1fr) !important; }
          .lunomi-lower-grid{ grid-template-columns: 1fr !important; }
        }

        @media (max-width: 480px) {
          .lunomi-kpi-grid  { grid-template-columns: 1fr 1fr !important; }
          .lunomi-agent-grid{ grid-template-columns: 1fr !important; }
        }
      `}</style>

    </div>
  )
}
