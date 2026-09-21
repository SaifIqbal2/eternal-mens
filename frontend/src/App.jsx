import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import OrderTracking from './pages/OrderTracking'
import About from './pages/About'
import Contact from './pages/Contact'
import Faq from './pages/Faq'
import Shipping from './pages/Shipping'
import Returns from './pages/Returns'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'

// Lazy loaded Admin Panel (separate chunk, won't slow down storefront)
const AdminLogin = lazy(() => import('./admin/AdminLogin'))
const AdminLayout = lazy(() => import('./admin/AdminLayout'))
const AdminDashboard = lazy(() => import('./admin/pages/Dashboard'))
const AdminProducts = lazy(() => import('./admin/pages/Products'))
const ProductForm = lazy(() => import('./admin/pages/ProductForm'))
const AdminOrders = lazy(() => import('./admin/pages/Orders'))
const OrderDetail = lazy(() => import('./admin/pages/OrderDetail'))
const AdminCategories = lazy(() => import('./admin/pages/Categories'))
const AdminDiscounts = lazy(() => import('./admin/pages/Discounts'))
const AdminMessages = lazy(() => import('./admin/pages/Messages'))
const AdminCustomers = lazy(() => import('./admin/pages/Customers'))
const AdminInventory = lazy(() => import('./admin/pages/Inventory'))
const AdminReviews = lazy(() => import('./admin/pages/Reviews'))

const LoadingFallback = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--graphite-soft)', fontSize: '0.9rem', letterSpacing: '0.05em' }}>
    Loading...
  </div>
)

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Admin Login (outside layout) */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Panel (protected by AdminLayout) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id" element={<ProductForm />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="discounts" element={<AdminDiscounts />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="reviews" element={<AdminReviews />} />
          </Route>

          {/* Storefront Layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            {/* Shop / Collection */}
            <Route path="shop" element={<Shop />} />
            <Route path="collection" element={<Shop />} />
            {/* Product */}
            <Route path="product/:id" element={<ProductDetails />} />
            {/* Cart & Checkout */}
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="order-confirmation" element={<OrderConfirmation />} />
            {/* Order Tracking */}
            <Route path="order-tracking" element={<OrderTracking />} />
            {/* Info pages */}
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="faq" element={<Faq />} />
            <Route path="shipping" element={<Shipping />} />
            <Route path="returns" element={<Returns />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="terms" element={<Terms />} />
            {/* Redirect legacy paths */}
            <Route path="new-arrivals" element={<Navigate to="/collection" replace />} />
            <Route path="best-sellers" element={<Navigate to="/collection" replace />} />
            {/* 404 */}
            <Route path="*" element={<div className="empty-state" style={{ padding: '6rem 1rem', textAlign: 'center' }}><h1>Page Not Found</h1></div>} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App
