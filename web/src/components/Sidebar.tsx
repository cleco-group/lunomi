import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  onLogout: () => void;
}

interface NavItem {
  path: string;
  label: string;
}

interface NavGroup {
  label: string;
  key: string;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    label: 'Operasional',
    key: 'ops',
    items: [
      { path: '/pos', label: 'POS Kasir' },
      { path: '/kitchen', label: 'Kitchen Display' },
      { path: '/booking', label: 'Manajemen Booking' },
      { path: '/tables', label: 'Manajemen Meja' },
      { path: '/outlet', label: 'Manajemen Outlet' },
      { path: '/shift', label: 'Tutup Shift' },
      { path: '/payment', label: 'Metode Pembayaran' },
    ],
  },
  {
    label: 'Inventory & Produk',
    key: 'inventory',
    items: [
      { path: '/product', label: 'Master Menu' },
      { path: '/inventory', label: 'Stok Barang' },
      { path: '/recipe', label: 'Resep Menu' },
      { path: '/stockopname', label: 'Stok Opname' },
      { path: '/supplier', label: 'Manajemen Supplier' },
      { path: '/purchase', label: 'Pembelian Barang' },
    ],
  },
  {
    label: 'SDM & Karyawan',
    key: 'sdm',
    items: [
      { path: '/hr', label: 'Data Karyawan' },
      { path: '/attendance', label: 'Absensi' },
      { path: '/staff-schedule', label: 'Jadwal Karyawan' },
    ],
  },
  {
    label: 'Customer & Laporan',
    key: 'customer',
    items: [
      { path: '/customer', label: 'Manajemen Customer' },
      { path: '/invoice', label: 'Invoice & Nota' },
      { path: '/loyalty', label: 'Loyalty Program' },
      { path: '/analytics', label: 'Analytics' },
      { path: '/expense', label: 'Pengeluaran Operasional' },
      { path: '/refund', label: 'Proses Retur' },
      { path: '/online', label: 'Pemesanan Online' },
    ],
  },
  {
    label: 'Konfigurasi',
    key: 'config',
    items: [
      { path: '/tax', label: 'Pengaturan Pajak' },
      { path: '/tax-report', label: 'Laporan Pajak' },
      { path: '/keuangan', label: 'Laporan Keuangan' },
      { path: '/whatsapp', label: 'Integrasi WhatsApp' },
      { path: '/printer', label: 'Konfigurasi Printer' },
      { path: '/security', label: 'Keamanan' },
      { path: '/audit', label: 'Audit Log' },
      { path: '/financial-statements', label: 'Laporan Keuangan' },
    ],
  },
];

export default function Sidebar({ onLogout }: SidebarProps) {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<string[]>(['ops', 'inventory', 'sdm', 'customer', 'config']);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMenu = (key: string) => {
    setOpenMenus(prev =>
      prev.includes(key) ? prev.filter(m => m !== key) : [...prev, key]
    );
  };

  const isActive = (path: string) => location.pathname === path;

  const linkStyle = (active: boolean) => ({
    background: active ? 'rgba(99,102,241,.15)' : 'transparent',
    color: active ? '#a5b4fc' : 'rgba(255,255,255,.6)',
    borderLeft: active ? '3px solid #6366f1' : '3px solid transparent',
  });

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Hamburger — mobile only, when sidebar is closed */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2.5 rounded-xl cursor-pointer"
        style={{
          background: 'rgba(2,6,23,0.92)',
          border: '1px solid rgba(255,255,255,0.12)',
          backdropFilter: 'blur(12px)',
        }}
        aria-label="Buka menu"
      >
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Backdrop — mobile only */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60"
          style={{ backdropFilter: 'blur(2px)' }}
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-64 h-screen fixed left-0 top-0 flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          background: 'rgba(2,6,23,.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255,255,255,.07)',
        }}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,.07)' }}>
          <div>
            <h1 className="text-2xl font-black" style={{ color: '#C9A84C', letterSpacing: '-0.5px' }}>LUNOMI</h1>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,.3)' }}>POS Pintar F&B</p>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={closeMobile}
            className="lg:hidden p-1.5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
            style={{ color: 'rgba(255,255,255,.5)' }}
            aria-label="Tutup menu"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-3 scrollbar-thin">
          {/* Dashboard */}
          <Link
            to="/dashboard"
            onClick={closeMobile}
            className="flex items-center gap-3 px-6 py-3 transition-all text-sm font-semibold"
            style={linkStyle(isActive('/dashboard'))}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
            Dashboard
          </Link>

          {/* Groups */}
          {NAV.map(group => (
            <div key={group.key} className="mt-1">
              <button
                onClick={() => toggleMenu(group.key)}
                className="w-full flex items-center justify-between px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-all hover:bg-white/5 cursor-pointer"
                style={{ color: 'rgba(255,255,255,.3)' }}
              >
                <span>{group.label}</span>
                <svg
                  className="w-3 h-3 transition-transform duration-200"
                  style={{ transform: openMenus.includes(group.key) ? 'rotate(90deg)' : 'rotate(0)' }}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                >
                  <path strokeLinecap="round" d="M9 18l6-6-6-6" />
                </svg>
              </button>
              <div
                className="overflow-hidden transition-all duration-200"
                style={{ maxHeight: openMenus.includes(group.key) ? '500px' : '0' }}
              >
                {group.items.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeMobile}
                    className="flex items-center gap-2 pl-10 pr-6 py-2.5 text-sm transition-all"
                    style={linkStyle(isActive(item.path))}
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: isActive(item.path) ? '#6366f1' : 'rgba(255,255,255,.2)' }} />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Settings */}
          <div className="mt-1">
            <Link
              to="/settings"
              onClick={closeMobile}
              className="flex items-center gap-3 px-6 py-3 transition-all text-sm font-semibold"
              style={linkStyle(isActive('/settings'))}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><circle cx="12" cy="12" r="3" /></svg>
              Pengaturan
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,.07)' }}>
          <button
            onClick={() => { closeMobile(); onLogout(); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer hover:bg-red-500/25"
            style={{ background: 'rgba(239,68,68,.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,.25)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
