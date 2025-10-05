import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Globe, Sun, Sprout, Shield, Home } from 'lucide-react'

const Header = () => {
  const location = useLocation()

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/travel', icon: Globe, label: 'Travel' },
    { path: '/agriculture', icon: Sprout, label: 'Agriculture' },
    { path: '/solar', icon: Sun, label: 'Solar' },
    { path: '/risk', icon: Shield, label: 'Risk' }
  ]

  return (
    <header className="gradient-bg text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-nasa-blue font-bold text-lg">NASA</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Climate Intelligence</h1>
              <p className="text-sm text-gray-300">Powered by NASA APIs</p>
            </div>
          </Link>

          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-white text-nasa-blue shadow-lg'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header