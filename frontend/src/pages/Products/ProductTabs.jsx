import { useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import Ratings from "./Ratings";
import { useGetTopProductsQuery } from "../../redux/api/productApiSlice";
import SmallProduct from "./SmallProduct";
import Loader from "../../components/Loader";
import { FaCheckCircle, FaThumbsUp, FaStar, FaUser, FaShoppingBag } from "react-icons/fa";
import moment from "moment";

const ProductTabs = ({
  loadingProductReview,
  userInfo,
  submitHandler,
  rating,
  setRating,
  comment,
  setComment,
  product,
  canReview,
  canReviewMessage,
  onMarkHelpful,
}) => {
  const { data, isLoading } = useGetTopProductsQuery();
  const [activeTab, setActiveTab] = useState(2); // Default to All Reviews
  const [title, setTitle] = useState("");

  if (isLoading) {
    return <Loader />;
  }

  const handleTabClick = (tabNumber) => {
    setActiveTab(tabNumber);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitHandler(e, title);
  };

  // Calculate rating breakdown
  const ratingBreakdown = [5, 4, 3, 2, 1].map(star => {
    const count = product.reviews.filter(r => Math.round(r.rating) === star).length;
    const percentage = product.reviews.length > 0 ? (count / product.reviews.length) * 100 : 0;
    return { star, count, percentage };
  });

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full">
      {/* Left Side - Tabs */}
      <section className="lg:w-64 flex-shrink-0">
        <div className="bg-gray-800 rounded-xl p-2 space-y-1">
          {canReview && (
            <div
              className={`p-3 cursor-pointer rounded-lg transition-all ${
                activeTab === 1 ? "bg-pink-600 text-white" : "text-gray-300 hover:bg-gray-700"
              }`}
              onClick={() => handleTabClick(1)}
            >
              <span className="font-medium">Write Review</span>
            </div>
          )}
          <div
            className={`p-3 cursor-pointer rounded-lg transition-all ${
              activeTab === 2 ? "bg-pink-600 text-white" : "text-gray-300 hover:bg-gray-700"
            }`}
            onClick={() => handleTabClick(2)}
          >
            <span className="font-medium">All Reviews ({product.reviews.length})</span>
          </div>
          <div
            className={`p-3 cursor-pointer rounded-lg transition-all ${
              activeTab === 3 ? "bg-pink-600 text-white" : "text-gray-300 hover:bg-gray-700"
            }`}
            onClick={() => handleTabClick(3)}
          >
            <span className="font-medium">Related Products</span>
          </div>
        </div>

        {/* Not eligible to review message */}
        {!canReview && userInfo && (
          <div className="mt-4 bg-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-yellow-500 mb-2">
              <FaShoppingBag />
              <span className="font-medium text-sm">Can&apos;t Review</span>
            </div>
            <p className="text-gray-400 text-sm">{canReviewMessage}</p>
          </div>
        )}
      </section>

      {/* Right Side - Content */}
      <section className="flex-1">
        {/* Write Review Tab */}
        {activeTab === 1 && canReview && (
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Write Your Review</h3>
            {userInfo ? (
              <form onSubmit={handleSubmit}>
                {/* Rating Selection */}
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2 font-medium">
                    Your Rating *
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold transition-all ${
                          rating >= star
                            ? "bg-yellow-500 text-white"
                            : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                        }`}
                      >
                        {star}★
                      </button>
                    ))}
                  </div>
                  <p className="text-gray-500 text-sm mt-1">
                    {rating === 1 && "Poor"}
                    {rating === 2 && "Fair"}
                    {rating === 3 && "Good"}
                    {rating === 4 && "Very Good"}
                    {rating === 5 && "Excellent"}
                  </p>
                </div>

                {/* Review Title */}
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2 font-medium">
                    Review Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Sum up your review in one line"
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                  />
                </div>

                {/* Review Comment */}
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2 font-medium">
                    Your Review *
                  </label>
                  <textarea
                    rows="4"
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="What did you like or dislike about this product?"
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loadingProductReview || !rating}
                  className="bg-pink-600 hover:bg-pink-700 text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingProductReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            ) : (
              <div className="bg-gray-700/50 rounded-lg p-6 text-center">
                <FaUser className="text-4xl text-gray-500 mx-auto mb-3" />
                <p className="text-gray-300 mb-4">Please sign in to write a review</p>
                <Link
                  to="/login"
                  className="inline-block bg-pink-600 hover:bg-pink-700 text-white py-2 px-6 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        )}

        {/* All Reviews Tab */}
        {activeTab === 2 && (
          <div className="space-y-6">
            {/* Rating Summary */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Ratings & Reviews</h3>
              <div className="flex flex-col md:flex-row gap-8">
                {/* Overall Rating */}
                <div className="text-center md:text-left">
                  <div className="text-5xl font-bold text-white mb-2">
                    {product.rating ? product.rating.toFixed(1) : "0.0"}
                  </div>
                  <Ratings value={product.rating || 0} />
                  <p className="text-gray-400 mt-2">
                    {product.reviews.length} {product.reviews.length === 1 ? "review" : "reviews"}
                  </p>
                </div>

                {/* Rating Breakdown */}
                <div className="flex-1 space-y-2">
                  {ratingBreakdown.map(({ star, count, percentage }) => (
                    <div key={star} className="flex items-center gap-3">
                      <span className="text-gray-400 w-8 text-sm">{star}★</span>
                      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            star >= 4 ? "bg-green-500" : star === 3 ? "bg-yellow-500" : "bg-red-500"
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-400 w-12 text-right text-sm">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews List */}
            {product.reviews.length === 0 ? (
              <div className="bg-gray-800 rounded-xl p-8 text-center">
                <p className="text-gray-400">No reviews yet. Be the first to review this product!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {product.reviews
                  .slice()
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((review) => (
                  <div
                    key={review._id}
                    className="bg-gray-800 rounded-xl p-6"
                  >
                    {/* Review Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {review.name ? review.name.charAt(0).toUpperCase() : "U"}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-white font-medium">{review.name}</span>
                            {review.isVerifiedPurchase && (
                              <span className="flex items-center gap-1 text-green-400 text-xs bg-green-500/20 px-2 py-0.5 rounded-full">
                                <FaCheckCircle className="text-xs" />
                                Verified Purchase
                              </span>
                            )}
                          </div>
                          <p className="text-gray-500 text-sm">
                            {moment(review.createdAt).fromNow()}
                          </p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded ${
                        review.rating >= 4 ? "bg-green-600" : review.rating === 3 ? "bg-yellow-600" : "bg-red-600"
                      }`}>
                        <span className="text-white text-sm font-bold">{review.rating}</span>
                        <FaStar className="text-white text-xs" />
                      </div>
                    </div>

                    {/* Review Title */}
                    {review.title && (
                      <h4 className="text-white font-semibold mb-2">{review.title}</h4>
                    )}

                    {/* Review Comment */}
                    <p className="text-gray-300 mb-4">{review.comment}</p>

                    {/* Helpful Button */}
                    <div className="flex items-center gap-4 pt-3 border-t border-gray-700">
                      <button 
                        onClick={() => onMarkHelpful && onMarkHelpful(review._id)}
                        className="flex items-center gap-2 text-gray-400 hover:text-pink-400 transition-colors text-sm"
                      >
                        <FaThumbsUp />
                        <span>Helpful ({review.helpfulVotes || 0})</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Related Products Tab */}
        {activeTab === 3 && (
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">You May Also Like</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {!data ? (
                <Loader />
              ) : (
                data.map((p) => (
                  <div key={p._id}>
                    <SmallProduct product={p} />
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

ProductTabs.propTypes = {
  loadingProductReview: PropTypes.bool,
  userInfo: PropTypes.object,
  submitHandler: PropTypes.func.isRequired,
  rating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setRating: PropTypes.func.isRequired,
  comment: PropTypes.string,
  setComment: PropTypes.func.isRequired,
  product: PropTypes.shape({
    _id: PropTypes.string,
    rating: PropTypes.number,
    reviews: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string,
        name: PropTypes.string,
        rating: PropTypes.number,
        comment: PropTypes.string,
        title: PropTypes.string,
        isVerifiedPurchase: PropTypes.bool,
        helpfulVotes: PropTypes.number,
        createdAt: PropTypes.string,
      })
    ),
  }).isRequired,
  canReview: PropTypes.bool,
  canReviewMessage: PropTypes.string,
  onMarkHelpful: PropTypes.func,
};

ProductTabs.defaultProps = {
  canReview: false,
  canReviewMessage: "Purchase this product to write a review",
};

export default ProductTabs;
