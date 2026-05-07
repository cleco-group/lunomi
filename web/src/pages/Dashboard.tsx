import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const { user, logout } = useAuth();

  const chartData = {
    labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
    datasets: [
      {
        label: 'Penjualan (Juta Rp)',
        data: [8.5, 10.2, 9.8, 12.4, 11.5, 15.2, 13.8],
        borderColor: '#C9A84C',
        backgroundColor: 'rgba(201, 168, 76, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#C9A84C',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: 'rgba(255,255,255,0.6)' },
        grid: { color: 'rgba(255,255,255,0.1)' },
      },
      x: {
        ticks: { color: 'rgba(255,255,255,0.6)' },
        grid: { color: 'rgba(255,255,255,0.1)' },
      },
    },
  };

  return (
    <div className="flex min-h-screen" style={{ 
      background: '#061820',
      backgroundImage: 'radial-gradient(ellipse 70% 50% at 10% 0%, rgba(13,59,74,0.6) 0%, transparent 60%), radial-gradient(ellipse 60% 45% at 90% 100%, rgba(201,168,76,0.08) 0%, transparent 60%)'
    }}>
      {/* Sidebar */}
      <Sidebar onLogout={logout} />

      {/* Main Content */}
      <main className="flex-1 min-h-screen" style={{ marginLeft: '256px' }}>
        {/* Header */}
        <header className="sticky top-0 z-50 px-8 py-4 flex items-center justify-between"
                style={{ 
                  background: 'rgba(2,6,23,0.7)', 
                  backdropFilter: 'blur(20px)',
                  borderBottom: '1px solid rgba(255,255,255,0.08)' 
                }}>
          <h1 className="text-xl font-bold text-white">Dashboard Utama</h1>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-white">{user?.email}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Owner Access</p>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                 style={{ background: '#6366f1' }}>
              A
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Penjualan', value: 'Rp 12.450.000', change: '↑ 12% dari kemarin', positive: true },
              { label: 'Total Transaksi', value: '142', change: '↑ 5% dari kemarin', positive: true },
              { label: 'Rata-rata Order', value: 'Rp 87.676', change: '↓ 2% dari kemarin', positive: false },
              { label: 'Customer Baru', value: '28', change: '↑ 18% dari kemarin', positive: true },
            ].map((metric, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl transition-transform hover:-translate-y-1"
                style={{ 
                  background: 'rgba(13,59,74,0.4)', 
                  backdropFilter: 'blur(16px)', 
                  border: '1px solid rgba(255,255,255,0.08)' 
                }}
              >
                <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{metric.label}</p>
                <h3 className="text-2xl font-bold text-white">{metric.value}</h3>
                <p className={`text-xs mt-2 ${metric.positive ? 'text-green-400' : 'text-red-400'}`}>
                  {metric.change}
                </p>
              </div>
            ))}
          </div>

          {/* Charts & Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sales Chart */}
            <div className="p-6 rounded-2xl min-h-[300px]" 
                 style={{ 
                   background: 'rgba(13,59,74,0.4)', 
                   backdropFilter: 'blur(16px)', 
                   border: '1px solid rgba(255,255,255,0.08)' 
                 }}>
              <h3 className="font-bold mb-4 text-white">Grafik Penjualan</h3>
              <Line data={chartData} options={chartOptions} />
            </div>

            {/* Top Products */}
            <div className="p-6 rounded-2xl min-h-[300px]" 
                 style={{ 
                   background: 'rgba(13,59,74,0.4)', 
                   backdropFilter: 'blur(16px)', 
                   border: '1px solid rgba(255,255,255,0.08)' 
                 }}>
              <h3 className="font-bold mb-4 text-white">Produk Terlaris</h3>
              <div className="space-y-4">
                {[
                  { name: 'Nasi Goreng Spesial', qty: '42 porsi' },
                  { name: 'Es Teh Manis', qty: '38 gelas' },
                  { name: 'Ayam Bakar Madu', qty: '25 porsi' },
                ].map((product, idx) => (
                  <div key={idx} className="flex justify-between items-center text-white">
                    <span>{product.name}</span>
                    <span className="font-bold">{product.qty}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
