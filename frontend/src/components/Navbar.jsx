import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Menu, Search, User } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          <div className="flex items-center">
            <button className="p-2 -ml-2 mr-2 text-gray-600 hover:text-black md:hidden">
              <Menu size={24} />
            </button>
            <Link to="/" className="text-2xl font-bold tracking-widest text-primary uppercase">
              Eternal
            </Link>
          </div>

          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-600 hover:text-black transition">Home</Link>
            <Link to="/shop" className="text-gray-600 hover:text-black transition">Shop</Link>
            <Link to="/about" className="text-gray-600 hover:text-black transition">About</Link>
            <Link to="/contact" className="text-gray-600 hover:text-black transition">Contact</Link>
          </div>

          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-black">
              <Search size={20} />
            </button>
            <Link to="/account" className="text-gray-600 hover:text-black hidden sm:block">
              <User size={20} />
            </Link>
            <Link to="/cart" className="text-gray-600 hover:text-black relative">
              <ShoppingCart size={20} />
              <span className="absolute -top-2 -right-2 bg-accent text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                0
              </span>
            </Link>
          </div>

        </div>
      </div>
    </nav>
  )
}
