import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Package, CheckCircle, XCircle, Clock, RefreshCw, ExternalLink } from 'lucide-react';

export default function ShopifyOrders({ brandId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, cancelled

  useEffect(() => {
    loadOrders();
    
    // Subscribe to real-time updates
    const subscription = supabase
      .channel('shopify_orders_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'shopify_orders',
        filter: `brand_id=eq.${brandId}`
      }, () => {
        loadOrders();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [brandId, filter]);

  const loadOrders = async () => {
    try {
      let query = supabase
        .from('shopify_orders')
        .select('*')
        .eq('brand_id', brandId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (filter !== 'all') {
        query = query.eq('confirmation_status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Get contacts separately if needed
      if (data && data.length > 0) {
        const contactIds = data.map(o => o.contact_id).filter(Boolean);
        if (contactIds.length > 0) {
          const { data: contactsData } = await supabase
            .from('contacts')
            .select('id, name, wa_id')
            .in('id', contactIds);
          
          // Merge contacts into orders
          const ordersWithContacts = data.map(order => ({
            ...order,
            contacts: contactsData?.find(c => c.id === order.contact_id) || null
          }));
          
          setOrders(ordersWithContacts);
        } else {
          setOrders(data);
        }
      } else {
        setOrders(data || []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'تم التأكيد';
      case 'cancelled':
        return 'تم الإلغاء';
      case 'pending':
      default:
        return 'في الانتظار';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">طلبات Shopify</h2>
                <p className="text-sm text-gray-600 mt-1">
                  تتبع حالة الطلبات المرسلة عبر WhatsApp
                </p>
              </div>
            </div>
            <button
              onClick={loadOrders}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4" />
              تحديث
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              الكل ({orders.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              في الانتظار
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'confirmed'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              مؤكدة
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'cancelled'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ملغاة
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="divide-y divide-gray-200">
          {orders.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">لا توجد طلبات</p>
              <p className="text-sm mt-1">سيتم عرض الطلبات هنا عند إرسالها</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(order.confirmation_status)}
                      <h3 className="font-semibold text-gray-900">
                        طلب {order.shopify_order_number || order.shopify_order_id}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.confirmation_status)}`}>
                        {getStatusText(order.confirmation_status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                      <div>
                        <span className="text-gray-600">العميل:</span>
                        <span className="font-medium text-gray-900 mr-2">
                          {order.contacts?.name || order.customer_phone}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">الهاتف:</span>
                        <span className="font-mono text-gray-900 mr-2">
                          {order.customer_phone}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">الإجمالي:</span>
                        <span className="font-medium text-gray-900 mr-2">
                          {order.total_price} {order.currency || 'EGP'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">التاريخ:</span>
                        <span className="text-gray-900 mr-2">
                          {new Date(order.created_at).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>

                    {order.confirmed_at && (
                      <div className="mt-2 text-xs text-green-600">
                        ✅ تم التأكيد: {new Date(order.confirmed_at).toLocaleString('ar-EG')}
                      </div>
                    )}

                    {order.cancelled_at && (
                      <div className="mt-2 text-xs text-red-600">
                        ❌ تم الإلغاء: {new Date(order.cancelled_at).toLocaleString('ar-EG')}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mr-4">
                    {order.shopify_order_id && (
                      <a
                        href={`https://admin.shopify.com/store/orders/${order.shopify_order_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="فتح في Shopify"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
