import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Messsage from "../../components/Message";
import Loader from "../../components/Loader";
import {
  useDeliverOrderMutation,
  useGetOrderDetailsQuery,
  useGetPaypalClientIdQuery,
  usePayOrderMutation,
} from "../../redux/api/orderApiSlice";
import { FaPaypal, FaTruck, FaCheckCircle, FaTimesCircle, FaMapMarkerAlt, FaUser, FaEnvelope, FaCreditCard, FaBox } from "react-icons/fa";
import { getImageUrl, handleImageError } from "../../Utils/imageUtils";

const Order = () => {
  const { id: orderId } = useParams();

  const {
    data: order,
    refetch,
    isLoading,
    error,
  } = useGetOrderDetailsQuery(orderId);

  const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation();
  const [deliverOrder, { isLoading: loadingDeliver }] =
    useDeliverOrderMutation();
  const { userInfo } = useSelector((state) => state.auth);

  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

  const {
    data: paypal,
    isLoading: loadingPaPal,
    error: errorPayPal,
  } = useGetPaypalClientIdQuery();

  useEffect(() => {
    if (!errorPayPal && !loadingPaPal && paypal.clientId) {
      const loadingPaPalScript = async () => {
        paypalDispatch({
          type: "resetOptions",
          value: {
            "client-id": paypal.clientId,
            currency: "INR",
          },
        });
        paypalDispatch({ type: "setLoadingStatus", value: "pending" });
      };

      if (order && !order.isPaid) {
        if (!window.paypal) {
          loadingPaPalScript();
        }
      }
    }
  }, [errorPayPal, loadingPaPal, order, paypal, paypalDispatch]);

  function onApprove(data, actions) {
    return actions.order.capture().then(async function (details) {
      try {
        await payOrder({ orderId, details });
        refetch();
        toast.success("Payment successful! Thank you for your order.");
      } catch (error) {
        toast.error(error?.data?.message || error.message);
      }
    });
  }

  function createOrder(data, actions) {
    return actions.order
      .create({
        purchase_units: [{ amount: { value: order.totalPrice } }],
      })
      .then((orderID) => {
        return orderID;
      });
  }

  function onError(err) {
    toast.error(err.message);
  }

  const deliverHandler = async () => {
    await deliverOrder(orderId);
    refetch();
    toast.success("Order marked as delivered!");
  };

  return isLoading ? (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <Loader />
    </div>
  ) : error ? (
    <div className="min-h-screen bg-gray-900 p-8">
      <Messsage variant="danger">{error.data.message}</Messsage>
    </div>
  ) : (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4 ml-[5%]">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-white">Order Details</h1>
            {order.isPaid && order.isDelivered && (
              <span className="bg-green-500/20 text-green-400 px-4 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                <FaCheckCircle /> Completed
              </span>
            )}
          </div>
          <p className="text-gray-400 font-mono">Order #{order._id}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items Card */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FaBox className="text-pink-400" /> Order Items
                </h2>
              </div>

              {order.orderItems.length === 0 ? (
                <div className="p-6">
                  <Messsage>Order is empty</Messsage>
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {order.orderItems.map((item, index) => (
                    <div key={index} className="p-4 flex items-center gap-4 hover:bg-gray-700/30 transition-colors">
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        onError={handleImageError}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-600"
                      />
                      <div className="flex-1">
                        <Link
                          to={`/product/${item.product}`}
                          className="text-white hover:text-pink-400 font-medium transition-colors"
                        >
                          {item.name}
                        </Link>
                        <p className="text-gray-400 text-sm mt-1">Qty: {item.qty} × ₹{item.price}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold text-lg">
                          ₹{(item.qty * item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Shipping & Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shipping Address */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-pink-400" /> Shipping Address
                </h3>
                <div className="space-y-2 text-gray-300">
                  <p>{order.shippingAddress.address}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                  <p>{order.shippingAddress.country}</p>
                </div>
                <div className="mt-4">
                  {order.isDelivered ? (
                    <div className="flex items-center gap-2 text-green-400 bg-green-500/20 px-3 py-2 rounded-lg">
                      <FaCheckCircle />
                      <span className="text-sm">Delivered on {new Date(order.deliveredAt).toLocaleDateString()}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-yellow-400 bg-yellow-500/20 px-3 py-2 rounded-lg">
                      <FaTruck />
                      <span className="text-sm">In Transit</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FaUser className="text-pink-400" /> Customer Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <FaUser className="text-gray-400" />
                    <span className="text-gray-300">{order.user.username}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaEnvelope className="text-gray-400" />
                    <a href={`mailto:${order.user.email}`} className="text-pink-400 hover:text-pink-300">
                      {order.user.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaCreditCard className="text-gray-400" />
                    <span className="text-gray-300">{order.paymentMethod}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary & Payment */}
          <div className="space-y-6">
            {/* Payment Status */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FaPaypal className="text-blue-400" /> Payment Status
              </h3>
              {order.isPaid ? (
                <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <FaCheckCircle className="text-green-400 text-2xl" />
                    <div>
                      <p className="text-green-400 font-bold">Payment Successful</p>
                      <p className="text-green-400/70 text-sm">
                        Paid on {new Date(order.paidAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  {order.paymentResult && (
                    <div className="mt-3 pt-3 border-t border-green-500/30 text-sm">
                      <p className="text-gray-400">Transaction ID: <span className="text-white font-mono">{order.paymentResult.id}</span></p>
                      {order.paymentResult.email_address && (
                        <p className="text-gray-400 mt-1">PayPal: <span className="text-white">{order.paymentResult.email_address}</span></p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <FaTimesCircle className="text-red-400 text-2xl" />
                    <div>
                      <p className="text-red-400 font-bold">Payment Pending</p>
                      <p className="text-red-400/70 text-sm">Complete payment to process your order</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>₹{order.itemsPrice}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Shipping</span>
                  <span>₹{order.shippingPrice}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Tax</span>
                  <span>₹{order.taxPrice}</span>
                </div>
                <div className="border-t border-gray-700 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-white font-bold text-lg">Total</span>
                    <span className="text-pink-400 font-bold text-xl">₹{order.totalPrice}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PayPal Button */}
            {!order.isPaid && (
              <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Complete Payment</h3>
                {loadingPay && <Loader />}
                {isPending ? (
                  <Loader />
                ) : (
                  <div className="bg-white rounded-xl p-4">
                    <PayPalButtons
                      createOrder={createOrder}
                      onApprove={onApprove}
                      onError={onError}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Admin: Mark as Delivered */}
            {loadingDeliver && <Loader />}
            {userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered && (
              <button
                type="button"
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                onClick={deliverHandler}
              >
                <FaTruck /> Mark As Delivered
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;
