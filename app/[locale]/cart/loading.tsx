"use client";

import { motion } from "framer-motion";

const LoaderSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-white to-emerald-50">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-lime-500 to-emerald-500 text-white shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl animate-pulse" />
              <div className="h-8 w-32 bg-white/20 rounded-lg animate-pulse" />
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items Skeleton */}
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((item) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: item * 0.1 }}
                className="bg-white rounded-2xl shadow-lg border border-lime-100/50 overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row gap-4 p-4 sm:p-6">
                  {/* Image Skeleton */}
                  <div className="w-full sm:w-32 h-32 bg-gradient-to-br from-lime-100 to-emerald-100 rounded-xl animate-pulse" />

                  {/* Content Skeleton */}
                  <div className="flex-1 space-y-3">
                    <div className="h-6 bg-gradient-to-r from-lime-100 to-emerald-100 rounded-lg w-3/4 animate-pulse" />
                    <div className="h-4 bg-lime-50 rounded w-1/2 animate-pulse" />

                    <div className="flex items-center gap-4 pt-2">
                      <div className="h-10 w-28 bg-gradient-to-r from-lime-100 to-emerald-100 rounded-xl animate-pulse" />
                      <div className="h-8 w-20 bg-lime-50 rounded-lg animate-pulse" />
                    </div>
                  </div>

                  {/* Price & Delete Skeleton */}
                  <div className="flex sm:flex-col justify-between sm:justify-start items-end gap-4">
                    <div className="h-8 w-24 bg-gradient-to-r from-lime-100 to-emerald-100 rounded-lg animate-pulse" />
                    <div className="w-10 h-10 bg-red-50 rounded-full animate-pulse" />
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Continue Shopping Button Skeleton */}
            <div className="w-full h-16 bg-white border-2 border-lime-200 rounded-2xl animate-pulse" />
          </div>

          {/* Order Summary Skeleton */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-xl border border-lime-100/50 overflow-hidden sticky top-4"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-50 to-emerald-50 p-6 space-y-3">
                <div className="h-8 bg-gradient-to-r from-lime-200 to-emerald-200 rounded-lg w-2/3 animate-pulse" />
                <div className="h-4 bg-lime-100 rounded w-1/3 animate-pulse" />
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Promo Code Section */}
                <div className="space-y-2">
                  <div className="h-4 bg-lime-100 rounded w-1/4 animate-pulse" />
                  <div className="h-12 bg-gradient-to-r from-lime-50 to-emerald-50 rounded-xl animate-pulse" />
                  <div className="h-12 bg-gradient-to-r from-lime-100 to-emerald-100 rounded-xl animate-pulse" />
                </div>

                {/* Pricing Breakdown */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex justify-between">
                      <div className="h-5 bg-lime-100 rounded w-1/3 animate-pulse" />
                      <div className="h-5 bg-emerald-100 rounded w-1/4 animate-pulse" />
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="pt-4 border-t-2 border-lime-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="h-6 bg-lime-100 rounded w-1/4 animate-pulse" />
                    <div className="h-10 bg-gradient-to-r from-lime-200 to-emerald-200 rounded-lg w-1/3 animate-pulse" />
                  </div>
                  <div className="h-3 bg-gray-100 rounded w-2/3 animate-pulse" />
                </div>

                {/* Checkout Button */}
                <div className="h-14 bg-gradient-to-r from-lime-200 to-emerald-200 rounded-2xl animate-pulse" />

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="text-center space-y-2">
                      <div className="w-10 h-10 bg-lime-50 rounded-full mx-auto animate-pulse" />
                      <div className="h-3 bg-lime-50 rounded mx-auto w-16 animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Loading Overlay with Text */}
      <div className="fixed inset-0 bg-black/5 backdrop-blur-[1px] flex items-center justify-center pointer-events-none z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-lime-200 rounded-full animate-spin border-t-lime-500" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-emerald-200 rounded-full animate-ping opacity-20" />
          </div>
          <p className="text-lg font-bold bg-gradient-to-r from-lime-600 to-emerald-600 bg-clip-text text-transparent">
            جاري التحميل...
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoaderSkeleton;
