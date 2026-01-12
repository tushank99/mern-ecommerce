import Message from "../../components/Message";
import Loader from "../../components/Loader";
import { Link } from "react-router-dom";
import { useGetOrdersQuery } from "../../redux/api/orderApiSlice";
import AdminMenu from "./AdminMenu";
import { FaEye, FaPaypal, FaCreditCard, FaTruck, FaBox, FaCheckCircle, FaTimesCircle, FaCalendarAlt, FaUser, FaDollarSign } from "react-icons/fa";
import { getImageUrl, handleImageError } from "../../Utils/imageUtils";

const OrderList = () => {
  const { data: orders, isLoading, error } = useGetOrdersQuery();

  // Calculate statistics
  const getStats = () => {
    if (!orders) return { total: 0, paid: 0, unpaid: 0, delivered: 0, revenue: 0 };
    return {
      total: orders.length,
      paid: orders.filter(o => o.isPaid).length,
      unpaid: orders.filter(o => !o.isPaid).length,
      delivered: orders.filter(o => o.isDelivered).length,
      revenue: orders.filter(o => o.isPaid).reduce((sum, o) => sum + o.totalPrice, 0)
    };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <AdminMenu />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Order Management</h1>
          <p className="text-gray-400">Track and manage all customer orders</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader />
          </div>
        ) : error ? (
          <Message variant="danger">
            {error?.data?.message || error.error}
          </Message>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <FaBox className="text-blue-400 text-xl" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Orders</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <FaCheckCircle className="text-green-400 text-xl" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Paid Orders</p>
                    <p className="text-2xl font-bold text-white">{stats.paid}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <FaTimesCircle className="text-red-400 text-xl" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Unpaid</p>
                    <p className="text-2xl font-bold text-white">{stats.unpaid}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <FaTruck className="text-purple-400 text-xl" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Delivered</p>
                    <p className="text-2xl font-bold text-white">{stats.delivered}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <FaDollarSign className="text-yellow-400 text-xl" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Revenue</p>
                    <p className="text-2xl font-bold text-white">₹{stats.revenue.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700/50">
                    <tr>
                      <th className="text-left py-4 px-4 text-gray-300 font-semibold text-sm">Product</th>
                      <th className="text-left py-4 px-4 text-gray-300 font-semibold text-sm">Order ID</th>
                      <th className="text-left py-4 px-4 text-gray-300 font-semibold text-sm">Customer</th>
                      <th className="text-left py-4 px-4 text-gray-300 font-semibold text-sm">Date</th>
                      <th className="text-left py-4 px-4 text-gray-300 font-semibold text-sm">Total</th>
                      <th className="text-left py-4 px-4 text-gray-300 font-semibold text-sm">Payment</th>
                      <th className="text-left py-4 px-4 text-gray-300 font-semibold text-sm">Delivery</th>
                      <th className="text-center py-4 px-4 text-gray-300 font-semibold text-sm">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-700">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-700/30 transition-colors">
                        {/* Product Image */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={getImageUrl(order.orderItems[0]?.image)}
                              alt={order._id}
                              onError={handleImageError}
                              className="w-14 h-14 object-cover rounded-lg border border-gray-600"
                            />
                            <div>
                              <p className="text-white text-sm font-medium truncate max-w-[150px]">
                                {order.orderItems[0]?.name}
                              </p>
                              {order.orderItems.length > 1 && (
                                <p className="text-gray-400 text-xs">
                                  +{order.orderItems.length - 1} more items
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Order ID */}
                        <td className="py-4 px-4">
                          <p className="text-gray-300 text-sm font-mono">
                            #{order._id.slice(-8).toUpperCase()}
                          </p>
                        </td>

                        {/* Customer */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                              <FaUser className="text-white text-xs" />
                            </div>
                            <span className="text-gray-300 text-sm">
                              {order.user ? order.user.username : "Guest"}
                            </span>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="text-gray-500 text-xs" />
                            <span className="text-gray-300 text-sm">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              }) : "N/A"}
                            </span>
                          </div>
                        </td>

                        {/* Total */}
                        <td className="py-4 px-4">
                          <p className="text-white font-semibold">₹{order.totalPrice.toFixed(2)}</p>
                        </td>

                        {/* Payment Status */}
                        <td className="py-4 px-4">
                          {order.isPaid ? (
                            <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-1.5 rounded-full">
                              <FaPaypal className="text-sm" />
                              <span className="text-sm font-medium">Paid</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1.5 rounded-full">
                              <FaCreditCard className="text-sm" />
                              <span className="text-sm font-medium">Pending</span>
                            </div>
                          )}
                          {order.isPaid && order.paidAt && (
                            <p className="text-gray-500 text-xs mt-1">
                              {new Date(order.paidAt).toLocaleDateString()}
                            </p>
                          )}
                        </td>

                        {/* Delivery Status */}
                        <td className="py-4 px-4">
                          {order.isDelivered ? (
                            <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-1.5 rounded-full">
                              <FaTruck className="text-sm" />
                              <span className="text-sm font-medium">Delivered</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-3 py-1.5 rounded-full">
                              <FaBox className="text-sm" />
                              <span className="text-sm font-medium">Processing</span>
                            </div>
                          )}
                          {order.isDelivered && order.deliveredAt && (
                            <p className="text-gray-500 text-xs mt-1">
                              {new Date(order.deliveredAt).toLocaleDateString()}
                            </p>
                          )}
                        </td>

                        {/* Action */}
                        <td className="py-4 px-4 text-center">
                          <Link to={`/order/${order._id}`}>
                            <button className="inline-flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium">
                              <FaEye />
                              <span>View</span>
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {orders.length === 0 && (
                <div className="text-center py-12">
                  <FaBox className="text-gray-600 text-5xl mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No orders found</p>
                  <p className="text-gray-500 text-sm">Orders will appear here when customers make purchases</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderList;
