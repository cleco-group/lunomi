import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import Sidebar from '../components/Sidebar';
import { Line } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface Transaction {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  paymentMethod: string;
  items: { name: string; qty: number; category: string }[];
  status: string;
}

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
}

const DAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export default function Dashboard() {
  const { user, signOut: logout } = useSupabaseAuth();
  const [metrics, setMetrics] = useState({ totalRevenue: 0, totalOrders: 0, averageOrder: 0, activeOrders: 0 });
  const [topProducts, setTopProducts] = useState<{ name: string; quantity: number }[]>([]);
  const [salesData, setSalesData] = useState<number[]>(Array(7).fill(0));
  const [dayLabels, setDayLabels] = useState<string[]>(DAY_LABELS);

  useEffect(() => {
    const txRaw = localStorage.getItem('lunomi_transactions');
    const transactions: Transaction[] = txRaw ? JSON.parse(txRaw) : [];
    const today = new Date().toISOString().slice(0, 10);
    const todayTx = transactions.filter(t => t.date === today);

    const totalRevenue = todayTx.reduce((s, t) => s + t.total, 0);
    const totalOrders = todayTx.length;

    // Active orders from kitchen
    const kitchenRaw = localStorage.getItem('lunomi_kitchen_orders');
    const kitchen: { status: string }[] = kitchenRaw ? JSON.parse(kitchenRaw) : [];
    const activeOrders = kitchen.filter(o => o.status !== 'completed').length;

    // Top products from all-time transactions
    const productMap: Record<string, number> = {};
    transactions.forEach(t => t.items?.forEach(item => {
      productMap[item.name] = (productMap[item.name] || 0) + item.qty;
    }));
    const sorted = Object.entries(productMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // 7-day sales chart
    const days = getLast7Days();
    const sales = days.map(d => transactions.filter(t => t.date === d).reduce((s, t) => s + t.total, 0) / 1000);
    const labels = days.map(d => {
      const dow = new Date(d + 'T00:00:00').getDay();
      return ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][dow];
    });

    setMetrics({ totalRevenue, totalOrders, averageOrder: totalOrders > 0 ? totalRevenue / totalOrders : 0, activeOrders });
    setTopProducts(sorted.map(([name, quantity]) => ({ name, quantity })));
    setSalesData(sales);
    setDayLabels(labels);
  }, []);

  const chartData = {
    labels: dayLabels,
    datasets: [{
      label: 'Penjualan (Ribu Rp)',
      data: salesData,
      borderColor: '#C9A84C',
      backgroundColor: 'rgba(201,168,76,0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#C9A84C',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { color: 'rgba(255,255,255,0.6)' }, grid: { color: 'rgba(255,255,255,0.1)' } },
      x: { ticks: { color: 'rgba(255,255,255,0.6)' }, grid: { color: 'rgba(255,255,255,0.1)' } },
    },
  };

  const rp = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

  const cardStyle = { background: 'rgba(13,59,74,0.4)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' };

  return (
    <div className="flex min-h-screen" style={{
      background: '#061820',
      backgroundImage: 'radial-gradient(ellipse 70% 50% at 10% 0%, rgba(13,59,74,0.6) 0%, transparent 60%), radial-gradient(ellipse 60% 45% at 90% 100%, rgba(201,168,76,0.08) 0%, transparent 60%)'
    }}>
      <Sidebar onLogout={logout} />

      <main className="flex-1 min-h-screen lg:ml-64">
        <header className="sticky top-0 z-50 px-6 lg:px-8 py-4 flex items-center justify-between"
          style={{ background: 'rgba(2,6,23,0.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h1 className="text-xl font-bold text-white pl-10 lg:pl-0">Dashboard Utama</h1>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-white">{user?.email}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Owner Access</p>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white" style={{ background: '#6366f1' }}>
              {user?.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-8">
          {/* Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            {[
              { label: 'Penjualan Hari Ini', value: rp(metrics.totalRevenue), sub: 'Total revenue', color: '#C9A84C' },
              { label: 'Transaksi Hari Ini', value: String(metrics.totalOrders), sub: 'Order selesai', color: '#22c55e' },
              { label: 'Rata-rata Order', value: rp(metrics.averageOrder), sub: 'Per transaksi', color: '#3b82f6' },
              { label: 'Order Aktif', value: String(metrics.activeOrders), sub: 'Di kitchen', color: '#f59e0b' },
            ].map(c => (
              <div key={c.label} className="p-5 rounded-2xl transition-transform hover:-translate-y-1 cursor-default" style={cardStyle}>
                <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{c.label}</p>
                <h3 className="text-xl lg:text-2xl font-bold text-white break-all">{c.value}</h3>
                <p className="text-xs mt-2 font-semibold" style={{ color: c.color }}>{c.sub}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <div className="p-6 rounded-2xl" style={cardStyle}>
              <h3 className="font-bold mb-4 text-white text-sm">Penjualan 7 Hari Terakhir</h3>
              <Line data={chartData} options={chartOptions} />
              {metrics.totalOrders === 0 && (
                <p className="text-center text-white/30 text-xs mt-4">Belum ada transaksi — buat order di POS Kasir</p>
              )}
            </div>

            <div className="p-6 rounded-2xl" style={cardStyle}>
              <h3 className="font-bold mb-4 text-white text-sm">Produk Terlaris</h3>
              {topProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 gap-2">
                  <p className="text-white/30 text-sm">Belum ada data produk</p>
                  <p className="text-white/20 text-xs">Data dari transaksi POS akan muncul di sini</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topProducts.map((p, idx) => (
                    <div key={p.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black w-4 text-white/30">{idx + 1}</span>
                        <span className="text-sm text-white">{p.name}</span>
                      </div>
                      <span className="text-sm font-bold" style={{ color: '#C9A84C' }}>{p.quantity} pcs</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
