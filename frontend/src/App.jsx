import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import SkinCancer from './pages/SkinCancer'
import Pneumonia from './pages/Pneumonia'
import HeartDisease from './pages/HeartDisease'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'

function App() {
  return (
    <Router>
      <div className="min-h-screen mesh-gradient relative flex flex-col">
        <div className="relative z-10 flex flex-col min-h-screen">
          <ScrollToTop />
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/skin" element={<SkinCancer />} />
              <Route path="/pneumonia" element={<Pneumonia />} />
              <Route path="/heart" element={<HeartDisease />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </Router>
  )
}

export default App
