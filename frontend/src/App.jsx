import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import About from './pages/About'
import Contact from './pages/Contact'
import Faq from './pages/Faq'
import Shipping from './pages/Shipping'

// Admin
import AdminLogin from './admin/AdminLogin'
import AdminLayout from './admin/AdminLayout'
import AdminDashboard from './admin/pages/Dashboard'
import AdminProducts from './admin/pages/Products'
import ProductForm from './admin/pages/ProductForm'
import AdminOrders from './admin/pages/Orders'
import OrderDetail from './admin/pages/OrderDetail'
import AdminCategories from './admin/pages/Categories'
import AdminDiscounts from './admin/pages/Discounts'
import AdminMessages from './admin/pages/Messages'
import AdminCustomers from './admin/pages/Customers'

function App() {
  return (
    <Router>
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
          {/* Info pages */}
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="faq" element={<Faq />} />
          <Route path="shipping" element={<Shipping />} />
          {/* Redirect legacy paths */}
          <Route path="new-arrivals" element={<Navigate to="/collection" replace />} />
          <Route path="best-sellers" element={<Navigate to="/collection" replace />} />
          <Route path="order-tracking" element={<Navigate to="/contact" replace />} />
          <Route path="*" element={<div className="empty-state"><h1>Page Not Found</h1></div>} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
