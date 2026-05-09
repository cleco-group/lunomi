import { useState, useEffect } from 'react';
import { updateOrderStatus } from '../../lib/updateOrderStatus';
import toast from 'react-hot-toast';

interface OrderCardProps {
  order: any;
  companyId: string;
}

export default function OrderCard({ order, companyId }: OrderCardProps) {
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (order.createdAt?.seconds) {
        const now = Date.now();
        const created = order.createdAt.seconds * 1000;
        setElapsed(Math.floor((now - created) / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [order.createdAt]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStatusChange = async (newStatus: 'preparing' | 'ready' | 'completed') => {
    setLoading(true);
    try {
      await updateOrderStatus(companyId, order.id, newStatus);
      toast.success(`Order ${order.orderNumber} updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const isUrgent = elapsed > 900; // 15 minutes
  const statusColor = {
    pending: 'rgba(59, 130, 246, 0.2)',
    preparing: 'rgba(251, 191, 36, 0.2)',
    ready: 'rgba(34, 197, 94, 0.2)'
  }[order.status] || 'rgba(255,255,255,0.1)';

  return (
    <div
      className="p-5 rounded-xl transition-all"
      style={{
        background: statusColor,
        backdropFilter: 'blur(16px)',
        border: isUrgent ? '2px solid #ef4444' : '1px solid rgba(255,255,255,0.2)',
        animation: isUrgent ? 'pulse 2s infinite' : 'none'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">{order.orderNumber}</h3>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {order.orderType === 'dine_in' && '🍽️ Dine In'}
            {order.orderType === 'takeaway' && '🥡 Takeaway'}
            {order.orderType === 'delivery' && '🛵 Delivery'}
          </p>
        </div>
        <div className="text-right">
          <div 
            className="text-2xl font-bold"
            style={{ color: isUrgent ? '#ef4444' : '#C9A84C' }}
          >
            {formatTime(elapsed)}
          </div>
          {isUrgent && (
            <span className="text-xs text-red-400 font-semibold">URGENT!</span>
          )}
        </div>
      </div>

      {/* Items - Placeholder for now */}
      <div 
        className="mb-4 p-3 rounded-lg"
        style={{ background: 'rgba(0,0,0,0.2)' }}
      >
        <p className="text-white text-sm">
          Total: Rp {order.totalAmount?.toLocaleString('id-ID')}
        </p>
        <p className="text-white/60 text-xs mt-1">
          {/* Items will be loaded from subcollection */}
          View items in detail...
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {order.status === 'pending' && (
          <button
            onClick={() => handleStatusChange('preparing')}
            disabled={loading}
            className="flex-1 py-2 rounded-lg font-semibold transition-all"
            style={{
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              color: '#0D3B4A'
            }}
          >
            Start
          </button>
        )}
        {order.status === 'preparing' && (
          <button
            onClick={() => handleStatusChange('ready')}
            disabled={loading}
            className="flex-1 py-2 rounded-lg font-semibold transition-all"
            style={{
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: 'white'
            }}
          >
            Ready
          </button>
        )}
        {order.status === 'ready' && (
          <button
            onClick={() => handleStatusChange('completed')}
            disabled={loading}
            className="flex-1 py-2 rounded-lg font-semibold transition-all"
            style={{
              background: 'linear-gradient(135deg, #C9A84C, #a8863a)',
              color: '#0D3B4A'
            }}
          >
            Complete
          </button>
        )}
      </div>
    </div>
  );
}
