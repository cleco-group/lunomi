import { useState } from 'react';
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

const DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const HOURS = ['08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function randRange(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

export default function Analytics() {
  const { signOut } = useSupabaseAuth();
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('7d');

  const revenueData = {
    labels: period === '7d' ? DAYS : period === '30d' ? Array.from({ length: 30 }, (_, i) => `${i + 1}`) : period === '90d' ? Array.from({ length: 12 }, (_, i) => `Mg ${i + 1}`) : MONTHS,
    datasets: [{
      label: 'Pendapatan',
      data: Array.from({ length: period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 12 : 12 }, () => randRange(800000, 3500000)),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,.15)',
      tension: 0.4, fill: true,
      pointBackgroundColor: '#6366f1',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
    }],
  };

  const hourlyData = {
    labels: HOURS,
    datasets: [{
      label: 'Transaksi',
      data: HOURS.map(() => randRange(0, 25)),
      backgroundColor: 'rgba(99,102,241,.6)',
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  const categoryData = {
    labels: ['Makanan', 'Minuman', 'Dessert', 'Snack'],
    datasets: [{
      data: [45, 30, 15, 10],
      backgroundColor: ['rgba(99,102,241,.8)', 'rgba(34,197,94,.8)', 'rgba(245,158,11,.8)', 'rgba(236,72,153,.8)'],
      borderWidth: 0,
    }],
  };

  const topProducts = [
    { name: 'Nasi Goreng Spesial', qty: 142, revenue: 2840000, pct: 100 },
    { name: 'Es Teh Manis', qty: 128, revenue: 640000, pct: 90 },
    { name: 'Ayam Bakar Madu', qty: 95, revenue: 2850000, pct: 67 },
    { name: 'Mie Goreng', qty: 88, revenue: 1760000, pct: 62 },
    { name: 'Jus Alpukat', qty: 76, revenue: 1140000, pct: 54 },
  ];

  const rp = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

  const summaryStats = [
    { label: 'Total Pendapatan', value: rp(47250000), change: '+12.5%', positive: true },
    { label: 'Total Transaksi', value: '1.284', change: '+8.3%', positive: true },
    { label: 'Rata-rata Order', value: rp(36800), change: '+3.7%', positive: true },
    { label: 'Customer Baru', value: '48', change: '-2.1%', positive: false },
  ];

  return (
    <div className="flex min-h-screen" style={{ background: '#020617', backgroundImage: 'radial-gradient(ellipse 70% 50% at 10% 0%,rgba(99,102,241,.25) 0%,transparent 60%),radial-gradient(ellipse 60% 45% at 90% 100%,rgba(59,130,246,.2) 0%,transparent 60%)' }}>
      <Sidebar onLogout={signOut} />
      <main className="flex-1 min-h-screen lg:ml-64">
        <header className="sticky top-0 z-40 px-8 py-4 flex items-center justify-between" style={{ background: 'rgba(2,6,23,.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <div>
            <h1 className="text-xl font-black text-white">Analytics</h1>
            <p className="text-xs text-white/40">Analisis penjualan & performa bisnis</p>
          </div>
          <div className="flex gap-2">
            {(['7d', '30d', '90d', '1y'] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all border ${period === p ? 'bg-indigo-500/25 border-indigo-500/60 text-white' : 'border-white/10 text-white/40 hover:border-white/25'}`}>
                {p === '7d' ? '7 Hari' : p === '30d' ? '30 Hari' : p === '90d' ? '3 Bulan' : '1 Tahun'}
              </button>
            ))}
          </div>
        </header>

        <div className="p-8 space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryStats.map(s => (
              <div key={s.label} className={`${GLASS} p-5`}>
                <p className="text-xs text-white/40 mb-1">{s.label}</p>
                <p className="text-2xl font-black text-white mb-1">{s.value}</p>
                <p className={`text-xs font-semibold ${s.positive ? 'text-green-400' : 'text-red-400'}`}>{s.change} vs periode lalu</p>
              </div>
            ))}
          </div>

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
              <h3 className="text-sm font-bold text-white mb-4">Transaksi per Jam</h3>
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
          <div className={`${GLASS} p-6`}>
            <h3 className="text-sm font-bold text-white mb-4">Produk Terlaris</h3>
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-4">
                  <span className="text-xs font-black text-white/30 w-5 text-center">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-white">{p.name}</span>
                      <div className="text-right">
                        <span className="text-xs text-white/50 mr-3">{p.qty} pcs</span>
                        <span className="text-xs font-bold text-green-400">{rp(p.revenue)}</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5">
                      <div className="h-full rounded-full transition-all" style={{ width: `${p.pct}%`, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
