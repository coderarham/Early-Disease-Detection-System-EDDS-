import { useState } from 'react'
import { Loader2, Activity, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react'
import axios from 'axios'

export default function HeartDisease() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [formData, setFormData] = useState({
    age: 50,
    sex: 1,
    cp: 0,
    trestbps: 120,
    chol: 200,
    fbs: 0,
    restecg: 0,
    thalach: 150,
    exang: 0,
    oldpeak: 0,
    slope: 0,
    ca: 0,
    thal: 0
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: parseFloat(e.target.value) })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await axios.post('http://localhost:8000/api/heart/predict', formData)
      setResult(data)
    } catch (error) {
      console.error(error)
      alert('Prediction failed')
    } finally {
      setLoading(false)
    }
  }

  const inputFields = [
    { name: 'age', label: 'Age', type: 'number', min: 1, max: 120 },
    { name: 'sex', label: 'Sex', type: 'select', options: [{value: 0, label: 'Female'}, {value: 1, label: 'Male'}] },
    { name: 'cp', label: 'Chest Pain Type', type: 'number', min: 0, max: 3 },
    { name: 'trestbps', label: 'Resting Blood Pressure', type: 'number', min: 80, max: 200 },
    { name: 'chol', label: 'Cholesterol (mg/dl)', type: 'number', min: 100, max: 600 },
    { name: 'fbs', label: 'Fasting Blood Sugar', type: 'select', options: [{value: 0, label: 'Normal'}, {value: 1, label: 'High'}] },
    { name: 'restecg', label: 'Resting ECG', type: 'number', min: 0, max: 2 },
    { name: 'thalach', label: 'Max Heart Rate', type: 'number', min: 60, max: 220 },
    { name: 'exang', label: 'Exercise Angina', type: 'select', options: [{value: 0, label: 'No'}, {value: 1, label: 'Yes'}] },
    { name: 'oldpeak', label: 'ST Depression', type: 'number', min: 0, max: 10, step: 0.1 },
    { name: 'slope', label: 'ST Slope', type: 'number', min: 0, max: 2 },
    { name: 'ca', label: 'Major Vessels', type: 'number', min: 0, max: 4 },
    { name: 'thal', label: 'Thalassemia', type: 'number', min: 0, max: 3 }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-4">
          Heart Disease <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">Risk Assessment</span>
        </h1>
        <p className="text-white/60 text-lg">Enter patient vitals for AI-powered cardiovascular risk prediction</p>
      </div>
      
      <div className="grid lg:grid-cols-5 gap-8">
        {/* Form Section */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 glass-strong rounded-2xl p-8 border border-white/10 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-6 h-6 text-pink-400" />
            <h3 className="text-xl font-bold text-white">Patient Information</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {inputFields.map((field) => (
              <div key={field.name}>
                <label className="text-white/70 text-sm font-medium block mb-2">{field.label}</label>
                {field.type === 'select' ? (
                  <select 
                    name={field.name} 
                    value={formData[field.name]} 
                    onChange={handleChange}
                    className="w-full glass text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                  >
                    {field.options.map(opt => (
                      <option key={opt.value} value={opt.value} className="bg-gray-900">{opt.label}</option>
                    ))}
                  </select>
                ) : (
                  <input 
                    type={field.type} 
                    name={field.name} 
                    value={formData[field.name]} 
                    onChange={handleChange}
                    min={field.min}
                    max={field.max}
                    step={field.step || 1}
                    className="w-full glass text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                  />
                )}
              </div>
            ))}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white py-4 rounded-xl font-semibold hover:shadow-xl hover:shadow-pink-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Analyzing Risk...
              </>
            ) : (
              'Assess Risk'
            )}
          </button>
        </form>

        {/* Results Section */}
        {result ? (
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-strong rounded-2xl p-8 border border-white/10 animate-in fade-in duration-500">
              <h3 className="text-2xl font-bold text-white mb-6">Risk Assessment</h3>
              
              <div className="space-y-6">
                {/* Risk Level */}
                <div className="glass p-6 rounded-xl text-center">
                  <span className="text-white/60 text-sm uppercase tracking-wide block mb-3">Risk Level</span>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {result.prediction === 'Low Risk' ? (
                      <TrendingDown className="w-8 h-8 text-green-400" />
                    ) : (
                      <TrendingUp className="w-8 h-8 text-red-400" />
                    )}
                    <p className={`text-3xl font-bold ${
                      result.prediction === 'Low Risk' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {result.prediction}
                    </p>
                  </div>
                </div>

                {/* Risk Percentage */}
                <div className="glass p-6 rounded-xl">
                  <span className="text-white/60 text-sm uppercase tracking-wide block mb-3">Risk Score</span>
                  <p className="text-4xl font-bold text-white mb-4">{result.details?.risk_percentage}%</p>
                  <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        result.details?.risk_percentage > 50 
                          ? 'bg-gradient-to-r from-red-500 to-rose-600' 
                          : 'bg-gradient-to-r from-green-500 to-emerald-600'
                      }`}
                      style={{ width: `${result.details?.risk_percentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Top Risk Factors */}
                {result.details?.top_risk_factors && (
                  <div className="glass p-6 rounded-xl">
                    <span className="text-white/60 text-sm uppercase tracking-wide block mb-4">Key Risk Factors</span>
                    <div className="space-y-2">
                      {result.details.top_risk_factors.map((factor, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                          <span className="text-white/80 capitalize">{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.details?.message && (
                  <div className="flex items-start gap-3 glass p-4 rounded-xl border border-yellow-500/30">
                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-300">{result.details.message}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 glass-strong rounded-2xl p-12 border border-white/10 flex items-center justify-center">
            <div className="text-center text-white/40">
              <Activity className="w-20 h-20 mx-auto mb-4" />
              <p className="text-lg">Submit form to see risk assessment</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
