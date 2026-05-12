import { useState, useEffect, useCallback } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

interface KitchenOrder {
  id: string;
  orderNumber: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  orderType: 'dine_in' | 'takeaway' | 'delivery';
  tableNo: string | null;
  items: { name: string; qty: number; category: string }[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  createdAt: string;
  createdBy: string;
}

function getElapsed(createdAt: string): string {
  const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ${diff % 60}s`;
  return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`;
}

export default function Kitchen() {
  const { user, signOut } = useSupabaseAuth();
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [tick, setTick] = useState(0);

  const loadOrders = useCallback(() => {
    try {
      const raw = localStorage.getItem('lunomi_kitchen_orders');
      const all: KitchenOrder[] = raw ? JSON.parse(raw) : [];
      setOrders(all.filter(o => o.status !== 'completed'));
    } catch {
      setOrders([]);
    }
  }, []);

  useEffect(() => {
    loadOrders();

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'lunomi_kitchen_orders') loadOrders();
    };
    window.addEventListener('storage', onStorage);

    const pollId = setInterval(loadOrders, 8000);
    const tickId = setInterval(() => setTick(t => t + 1), 1000);

    return () => {
      window.removeEventListener('storage', onStorage);
      clearInterval(pollId);
      clearInterval(tickId);
    };
  }, [loadOrders]);

  const updateStatus = (id: string, newStatus: KitchenOrder['status']) => {
    const raw = localStorage.getItem('lunomi_kitchen_orders');
    const all: KitchenOrder[] = raw ? JSON.parse(raw) : [];
    const updated = all.map(o => o.id === id ? { ...o, status: newStatus } : o);
    localStorage.setItem('lunomi_kitchen_orders', JSON.stringify(updated));
    setOrders(updated.filter(o => o.status !== 'completed'));
  };

  const pending = orders.filter(o => o.status === 'pending');
  const preparing = orders.filter(o => o.status === 'preparing');
  const ready = orders.filter(o => o.status === 'ready');

  const statusColor: Record<string, string> = {
    pending: '#3b82f6',
    preparing: '#fbbf24',
    ready: '#22c55e',
  };

  const typeLabel: Record<string, string> = {
    dine_in: 'Dine In',
    takeaway: 'Takeaway',
    delivery: 'Delivery',
  };

  const renderOrder = (order: KitchenOrder) => {
    const elapsed = getElapsed(order.createdAt);
    const isUrgent = (Date.now() - new Date(order.createdAt).getTime()) > 15 * 60 * 1000;

    return (
      <div
        key={order.id}
        className="p-4 rounded-xl"
        style={{
          background: 'rgba(13,59,74,0.5)',
          border: `1px solid ${isUrgent ? 'rgba(239,68,68,0.5)' : 'rgba(201,168,76,0.2)'}`,
        }}
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="font-bold text-white text-base">{order.orderNumber}</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {typeLabel[order.orderType]}{order.tableNo ? ` · ${order.tableNo}` : ''}
            </p>
          </div>
          <span
            className="text-xs font-bold px-2 py-1 rounded-full"
            style={{ background: isUrgent ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.1)', color: isUrgent ? '#fca5a5' : 'rgba(255,255,255,0.6)' }}
          >
            {elapsed}
          </span>
        </div>

        <div className="space-y-1.5 mb-4">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: 'rgba(201,168,76,0.2)', color: '#C9A84C' }}>
                {item.qty}
              </span>
              <span className="text-sm text-white">{item.name}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          {order.status === 'pending' && (
            <button
              onClick={() => updateStatus(order.id, 'preparing')}
              className="flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
              style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}
            >
              Mulai Masak
            </button>
          )}
          {order.status === 'preparing' && (
            <button
              onClick={() => updateStatus(order.id, 'ready')}
              className="flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
              style={{ background: 'rgba(34,197,94,0.2)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}
            >
              Siap Saji
            </button>
          )}
          {order.status === 'ready' && (
            <button
              onClick={() => updateStatus(order.id, 'completed')}
              className="flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
              style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }}
            >
              Selesai
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      key={tick}
      className="min-h-screen flex flex-col"
      style={{
        background: '#061820',
        backgroundImage: 'radial-gradient(ellipse 70% 50% at 10% 0%, rgba(13,59,74,0.6) 0%, transparent 60%), radial-gradient(ellipse 60% 45% at 90% 100%, rgba(201,168,76,0.08) 0%, transparent 60%)',
      }}
    >
      {/* Header */}
      <header
        className="px-6 py-4 flex items-center justify-between border-b"
        style={{ background: 'rgba(2,6,23,0.7)', backdropFilter: 'blur(20px)', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Kitchen Display System</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{user?.email}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-white/60">Total Orders</p>
            <p className="text-2xl font-bold" style={{ color: '#C9A84C' }}>{orders.length}</p>
          </div>
          <button
            onClick={() => loadOrders()}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer"
            style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)' }}
          >
            Refresh
          </button>
          <button
            onClick={signOut}
            className="px-6 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer"
            style={{ background: 'rgba(239,68,68,0.2)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="px-6 py-3 flex gap-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)' }}>
        {[
          { label: 'Pending', count: pending.length, color: statusColor.pending },
          { label: 'Preparing', count: preparing.length, color: statusColor.preparing },
          { label: 'Ready', count: ready.length, color: statusColor.ready },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
            <span className="text-white font-semibold text-sm">{s.label}: {s.count}</span>
          </div>
        ))}
      </div>

      {/* Columns */}
      <div className="flex-1 overflow-auto p-6">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-white/40 text-lg">Belum ada pesanan aktif</p>
            <p className="text-white/25 text-sm">Order dari POS akan muncul di sini</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              { label: 'Pending', items: pending, color: statusColor.pending },
              { label: 'Preparing', items: preparing, color: statusColor.preparing },
              { label: 'Ready', items: ready, color: statusColor.ready },
            ].map(col => (
              <div key={col.label}>
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: col.color }} />
                  {col.label} ({col.items.length})
                </h2>
                <div className="space-y-3">
                  {col.items.length === 0 ? (
                    <div className="text-center py-10 text-white/30 text-sm">Tidak ada pesanan</div>
                  ) : (
                    col.items.map(o => renderOrder(o))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
