import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { seedDemoData } from '../lib/seedData';
import toast from 'react-hot-toast';

export default function AdminTools() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSeedData = async () => {
    if (!confirm('⚠️ This will create demo data in Firestore. Continue?')) {
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Seeding data...');

    try {
      await seedDemoData();
      toast.success('✅ Demo data seeded successfully!', { id: toastId });
    } catch (error: any) {
      console.error('Seed error:', error);
      toast.error(`❌ Error: ${error.message}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8" style={{ 
      background: '#061820',
      backgroundImage: 'radial-gradient(ellipse 70% 50% at 10% 0%, rgba(13,59,74,0.6) 0%, transparent 60%), radial-gradient(ellipse 60% 45% at 90% 100%, rgba(201,168,76,0.08) 0%, transparent 60%)'
    }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">🛠️ Admin Tools</h1>
            <p className="text-white/60">Database management and utilities</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{ background: 'rgba(239,68,68,0.2)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            Logout
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 rounded-xl mb-6" 
             style={{ background: 'rgba(13,59,74,0.5)', backdropFilter: 'blur(16px)', border: '1px solid rgba(201,168,76,0.2)' }}>
          <h2 className="text-lg font-bold text-white mb-2">Current User</h2>
          <p className="text-white/80">{user?.email}</p>
          <p className="text-white/60 text-sm">UID: {user?.uid}</p>
        </div>

        {/* Seed Data Section */}
        <div className="p-6 rounded-xl" 
             style={{ background: 'rgba(13,59,74,0.5)', backdropFilter: 'blur(16px)', border: '1px solid rgba(201,168,76,0.2)' }}>
          <h2 className="text-xl font-bold text-white mb-4">🌱 Seed Demo Data</h2>
          
          <div className="mb-6 p-4 rounded-lg" style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)' }}>
            <p className="text-white/90 mb-2">This will create:</p>
            <ul className="text-white/70 text-sm space-y-1 ml-4">
              <li>• 1 Demo Company (Cleco Group)</li>
              <li>• 1 Outlet (Cleco Pii)</li>
              <li>• 10 Products with variants</li>
              <li>• 5 Customers</li>
              <li>• 20 Sample Orders (last 7 days)</li>
            </ul>
          </div>

          <button
            onClick={handleSeedData}
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold transition-all"
            style={{
              background: loading ? 'rgba(201,168,76,0.3)' : 'linear-gradient(135deg, #C9A84C, #a8863a)',
              color: '#0D3B4A',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Seeding Data...
              </>
            ) : (
              '🚀 Seed Demo Data'
            )}
          </button>

          <p className="text-white/50 text-xs mt-4 text-center">
            ⚠️ Warning: This will create data in your Firestore database
          </p>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-6 rounded-xl" 
             style={{ background: 'rgba(13,59,74,0.3)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 className="text-lg font-bold text-white mb-3">📝 Next Steps</h3>
          <ol className="text-white/70 text-sm space-y-2 ml-4">
            <li>1. Click "Seed Demo Data" button above</li>
            <li>2. Wait for completion (~30 seconds)</li>
            <li>3. Go to Dashboard to see real data</li>
            <li>4. Check Firebase Console to verify data</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
