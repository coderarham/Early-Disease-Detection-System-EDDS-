import { Link, useLocation } from 'react-router-dom'
import { Activity, Sparkles, Home } from 'lucide-react'

export default function Navbar() {
  const location = useLocation()
  
  const isActive = (path) => location.pathname === path
  
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
          
          <div className="flex space-x-2">
            <Link 
              to="/" 
              className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                isActive('/') 
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/50' 
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link 
              to="/skin" 
              className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                isActive('/skin') 
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/50' 
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Skin Cancer
            </Link>
            <Link 
              to="/pneumonia" 
              className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                isActive('/pneumonia') 
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/50' 
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Pneumonia
            </Link>
            <Link 
              to="/heart" 
              className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                isActive('/heart') 
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/50' 
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Heart Disease
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
