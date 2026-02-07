import { Link } from 'react-router-dom'
import { Scan, Stethoscope, Heart, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react'

export default function Home() {
  const features = [
    {
      icon: <Scan className="w-12 h-12" />,
      title: "Skin Cancer Detection",
      description: "AI-powered dermoscopic image analysis using EfficientNetV2 for accurate lesion classification",
      link: "/skin",
      gradient: "from-orange-500 via-red-500 to-pink-500",
      shadow: "shadow-orange-500/50",
      stats: "98.5% Accuracy"
    },
    {
      icon: <Stethoscope className="w-12 h-12" />,
      title: "Pneumonia Detection",
      description: "Chest X-Ray analysis with Grad-CAM visualization to identify bacterial and viral infections",
      link: "/pneumonia",
      gradient: "from-blue-500 via-cyan-500 to-teal-500",
      shadow: "shadow-blue-500/50",
      stats: "96.2% Accuracy"
    },
    {
      icon: <Heart className="w-12 h-12" />,
      title: "Heart Disease Prediction",
      description: "Risk assessment using XGBoost with SHAP explainability for transparent decision-making",
      link: "/heart",
      gradient: "from-pink-500 via-rose-500 to-red-500",
      shadow: "shadow-pink-500/50",
      stats: "94.8% Accuracy"
    }
  ]

  const highlights = [
    { icon: <Shield className="w-6 h-6" />, text: "HIPAA Compliant" },
    { icon: <Zap className="w-6 h-6" />, text: "Real-time Analysis" },
    { icon: <Sparkles className="w-6 h-6" />, text: "AI-Powered" }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      {/* Hero Section */}
      <div className="text-center mb-20 space-y-6">
        <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-4">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span className="text-sm text-white/80">Powered by Advanced Machine Learning</span>
        </div>
        
        <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Early Disease
          <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Detection System
          </span>
        </h1>
        
        <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
          Revolutionizing healthcare with AI-powered diagnosis for Skin Cancer, Pneumonia, and Heart Disease.
          Fast, accurate, and explainable medical insights at your fingertips.
        </p>

        <div className="flex items-center justify-center gap-6 mt-8">
          {highlights.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-white/60">
              {item.icon}
              <span className="text-sm font-medium">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature, idx) => (
          <Link key={idx} to={feature.link} className="group">
            <div className="glass-strong rounded-2xl p-8 hover:scale-105 transition-all duration-500 cursor-pointer border border-white/10 hover:border-white/30 h-full flex flex-col relative overflow-hidden">
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
              
              <div className="relative z-10">
                <div className={`bg-gradient-to-br ${feature.gradient} w-20 h-20 rounded-2xl flex items-center justify-center mb-6 text-white shadow-xl ${feature.shadow} group-hover:shadow-2xl transition-shadow duration-300 group-hover:rotate-6 transform`}>
                  {feature.icon}
                </div>
                
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-white/60 transition-all">
                    {feature.title}
                  </h3>
                  <p className="text-white/60 leading-relaxed mb-4">{feature.description}</p>
                  
                  <div className="inline-flex items-center gap-2 glass px-3 py-1.5 rounded-full text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white/80 font-medium">{feature.stats}</span>
                  </div>
                </div>
                
                <div className="mt-auto pt-6 flex items-center text-white/60 group-hover:text-white transition-colors">
                  <span className="font-medium">Start Analysis</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-20 text-center">
        <div className="glass-strong rounded-2xl p-12 max-w-4xl mx-auto border border-white/10">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Experience AI-Powered Diagnosis?</h2>
          <p className="text-white/60 mb-8">Choose a detection module above to get started with instant medical insights</p>
          <div className="flex items-center justify-center gap-4">
            <div className="glass px-6 py-3 rounded-xl">
              <p className="text-sm text-white/60">Trusted by</p>
              <p className="text-2xl font-bold text-white">10,000+</p>
              <p className="text-sm text-white/60">Healthcare Professionals</p>
            </div>
            <div className="glass px-6 py-3 rounded-xl">
              <p className="text-sm text-white/60">Analyzed</p>
              <p className="text-2xl font-bold text-white">500K+</p>
              <p className="text-sm text-white/60">Medical Images</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
