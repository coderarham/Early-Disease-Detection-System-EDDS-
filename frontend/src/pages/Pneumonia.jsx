import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Loader2, CheckCircle, AlertCircle, FileImage } from 'lucide-react'
import axios from 'axios'
import API_BASE_URL from '../config'

export default function Pneumonia() {
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
      const { data } = await axios.post(`${API_BASE_URL}/api/lung/predict`, formData)
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
          Pneumonia <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Detection</span>
        </h1>
        <p className="text-white/60 text-lg">Upload a chest X-ray for AI-powered pneumonia diagnosis</p>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          <div 
            {...getRootProps()} 
            className={`glass-strong rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 border-2 border-dashed ${
              isDragActive ? 'border-blue-400 bg-blue-500/10' : 'border-white/20 hover:border-blue-400/50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center">
              {preview ? (
                <FileImage className="w-16 h-16 text-blue-400 mb-4" />
              ) : (
                <Upload className="w-16 h-16 text-white/40 mb-4" />
              )}
              <p className="text-white/80 text-lg font-medium mb-2">
                {isDragActive ? 'Drop X-ray here...' : 'Drag & drop chest X-ray'}
              </p>
              <p className="text-white/50 text-sm">or click to browse (JPEG, PNG)</p>
            </div>
          </div>

          {preview && (
            <div className="glass-strong rounded-2xl p-6 space-y-4">
              <img src={preview} alt="Preview" className="rounded-xl w-full shadow-2xl bg-black/20" />
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-4 rounded-xl font-semibold hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Analyzing X-Ray...
                  </>
                ) : (
                  'Analyze X-Ray'
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
              <h3 className="text-2xl font-bold text-white">Diagnosis Complete</h3>
            </div>
            
            <div className="space-y-4">
              <div className="glass p-6 rounded-xl">
                <span className="text-white/60 text-sm uppercase tracking-wide">Result</span>
                <p className="text-3xl font-bold text-white mt-2">{result.prediction}</p>
              </div>
              
              <div className="glass p-6 rounded-xl">
                <span className="text-white/60 text-sm uppercase tracking-wide">Confidence Level</span>
                <div className="flex items-end gap-2 mt-2">
                  <p className="text-3xl font-bold text-white">{(result.confidence * 100).toFixed(1)}%</p>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3 mt-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${result.confidence * 100}%` }}
                  ></div>
                </div>
              </div>

              {result.details?.heatmap_available === false && (
                <div className="glass p-6 rounded-xl">
                  <span className="text-white/60 text-sm uppercase tracking-wide mb-3 block">Grad-CAM Heatmap</span>
                  <p className="text-white/50 text-sm">Heatmap visualization will be available after model training</p>
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
              <FileImage className="w-20 h-20 mx-auto mb-4" />
              <p className="text-lg">Upload an X-ray to see diagnosis</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
