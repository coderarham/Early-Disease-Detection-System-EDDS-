import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Shield, CheckCircle } from 'lucide-react'

export default function ForgotPassword() {
  const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [timer, setTimer] = useState(0)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      console.log('Email sent to:', formData.email)
      setStep(2)
      setTimer(60) // Start 60 second timer
      setIsLoading(false)
      
      // Start countdown
      const countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(countdown)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }, 1000)
  }

  const handleOTPSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate OTP verification
    setTimeout(() => {
      console.log('OTP verified:', formData.otp)
      setStep(3)
      setIsLoading(false)
    }, 1000)
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    if (formData.newPassword !== formData.confirmPassword) {
      alert('Passwords do not match!')
      setIsLoading(false)
      return
    }
    
    // Simulate password reset
    setTimeout(() => {
      console.log('Password reset successful')
      setStep(4)
      setIsLoading(false)
    }, 1000)
  }

  const resendOTP = () => {
    setTimer(60)
    console.log('OTP resent to:', formData.email)
    
    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdown)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="glass-strong rounded-2xl p-8 border border-white/10">
          {/* Back Button */}
          {step > 1 && step < 4 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}

          {/* Step 1: Email Input */}
          {step === 1 && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl mb-4">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Forgot Password?</h1>
                <p className="text-white/60">Enter your email to receive a reset code</p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 glass rounded-xl border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Code'}
                </button>
              </form>
            </>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Enter OTP</h1>
                <p className="text-white/60">We sent a 6-digit code to {formData.email}</p>
              </div>

              <form onSubmit={handleOTPSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    required
                    maxLength="6"
                    className="w-full px-4 py-3 glass rounded-xl border border-white/10 text-white text-center text-2xl tracking-widest placeholder-white/40 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="000000"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </button>

                <div className="text-center">
                  {timer > 0 ? (
                    <p className="text-white/60">Resend code in {timer}s</p>
                  ) : (
                    <button
                      type="button"
                      onClick={resendOTP}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Resend Code
                    </button>
                  )}
                </div>
              </form>
            </>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl mb-4">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
                <p className="text-white/60">Create a new secure password</p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-12 py-3 glass rounded-xl border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-green-500 transition-colors"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-12 py-3 glass rounded-xl border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-green-500 transition-colors"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Password Reset!</h1>
                <p className="text-white/60">Your password has been successfully reset</p>
              </div>

              <Link
                to="/login"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300 flex items-center justify-center"
              >
                Back to Login
              </Link>
            </>
          )}

          {/* Footer */}
          {step < 4 && (
            <div className="mt-8 text-center">
              <p className="text-white/60">
                Remember your password?{' '}
                <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                  Back to Login
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}