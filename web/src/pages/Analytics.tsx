import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import Sidebar from '../components/Sidebar';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const GLASS = 'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm';

const CHART_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, ticks: { color: 'rgba(255,255,255,.5)', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,.06)' } },
    x: { ticks: { color: 'rgba(255,255,255,.5)', font: { size: 11 } }, grid: { display: false } },
  },
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const DOW = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

interface Transaction {
  id: string;
  date: string;
  total: number;
  items: { name: string; qty: number; category: string }[];
  status: string;
}

function dateRange(days: number): string[] {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    return d.toISOString().slice(0, 10);
  });
}

export default function Analytics() {
  const { signOut } = useSupabaseAuth();
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('7d');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem('lunomi_transactions');
    setTransactions(raw ? JSON.parse(raw) : []);
  }, []);

  const filtered = (() => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    return transactions.filter(t => t.date >= cutoffStr);
  })();

  const totalRevenue = filtered.reduce((s, t) => s + t.total, 0);
  const totalTx = filtered.length;
  const avgOrder = totalTx > 0 ? totalRevenue / totalTx : 0;

  // Revenue chart labels + data
  const revenueChartData = (() => {
    if (period === '7d' || period === '30d') {
      const days = period === '7d' ? 7 : 30;
      const dates = dateRange(days);
      const labels = dates.map(d => {
        const dow = new Date(d + 'T00:00:00').getDay();
        return period === '7d' ? DOW[dow] : d.slice(5);
      });
      const data = dates.map(d => filtered.filter(t => t.date === d).reduce((s, t) => s + t.total, 0));
      return { labels, data };
    }
    if (period === '90d') {
      const weeks = Array.from({ length: 12 }, (_, i) => {
        const start = new Date();
        start.setDate(start.getDate() - (11 - i) * 7);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        return { label: `Mg ${i + 1}`, startStr: start.toISOString().slice(0, 10), endStr: end.toISOString().slice(0, 10) };
      });
      return {
        labels: weeks.map(w => w.label),
        data: weeks.map(w => filtered.filter(t => t.date >= w.startStr && t.date <= w.endStr).reduce((s, t) => s + t.total, 0)),
      };
    }
    // 1y — by month
    const monthTotals = Array(12).fill(0);
    filtered.forEach(t => { monthTotals[new Date(t.date).getMonth()] += t.total; });
    return { labels: MONTHS, data: monthTotals };
  })();

  const revenueData = {
    labels: revenueChartData.labels,
    datasets: [{
      label: 'Pendapatan',
      data: revenueChartData.data,
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,.15)',
      tension: 0.4, fill: true,
      pointBackgroundColor: '#6366f1',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
    }],
  };

  // Hourly distribution from filtered transactions
  const hourCounts = Array(15).fill(0);
  filtered.forEach(t => {
    // transactions from kitchen_orders have createdAt, but lunomi_transactions has date only
    // use date's position as fallback; if we have createdAt use it
    const tx = t as any;
    if (tx.createdAt) {
      const h = new Date(tx.createdAt).getHours();
      if (h >= 8 && h <= 22) hourCounts[h - 8]++;
    }
  });
  const HOURS = ['08','09','10','11','12','13','14','15','16','17','18','19','20','21','22'];
  const hourlyData = {
    labels: HOURS,
    datasets: [{
      label: 'Transaksi',
      data: hourCounts,
      backgroundColor: 'rgba(99,102,241,.6)',
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  // Category breakdown
  const catMap: Record<string, number> = {};
  filtered.forEach(t => t.items?.forEach(item => {
    const cat = item.category || 'Lainnya';
    catMap[cat] = (catMap[cat] || 0) + item.qty;
  }));
  const catEntries = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const CAT_COLORS = ['rgba(99,102,241,.8)', 'rgba(34,197,94,.8)', 'rgba(245,158,11,.8)', 'rgba(236,72,153,.8)'];
  const categoryData = {
    labels: catEntries.length > 0 ? catEntries.map(([k]) => k) : ['Makanan', 'Minuman', 'Snack', 'Lainnya'],
    datasets: [{
      data: catEntries.length > 0 ? catEntries.map(([, v]) => v) : [1, 1, 1, 1],
      backgroundColor: CAT_COLORS,
      borderWidth: 0,
    }],
  };

  // Top products
  const productMap: Record<string, { qty: number; revenue: number }> = {};
  filtered.forEach(t => t.items?.forEach(item => {
    if (!productMap[item.name]) productMap[item.name] = { qty: 0, revenue: 0 };
    productMap[item.name].qty += item.qty;
    // revenue approx: we don't have per-item price in transactions, so show qty only
  }));
  const topProducts = Object.entries(productMap)
    .sort((a, b) => b[1].qty - a[1].qty)
    .slice(0, 5)
    .map(([name, v], _i, arr) => ({ name, qty: v.qty, pct: Math.round((v.qty / arr[0][1].qty) * 100) }));

  const rp = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

  const summaryStats = [
    { label: 'Total Pendapatan', value: rp(totalRevenue) },
    { label: 'Total Transaksi', value: totalTx.toLocaleString('id-ID') },
    { label: 'Rata-rata Order', value: rp(avgOrder) },
    { label: 'Produk Berbeda', value: String(Object.keys(productMap).length) },
  ];

  return (
    <div className="flex min-h-screen" style={{ background: '#020617', backgroundImage: 'radial-gradient(ellipse 70% 50% at 10% 0%,rgba(99,102,241,.25) 0%,transparent 60%),radial-gradient(ellipse 60% 45% at 90% 100%,rgba(59,130,246,.2) 0%,transparent 60%)' }}>
      <Sidebar onLogout={signOut} />
      <main className="flex-1 min-h-screen lg:ml-64">
        <header className="sticky top-0 z-40 pl-14 pr-6 lg:px-8 py-4 flex items-center justify-between" style={{ background: 'rgba(2,6,23,.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <div>
            <h1 className="text-xl font-black text-white">Analytics</h1>
            <p className="text-xs text-white/40">Analisis penjualan & performa bisnis</p>
          </div>
          <div className="flex gap-2">
            {(['7d', '30d', '90d', '1y'] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 lg:px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all border ${period === p ? 'bg-indigo-500/25 border-indigo-500/60 text-white' : 'border-white/10 text-white/40 hover:border-white/25'}`}>
                {p === '7d' ? '7H' : p === '30d' ? '30H' : p === '90d' ? '3B' : '1T'}
              </button>
            ))}
          </div>
        </header>

        <div className="p-6 lg:p-8 space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryStats.map(s => (
              <div key={s.label} className={`${GLASS} p-5`}>
                <p className="text-xs text-white/40 mb-1">{s.label}</p>
                <p className="text-xl lg:text-2xl font-black text-white">{s.value}</p>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className={`${GLASS} p-8 text-center`}>
              <p className="text-white/40 text-sm">Belum ada data transaksi untuk periode ini</p>
              <p className="text-white/25 text-xs mt-1">Buat order di POS Kasir untuk mulai melihat analytics</p>
            </div>
          )}

          {/* Revenue Chart */}
          <div className={`${GLASS} p-6`}>
            <h3 className="text-sm font-bold text-white mb-4">Grafik Pendapatan</h3>
            <div style={{ height: '240px' }}>
              <Line data={revenueData} options={CHART_OPTS as any} />
            </div>
          </div>

          {/* Hourly + Category */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`${GLASS} p-6 lg:col-span-2`}>
              <h3 className="text-sm font-bold text-white mb-4">Distribusi per Jam</h3>
              <div style={{ height: '200px' }}>
                <Bar data={hourlyData} options={CHART_OPTS as any} />
              </div>
            </div>
            <div className={`${GLASS} p-6`}>
              <h3 className="text-sm font-bold text-white mb-4">Kategori Produk</h3>
              <div style={{ height: '160px' }} className="flex items-center justify-center">
                <Doughnut data={categoryData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: 'rgba(255,255,255,.6)', font: { size: 11 }, padding: 12 } } }, cutout: '65%' }} />
              </div>
            </div>
          </div>

          {/* Top Products */}
          {topProducts.length > 0 && (
            <div className={`${GLASS} p-6`}>
              <h3 className="text-sm font-bold text-white mb-4">Produk Terlaris</h3>
              <div className="space-y-3">
                {topProducts.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-4">
                    <span className="text-xs font-black text-white/30 w-5 text-center">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-semibold text-white">{p.name}</span>
                        <span className="text-xs text-white/50">{p.qty} pcs</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5">
                        <div className="h-full rounded-full transition-all" style={{ width: `${p.pct}%`, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
