import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  onLogout: () => void;
}

export default function Sidebar({ onLogout }: SidebarProps) {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const toggleMenu = (menu: string) => {
    setOpenMenus(prev => 
      prev.includes(menu) 
        ? prev.filter(m => m !== menu)
        : [...prev, menu]
    );
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 flex flex-col"
           style={{
             background: 'rgba(13,59,74,0.5)',
             backdropFilter: 'blur(20px)',
             WebkitBackdropFilter: 'blur(20px)',
             borderRight: '1px solid rgba(255,255,255,0.08)'
           }}>
      {/* Header */}
      <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <h1 className="text-2xl font-black" style={{ color: '#C9A84C' }}>LUNOMI</h1>
      </div>

      {/* Menu Content */}
      <div className="flex-1 overflow-y-auto py-4">
        {/* Dashboard */}
        <Link
          to="/dashboard"
          className="block px-6 py-3 transition-all"
          style={{
            background: isActive('/dashboard') ? 'rgba(201,168,76,0.15)' : 'transparent',
            color: isActive('/dashboard') ? '#C9A84C' : 'rgba(255,255,255,0.7)',
            borderLeft: isActive('/dashboard') ? '3px solid #C9A84C' : '3px solid transparent'
          }}
        >
          Dashboard
        </Link>

        {/* Operasional Group */}
        <div className="mb-2">
          <div
            onClick={() => toggleMenu('operasional')}
            className="px-6 py-3 flex items-center justify-between cursor-pointer transition-all hover:bg-white/5"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            <span>Operasional</span>
            <span className="text-xs transition-transform" style={{
              transform: openMenus.includes('operasional') ? 'rotate(90deg)' : 'rotate(0deg)'
            }}>▶</span>
          </div>
          <div
            className="overflow-hidden transition-all"
            style={{
              maxHeight: openMenus.includes('operasional') ? '300px' : '0',
              background: 'rgba(0,0,0,0.2)'
            }}
          >
            <Link to="/pos" className="block px-12 py-2 text-sm transition-all hover:bg-white/5" style={{ color: 'rgba(255,255,255,0.7)' }}>
              POS Kasir
            </Link>
            <Link to="/tables" className="block px-12 py-2 text-sm transition-all hover:bg-white/5" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Manajemen Meja
            </Link>
            <Link to="/kitchen" className="block px-12 py-2 text-sm transition-all hover:bg-white/5" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Kitchen Display
            </Link>
          </div>
        </div>

        {/* Inventory Group */}
        <div className="mb-2">
          <div
            onClick={() => toggleMenu('inventory')}
            className="px-6 py-3 flex items-center justify-between cursor-pointer transition-all hover:bg-white/5"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            <span>Inventory & Produk</span>
            <span className="text-xs transition-transform" style={{
              transform: openMenus.includes('inventory') ? 'rotate(90deg)' : 'rotate(0deg)'
            }}>▶</span>
          </div>
          <div
            className="overflow-hidden transition-all"
            style={{
              maxHeight: openMenus.includes('inventory') ? '300px' : '0',
              background: 'rgba(0,0,0,0.2)'
            }}
          >
            <Link to="/inventory" className="block px-12 py-2 text-sm transition-all hover:bg-white/5" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Stok Barang
            </Link>
            <Link to="/product" className="block px-12 py-2 text-sm transition-all hover:bg-white/5" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Master Menu
            </Link>
          </div>
        </div>

        {/* Settings */}
        <Link
          to="/settings"
          className="block px-6 py-3 transition-all hover:bg-white/5"
          style={{ color: 'rgba(255,255,255,0.7)' }}
        >
          Pengaturan
        </Link>
      </div>

      {/* Footer */}
      <div className="p-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <button
          onClick={onLogout}
          className="w-full px-4 py-3 rounded-lg transition-all font-semibold"
          style={{
            background: 'rgba(239,68,68,0.2)',
            color: '#fca5a5',
            border: '1px solid rgba(239,68,68,0.3)'
          }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
