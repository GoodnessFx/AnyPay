import { motion } from "motion/react";
import { WalletBalance } from "./components/WalletBalance";
import { PaymentSelector } from "./components/PaymentSelector";
import { ReceiveSelector } from "./components/ReceiveSelector";
import { TransactionForm } from "./components/TransactionForm";
import { TransactionHistory } from "./components/TransactionHistory";
import { QuickStats } from "./components/QuickStats";
import { QuickActions } from "./components/QuickActions";
import { AuthWrapper } from "./components/AuthWrapper";
import { Navigation } from "./components/Navigation";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <AuthWrapper>
      <Navigation>
        <div className="min-h-screen bg-gray-50">
          <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-4">
            The{" "}
            <span className="bg-gradient-to-r from-blue-800 to-purple-600 bg-clip-text text-transparent">
              Google Translate
            </span>
            {" "}of Money
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Convert any form of value to any other form, instantly. From crypto to cash, 
            airtime to bank transfers, gift cards to mobile money — all in one universal router.
          </p>
        </motion.div>

        {/* Quick Stats */}
        <QuickStats />

        {/* Quick Actions */}
        <QuickActions />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">
          {/* Left Sidebar - Wallet & Payment Methods */}
          <div className="lg:col-span-3 space-y-6 flex flex-col">
            <WalletBalance />
          </div>

          {/* Center - Transaction Form */}
          <div className="lg:col-span-6">
            <TransactionForm />
            
            {/* Payment Method Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <PaymentSelector />
              <ReceiveSelector />
            </div>
          </div>

          {/* Right Sidebar - Transaction History */}
          <div className="lg:col-span-3">
            <TransactionHistory />
          </div>
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-20 text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Universal Financial Infrastructure
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Routing</h3>
              <p className="text-gray-600">
                Our AI-powered routing engine finds the fastest, cheapest path for your value transfer
              </p>
            </div>

            <div className="p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Global Coverage</h3>
              <p className="text-gray-600">
                Connect traditional finance, crypto, and emerging payment rails across 127 countries
              </p>
            </div>

            <div className="p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Settlement</h3>
              <p className="text-gray-600">
                Most transactions complete in under 30 seconds with real-time confirmation
              </p>
            </div>
          </div>

          {/* Additional Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-4 bg-white rounded-xl shadow-sm border border-gray-100"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">API</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Developer API</h4>
              <p className="text-sm text-gray-600">
                Integrate AnyPay into your apps with our RESTful API
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-4 bg-white rounded-xl shadow-sm border border-gray-100"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">24/7</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">24/7 Support</h4>
              <p className="text-sm text-gray-600">
                Round-the-clock customer support in multiple languages
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-4 bg-white rounded-xl shadow-sm border border-gray-100"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">KYC</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Compliance</h4>
              <p className="text-sm text-gray-600">
                Bank-grade security with full regulatory compliance
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-4 bg-white rounded-xl shadow-sm border border-gray-100"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">AI</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">AI Insights</h4>
              <p className="text-sm text-gray-600">
                Smart analytics and predictive routing optimization
              </p>
            </motion.div>
          </div>
        </motion.div>
          </main>
        </div>
      </Navigation>
      <Toaster />
    </AuthWrapper>
  );
}