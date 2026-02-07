import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Loader2, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react'
import axios from 'axios'

export default function SkinCancer() {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

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
      const { data } = await axios.post('http://localhost:8000/api/skin/predict', formData)
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
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-4">
          Skin Cancer <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Detection</span>
        </h1>
        <p className="text-white/60 text-lg">Upload a dermoscopic image for AI-powered lesion analysis</p>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          <div 
            {...getRootProps()} 
            className={`glass-strong rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 border-2 border-dashed ${
              isDragActive ? 'border-orange-400 bg-orange-500/10' : 'border-white/20 hover:border-orange-400/50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center">
              {preview ? (
                <ImageIcon className="w-16 h-16 text-orange-400 mb-4" />
              ) : (
                <Upload className="w-16 h-16 text-white/40 mb-4" />
              )}
              <p className="text-white/80 text-lg font-medium mb-2">
                {isDragActive ? 'Drop image here...' : 'Drag & drop dermoscopic image'}
              </p>
              <p className="text-white/50 text-sm">or click to browse (JPEG, PNG)</p>
            </div>
          </div>

          {preview && (
            <div className="glass-strong rounded-2xl p-6 space-y-4">
              <img src={preview} alt="Preview" className="rounded-xl w-full shadow-2xl" />
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-xl font-semibold hover:shadow-xl hover:shadow-orange-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          <div className="glass-strong rounded-2xl p-8 border border-white/10 space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <h3 className="text-2xl font-bold text-white">Analysis Complete</h3>
            </div>
            
            <div className="space-y-4">
              <div className="glass p-6 rounded-xl">
                <span className="text-white/60 text-sm uppercase tracking-wide">Diagnosis</span>
                <p className="text-3xl font-bold text-white mt-2">{result.prediction}</p>
              </div>
              
              <div className="glass p-6 rounded-xl">
                <span className="text-white/60 text-sm uppercase tracking-wide">Confidence Score</span>
                <div className="flex items-end gap-2 mt-2">
                  <p className="text-3xl font-bold text-white">{(result.confidence * 100).toFixed(1)}%</p>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3 mt-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${result.confidence * 100}%` }}
                  ></div>
                </div>
              </div>

              {result.details?.probabilities && (
                <div className="glass p-6 rounded-xl">
                  <span className="text-white/60 text-sm uppercase tracking-wide mb-4 block">Class Probabilities</span>
                  <div className="space-y-3">
                    {Object.entries(result.details.probabilities).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-white/80 text-sm">{key}</span>
                        <span className="text-white font-semibold">{(value * 100).toFixed(1)}%</span>
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
