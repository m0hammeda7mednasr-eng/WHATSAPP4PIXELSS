import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Package, DollarSign, MapPin, User, Calendar } from 'lucide-react';

export default function OrderMessageCard({ orderId }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('shopify_orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (!error && data) {
        setOrder(data);
      }
    } catch (err) {
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 my-2 animate-pulse">
        <div className="h-4 bg-blue-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-blue-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!order) return null;

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    confirmed: 'bg-green-100 text-green-800 border-green-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300'
  };

  const statusLabels = {
    pending: '⏳ في انتظار التأكيد',
    confirmed: '✅ تم التأكيد',
    cancelled: '❌ تم الإلغاء'
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 my-2 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-600" />
          <span className="font-bold text-blue-900">
            طلب #{order.shopify_order_number || order.shopify_order_id}
          </span>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-medium border ${statusColors[order.confirmation_status] || statusColors.pending}`}>
          {statusLabels[order.confirmation_status] || statusLabels.pending}
        </span>
      </div>

      {/* Order Details */}
      <div className="space-y-2 text-sm">
        {/* Total */}
        <div className="flex items-center gap-2 text-gray-700">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span className="font-semibold">الإجمالي:</span>
          <span className="font-bold text-green-700">
            {order.total_price} {order.currency}
          </span>
        </div>

        {/* Customer */}
        {order.customer_phone && (
          <div className="flex items-center gap-2 text-gray-700">
            <User className="w-4 h-4 text-blue-600" />
            <span className="font-semibold">العميل:</span>
            <span className="font-mono text-xs">{order.customer_phone}</span>
          </div>
        )}

        {/* Status */}
        <div className="flex items-center gap-2 text-gray-700">
          <Calendar className="w-4 h-4 text-purple-600" />
          <span className="font-semibold">الحالة:</span>
          <span className="text-xs">{order.order_status}</span>
        </div>

        {/* Confirmation Time */}
        {order.confirmed_at && (
          <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-blue-200">
            تم التأكيد: {new Date(order.confirmed_at).toLocaleString('ar-EG')}
          </div>
        )}

        {/* Cancellation Time */}
        {order.cancelled_at && (
          <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-red-200">
            تم الإلغاء: {new Date(order.cancelled_at).toLocaleString('ar-EG')}
          </div>
        )}
      </div>
    </div>
  );
}
