import { Link, useParams } from "react-router-dom";
import { FaCheckCircle, FaHome, FaFileAlt } from "react-icons/fa";

const OrderSuccess = () => {
  const { id: orderId } = useParams();

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-gray-800 rounded-3xl border border-gray-700 p-8 text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4">
            <FaCheckCircle className="text-green-400 text-5xl" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Order Confirmed!</h1>
          <p className="text-gray-400">Thank you for your purchase</p>
        </div>

        {/* Order Info */}
        <div className="bg-gray-700/50 rounded-xl p-4 mb-6">
          <p className="text-gray-400 text-sm mb-1">Order Number</p>
          <p className="text-white font-mono text-sm break-all">{orderId}</p>
        </div>

        {/* Message */}
        <div className="mb-8">
          <p className="text-gray-300 leading-relaxed">
            Your order has been placed successfully! You will receive an email confirmation shortly. 
            You can track your order status from your orders page.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            to="/"
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
          >
            <FaHome /> Continue Shopping
          </Link>
          
          <Link
            to={`/order/${orderId}`}
            className="w-full bg-gray-700 text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-600 transition-all flex items-center justify-center gap-2"
          >
            <FaFileAlt /> View Order Details
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <p className="text-gray-500 text-sm">
            Need help? Contact our support team for any questions about your order.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
