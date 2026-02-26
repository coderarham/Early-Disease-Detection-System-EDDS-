import { Activity, Heart, Users, Target, Send } from 'lucide-react'
import { useState } from 'react'

export default function AboutUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    suggestion: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: '', email: '', suggestion: '' })
    }, 3000)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="flex justify-center mb-4">
          <Activity className="w-16 h-16 text-purple-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          About <span className="text-purple-400">EDDS</span>
        </h1>
        <p className="text-white/70 text-lg max-w-2xl mx-auto">
          Early Disease Detection System - AI-powered medical diagnosis for better healthcare
        </p>
      </div>

      {/* Mission */}
      <div className="glass-strong rounded-2xl p-8 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-8 h-8 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Our Mission</h2>
        </div>
        <p className="text-white/80 leading-relaxed">
          EDDS aims to revolutionize early disease detection using artificial intelligence. We provide accessible, 
          accurate, and fast diagnosis for Skin Cancer, Pneumonia, and Heart Disease, helping healthcare professionals 
          make informed decisions and potentially saving lives through early intervention.
        </p>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="glass-strong rounded-xl p-6">
          <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
            <Heart className="w-6 h-6 text-orange-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Skin Cancer Detection</h3>
          <p className="text-white/70">
            EfficientNetV2 model trained on ISIC dataset with 8 skin lesion classifications
          </p>
        </div>

        <div className="glass-strong rounded-xl p-6">
          <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
            <Activity className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Pneumonia Detection</h3>
          <p className="text-white/70">
            MobileNetV3 model analyzing chest X-rays for pneumonia diagnosis
          </p>
        </div>

        <div className="glass-strong rounded-xl p-6">
          <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4">
            <Heart className="w-6 h-6 text-pink-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Heart Disease Prediction</h3>
          <p className="text-white/70">
            XGBoost model predicting heart disease risk from clinical parameters
          </p>
        </div>
      </div>

      {/* Feedback Form */}
      <div className="glass-strong rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-8 h-8 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Suggest Improvements</h2>
        </div>
        <p className="text-white/70 mb-6">
          Help us improve EDDS! Share your suggestions for new features or improvements.
        </p>

        {submitted ? (
          <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-6 text-center">
            <p className="text-green-400 text-lg font-semibold">✓ Thank you for your feedback!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/80 mb-2">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400 transition"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-white/80 mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400 transition"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-white/80 mb-2">Your Suggestion</label>
              <textarea
                required
                rows="5"
                value={formData.suggestion}
                onChange={(e) => setFormData({...formData, suggestion: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400 transition resize-none"
                placeholder="What features would you like to see? What can we improve?"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Submit Suggestion
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
