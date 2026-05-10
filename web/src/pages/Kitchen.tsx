import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useOrders } from '../hooks/useOrders';
import OrderCard from '../components/kds/OrderCard';

export default function Kitchen() {
  const { user, signOut } = useSupabaseAuth();
  const { orders: pendingOrders, loading: loadingPending } = useOrders('demo_company', ['pending']);
  const { orders: preparingOrders, loading: loadingPreparing } = useOrders('demo_company', ['preparing']);
  const { orders: readyOrders, loading: loadingReady } = useOrders('demo_company', ['ready']);

  const loading = loadingPending || loadingPreparing || loadingReady;

  return (
    <div className="min-h-screen flex flex-col" style={{ 
      background: '#061820',
      backgroundImage: 'radial-gradient(ellipse 70% 50% at 10% 0%, rgba(13,59,74,0.6) 0%, transparent 60%), radial-gradient(ellipse 60% 45% at 90% 100%, rgba(201,168,76,0.08) 0%, transparent 60%)'
    }}>
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b"
              style={{ 
                background: 'rgba(2,6,23,0.7)', 
                backdropFilter: 'blur(20px)',
                borderColor: 'rgba(255,255,255,0.08)' 
              }}>
        <div>
          <h1 className="text-2xl font-bold text-white">Kitchen Display System</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Cleco Pii - {user?.email}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-white/60">Total Orders</p>
            <p className="text-2xl font-bold" style={{ color: '#C9A84C' }}>
              {pendingOrders.length + preparingOrders.length + readyOrders.length}
            </p>
          </div>
          <button
            onClick={signOut}
            className="px-6 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{ 
              background: 'rgba(239,68,68,0.2)', 
              color: '#fca5a5', 
              border: '1px solid rgba(239,68,68,0.3)' 
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="px-6 py-4 flex gap-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: '#3b82f6' }}></div>
          <span className="text-white font-semibold">Pending: {pendingOrders.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: '#fbbf24' }}></div>
          <span className="text-white font-semibold">Preparing: {preparingOrders.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: '#22c55e' }}></div>
          <span className="text-white font-semibold">Ready: {readyOrders.length}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white text-xl">Loading orders...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Pending Column */}
            <div>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: '#3b82f6' }}></div>
                Pending ({pendingOrders.length})
              </h2>
              <div className="space-y-4">
                {pendingOrders.length === 0 ? (
                  <div className="text-center py-12 text-white/40">
                    No pending orders
                  </div>
                ) : (
                  pendingOrders.map(order => (
                    <OrderCard key={order.id} order={order} companyId="demo_company" />
                  ))
                )}
              </div>
            </div>

            {/* Preparing Column */}
            <div>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: '#fbbf24' }}></div>
                Preparing ({preparingOrders.length})
              </h2>
              <div className="space-y-4">
                {preparingOrders.length === 0 ? (
                  <div className="text-center py-12 text-white/40">
                    No orders in preparation
                  </div>
                ) : (
                  preparingOrders.map(order => (
                    <OrderCard key={order.id} order={order} companyId="demo_company" />
                  ))
                )}
              </div>
            </div>

            {/* Ready Column */}
            <div>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: '#22c55e' }}></div>
                Ready ({readyOrders.length})
              </h2>
              <div className="space-y-4">
                {readyOrders.length === 0 ? (
                  <div className="text-center py-12 text-white/40">
                    No orders ready
                  </div>
                ) : (
                  readyOrders.map(order => (
                    <OrderCard key={order.id} order={order} companyId="demo_company" />
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
