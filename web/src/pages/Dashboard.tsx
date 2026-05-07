import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { Line } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
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

interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrder: number;
  newCustomers: number;
}

interface TopProduct {
  name: string;
  quantity: number;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrder: 0,
    newCustomers: 0
  });
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [salesData, setSalesData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get today's orders
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const ordersRef = collection(db, 'companies/demo_company/orders');
      const todayQuery = query(
        ordersRef,
        where('createdAt', '>=', Timestamp.fromDate(today)),
        where('status', 'in', ['completed', 'ready', 'preparing'])
      );
      
      const todaySnapshot = await getDocs(todayQuery);
      
      let totalRevenue = 0;
      const productCounts: { [key: string]: number } = {};
      
      todaySnapshot.forEach(doc => {
        const data = doc.data();
        totalRevenue += data.totalAmount || 0;
        
        // Count products (would need to query items subcollection for real data)
      });
      
      // Get last 7 days data for chart
      const last7Days = [];
      const salesByDay: number[] = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const dayQuery = query(
          ordersRef,
          where('createdAt', '>=', Timestamp.fromDate(date)),
          where('createdAt', '<', Timestamp.fromDate(nextDay)),
          where('status', 'in', ['completed', 'ready'])
        );
        
        const daySnapshot = await getDocs(dayQuery);
        let dayRevenue = 0;
        daySnapshot.forEach(doc => {
          dayRevenue += doc.data().totalAmount || 0;
        });
        
        salesByDay.push(dayRevenue / 1000000); // Convert to millions
      }
      
      // Get customers count (simplified)
      const customersRef = collection(db, 'companies/demo_company/customers');
      const customersSnapshot = await getDocs(customersRef);
      
      setMetrics({
        totalRevenue,
        totalOrders: todaySnapshot.size,
        averageOrder: todaySnapshot.size > 0 ? totalRevenue / todaySnapshot.size : 0,
        newCustomers: customersSnapshot.size
      });
      
      setSalesData(salesByDay);
      
      // Mock top products for now
      setTopProducts([
        { name: 'Nasi Goreng Spesial', quantity: 42 },
        { name: 'Es Teh Manis', quantity: 38 },
        { name: 'Ayam Bakar Madu', quantity: 25 }
      ]);
      
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
    datasets: [
      {
        label: 'Penjualan (Juta Rp)',
        data: salesData,
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#061820' }}>
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ 
      background: '#061820',
      backgroundImage: 'radial-gradient(ellipse 70% 50% at 10% 0%, rgba(13,59,74,0.6) 0%, transparent 60%), radial-gradient(ellipse 60% 45% at 90% 100%, rgba(201,168,76,0.08) 0%, transparent 60%)'
    }}>
      <Sidebar onLogout={logout} />

      <main className="flex-1 min-h-screen" style={{ marginLeft: '256px' }}>
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
              {user?.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="p-6 rounded-2xl transition-transform hover:-translate-y-1"
                 style={{ background: 'rgba(13,59,74,0.4)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Total Penjualan Hari Ini</p>
              <h3 className="text-2xl font-bold text-white">
                Rp {metrics.totalRevenue.toLocaleString('id-ID')}
              </h3>
              <p className="text-xs mt-2 text-green-400">Real-time data</p>
            </div>
            
            <div className="p-6 rounded-2xl transition-transform hover:-translate-y-1"
                 style={{ background: 'rgba(13,59,74,0.4)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Total Transaksi</p>
              <h3 className="text-2xl font-bold text-white">{metrics.totalOrders}</h3>
              <p className="text-xs mt-2 text-green-400">Hari ini</p>
            </div>
            
            <div className="p-6 rounded-2xl transition-transform hover:-translate-y-1"
                 style={{ background: 'rgba(13,59,74,0.4)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Rata-rata Order</p>
              <h3 className="text-2xl font-bold text-white">
                Rp {Math.round(metrics.averageOrder).toLocaleString('id-ID')}
              </h3>
              <p className="text-xs mt-2 text-white/50">Per transaksi</p>
            </div>
            
            <div className="p-6 rounded-2xl transition-transform hover:-translate-y-1"
                 style={{ background: 'rgba(13,59,74,0.4)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Total Customer</p>
              <h3 className="text-2xl font-bold text-white">{metrics.newCustomers}</h3>
              <p className="text-xs mt-2 text-white/50">Terdaftar</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-6 rounded-2xl min-h-[300px]" 
                 style={{ background: 'rgba(13,59,74,0.4)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="font-bold mb-4 text-white">Grafik Penjualan (7 Hari Terakhir)</h3>
              <Line data={chartData} options={chartOptions} />
            </div>

            <div className="p-6 rounded-2xl min-h-[300px]" 
                 style={{ background: 'rgba(13,59,74,0.4)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="font-bold mb-4 text-white">Produk Terlaris</h3>
              <div className="space-y-4">
                {topProducts.map((product, idx) => (
                  <div key={idx} className="flex justify-between items-center text-white">
                    <span>{product.name}</span>
                    <span className="font-bold">{product.quantity} porsi</span>
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
