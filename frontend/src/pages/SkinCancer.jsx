import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Loader2, CheckCircle, AlertCircle, Image as ImageIcon, Info } from 'lucide-react'
import axios from 'axios'
import API_BASE_URL from '../config'

const CLASS_DEFINITIONS = {
  "Melanoma": "The most dangerous and aggressive type of skin cancer. It develops in melanocytes (pigment-producing cells) and can spread rapidly to other parts of the body if not treated early.",
  "Nevus": "A common benign mole (melanocytic nevus). These are normal skin growths that are usually harmless, though they should be monitored for changes in size, shape, or color.",
  "Basal Cell Carcinoma": "The most common type of skin cancer. It develops in the basal cells of the skin and is usually caused by prolonged sun exposure. It grows slowly and rarely spreads to other parts of the body.",
  "Actinic Keratosis": "A pre-cancerous skin condition caused by sun damage. While not cancer itself, it can develop into Squamous Cell Carcinoma if left untreated. Appears as rough, scaly patches on sun-exposed skin.",
  "Benign Keratosis": "A harmless, non-cancerous skin growth that commonly appears with age. Also known as seborrheic keratosis, these are completely safe and do not require treatment unless they cause discomfort.",
  "Dermatofibroma": "A benign (harmless) fibrous nodule that forms in the skin. It appears as a small, firm bump and is completely safe. Common in adults and usually doesn't require treatment.",
  "Vascular Lesion": "Benign growths formed by clusters of blood vessels. Examples include birthmarks, cherry angiomas, and spider veins. These are harmless and typically don't require medical intervention.",
  "Squamous Cell Carcinoma": "The second most common type of skin cancer. It develops in the squamous cells of the skin's upper layer and is often caused by UV exposure. It can spread if not treated but is usually curable when caught early."
}

