import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import { LanguageProvider } from './components/LanguageSelector';
import Homepage from './components/Homepage';
import CategoryPage from './components/CategoryPage';
import Login from './components/Login';
import SearchPage from './components/SearchPage';
import ProductDetail from './components/ProductDetail';
import CartPage from './components/CartPage';
import PaymentPage from './components/PaymentPage';
import WishlistPage from './components/WishlistPage';
import OrderHistory from './components/OrderHistory';
import UserProfile from './components/UserProfile';
import AddressBook from './components/AddressBook';
import ProductCompare from './components/ProductCompare';
import OrderTracking from './components/OrderTracking';
import LiveChat from './components/LiveChat';
import LoyaltyPage from './components/LoyaltyPage';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import AnalyticsPage from './components/AnalyticsPage';
import PWAInstall from './components/PWAInstall';

import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <LanguageProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/orders" element={<OrderHistory />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/addresses" element={<AddressBook />} />
                <Route path="/compare" element={<ProductCompare />} />
                <Route path="/category/:categoryName" element={<CategoryPage />} />
                <Route path="/mobiles" element={<CategoryPage category="mobiles" />} />
                <Route path="/fashion" element={<CategoryPage category="fashion" />} />
                <Route path="/electronics" element={<CategoryPage category="electronics" />} />
                <Route path="/home" element={<CategoryPage category="home" />} />
                <Route path="/appliances" element={<CategoryPage category="appliances" />} />
                <Route path="/travel" element={<CategoryPage category="travel" />} />
                <Route path="/beauty" element={<CategoryPage category="beauty" />} />
                <Route path="/grocery" element={<CategoryPage category="grocery" />} />
                <Route path="/toys" element={<CategoryPage category="toys" />} />
                <Route path="/sports" element={<CategoryPage category="sports" />} />
                <Route path="/books" element={<CategoryPage category="books" />} />
                <Route path="/offers" element={<CategoryPage category="offers" />} />
                <Route path="/track-order" element={<OrderTracking />} />
                <Route path="/loyalty" element={<LoyaltyPage />} />
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/analytics" element={<AnalyticsPage />} />
              </Routes>
              <LiveChat />
              <PWAInstall />
            </div>
          </Router>
        </LanguageProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;