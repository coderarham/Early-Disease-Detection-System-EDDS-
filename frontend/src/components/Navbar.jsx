import { Link, useLocation } from 'react-router-dom'
import { Activity, Sparkles, Home, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  
  const isActive = (path) => location.pathname === path
  
  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/skin', label: 'Skin Cancer' },
    { path: '/pneumonia', label: 'Pneumonia' },
    { path: '/heart', label: 'Heart Disease' }
  ]
  
  return (
    <nav className="glass-strong sticky top-0 z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Activity className="w-10 h-10 text-purple-400 group-hover:text-purple-300 transition-colors" />
              <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <span className="text-white text-2xl font-bold tracking-tight">EDDS</span>
              <p className="text-purple-300 text-xs">AI Medical Diagnosis</p>
            </div>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-2">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path} 
                className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                  isActive(link.path)
                    ? link.path === '/' 
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/50'
                      : link.path === '/skin'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/50'
                      : link.path === '/pneumonia'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/50'
                      : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/50'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.icon && <link.icon className="w-4 h-4" />}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  isActive(link.path)
                    ? link.path === '/'
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white'
                      : link.path === '/skin'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                      : link.path === '/pneumonia'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                      : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  {link.icon && <link.icon className="w-4 h-4" />}
                  {link.label}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