export default function SkinCancer() {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [hoveredClass, setHoveredClass] = useState(null)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    maxFiles: 1,
    onDrop: (files) => {
      const file = files[0]
      setImage(file)
      setPreview(URL.createObjectURL(file))
      setResult(null)
    }
  })

  const handleAnalyze = async () => {
    if (!image) return
    setLoading(true)
    const formData = new FormData()
    formData.append('file', image)

    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/skin/predict`, formData)
      setResult(data)
    } catch (error) {
      console.error(error)
      alert('Prediction failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-3">
          Skin Cancer <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Detection</span>
        </h1>
        <p className="text-white/60">Upload a dermoscopic image for AI-powered lesion analysis</p>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          <div 
            {...getRootProps()} 
            className={`glass-strong rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 border-2 border-dashed ${
              isDragActive ? 'border-orange-400 bg-orange-500/10' : 'border-white/20 hover:border-orange-400/50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center">
              {preview ? (
                <ImageIcon className="w-12 h-12 text-orange-400 mb-3" />
              ) : (
                <Upload className="w-12 h-12 text-white/40 mb-3" />
              )}
              <p className="text-white/80 font-medium mb-2">
                {isDragActive ? 'Drop image here...' : 'Drag & drop dermoscopic image'}
              </p>
              <p className="text-white/50 text-sm">or click to browse (JPEG, PNG)</p>
            </div>
          </div>

          {preview && (
            <div className="glass-strong rounded-2xl p-4 space-y-3">
              <img src={preview} alt="Preview" className="rounded-xl w-full shadow-2xl" />
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl font-semibold hover:shadow-xl hover:shadow-orange-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Image'
                )}
              </button>
            </div>
          )}
        </div>

        {/* Results Section */}
        {result ? (
          <div className="glass-strong rounded-2xl p-6 border border-white/10 space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <h3 className="text-xl font-bold text-white">Analysis Complete</h3>
            </div>
            
            <div className="space-y-3">
              <div className="glass p-4 rounded-xl">
                <span className="text-white/60 text-xs uppercase tracking-wide">Diagnosis</span>
                <p className="text-2xl font-bold text-white mt-1">{result.prediction}</p>
              </div>
              
              <div className="glass p-4 rounded-xl">
                <span className="text-white/60 text-xs uppercase tracking-wide">Confidence Score</span>
                <div className="flex items-end gap-2 mt-1">
                  <p className="text-2xl font-bold text-white">{(result.confidence * 100).toFixed(1)}%</p>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 mt-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${result.confidence * 100}%` }}
                  ></div>
                </div>
              </div>

              {result.severity && (
                <div className="glass p-4 rounded-xl">
                  <span className="text-white/60 text-xs uppercase tracking-wide">Severity</span>
                  <p className="text-xl font-bold text-white mt-1">{result.severity}</p>
                </div>
              )}

              {result.type && (
                <div className="glass p-4 rounded-xl">
                  <span className="text-white/60 text-xs uppercase tracking-wide">Type</span>
                  <p className="text-xl font-bold text-white mt-1">
                    {result.type}
                    <span className="font-bold text-base ml-2">
                      / {result.type === 'Malignant' ? 'Cancerous' : result.type === 'Benign' ? 'Non-Cancerous' : 'May Become Cancer'}
                    </span>
                  </p>
                </div>
              )}

              {result.probabilities && (
                <div className="glass p-4 rounded-xl">
                  <span className="text-white/60 text-xs uppercase tracking-wide mb-3 block">Detailed Probabilities</span>
                  <div className="space-y-2">
                    {Object.entries(result.probabilities)
                      .sort(([, a], [, b]) => b - a)
                      .map(([key, value], index) => {
                        const totalItems = Object.entries(result.probabilities).length
                        const isLastTwo = index >= totalItems - 2
                        
                        return (
                          <div key={key} className="flex justify-between items-center group relative">
                            <div className="flex items-center gap-2">
                              <span className="text-white/80 text-sm">{key}</span>
                              <div 
                                className="relative"
                                onMouseEnter={() => setHoveredClass(key)}
                                onMouseLeave={() => setHoveredClass(null)}
                              >
                                <Info className="w-4 h-4 text-pink-400 hover:text-pink-300 cursor-help transition-colors" />
                                {hoveredClass === key && (
                                  <div className={`fixed sm:absolute ${isLastTwo ? 'sm:left-6 sm:bottom-0' : 'sm:left-6 sm:top-0'} left-4 right-4 sm:left-auto sm:right-auto top-1/2 sm:top-auto -translate-y-1/2 sm:translate-y-0 z-50 sm:w-64 bg-gray-900 border border-white/20 rounded-lg p-3 shadow-2xl`}>
                                    <p className="text-xs font-bold text-pink-400 mb-1">{key}:</p>
                                    <p className="text-xs text-white/90 leading-relaxed">
                                      {CLASS_DEFINITIONS[key]}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                            <span className="text-white font-semibold">{(value * 100).toFixed(2)}%</span>
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}

              {result.recommendation && (
                <div className="glass p-4 rounded-xl border border-orange-500/30">
                  <span className="text-white/60 text-xs uppercase tracking-wide mb-2 block">Recommendation</span>
                  <p className="text-white text-sm">{result.recommendation}</p>
                </div>
              )}

              {result.next_steps && (
                <div className="glass p-4 rounded-xl">
                  <span className="text-white/60 text-xs uppercase tracking-wide mb-3 block">Next Steps</span>
                  <ul className="space-y-2">
                    {result.next_steps.map((step, idx) => (
                      <li key={idx} className="text-white/80 text-sm flex items-start gap-2">
                        <span className="text-orange-400 mt-1">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="glass-strong rounded-2xl p-12 border border-white/10 flex items-center justify-center">
            <div className="text-center text-white/40">
              <ImageIcon className="w-20 h-20 mx-auto mb-4" />
              <p className="text-lg">Upload an image to see results</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
