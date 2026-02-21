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
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-3">
          Pneumonia <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Detection</span>
        </h1>
        <p className="text-white/60">Upload a chest X-ray for AI-powered pneumonia diagnosis</p>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          <div 
            {...getRootProps()} 
            className={`glass-strong rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 border-2 border-dashed ${
              isDragActive ? 'border-blue-400 bg-blue-500/10' : 'border-white/20 hover:border-blue-400/50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center">
              {preview ? (
                <FileImage className="w-12 h-12 text-blue-400 mb-3" />
              ) : (
                <Upload className="w-12 h-12 text-white/40 mb-3" />
              )}
              <p className="text-white/80 font-medium mb-2">
                {isDragActive ? 'Drop X-ray here...' : 'Drag & drop chest X-ray'}
              </p>
              <p className="text-white/50 text-sm">or click to browse (JPEG, PNG)</p>
            </div>
          </div>

          {preview && (
            <div className="glass-strong rounded-2xl p-4 space-y-3">
              <img src={preview} alt="Preview" className="rounded-xl w-full shadow-2xl bg-black/20" />
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-3 rounded-xl font-semibold hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          <div className="glass-strong rounded-2xl p-6 border border-white/10 space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <h3 className="text-xl font-bold text-white">Diagnosis Complete</h3>
            </div>

            <div className="flex items-start gap-2 glass p-3 rounded-xl border border-yellow-500/30 bg-yellow-500/5 mb-4">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-400 mb-1">⚠️ Important Disclaimer</p>
                <p className="text-sm text-white/70">I am an AI, not a real Doctor or Radiologist. I only analyze image patterns. For actual medical condition and treatment, always trust a qualified doctor's report.</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="glass p-4 rounded-xl">
                <span className="text-white/60 text-xs uppercase tracking-wide">Result</span>
                <p className="text-2xl font-bold text-white mt-1">{result.prediction}</p>
              </div>
              
              <div className="glass p-4 rounded-xl">
                <span className="text-white/60 text-xs uppercase tracking-wide">Confidence Level</span>
                <div className="flex items-end gap-2 mt-1">
                  <p className="text-2xl font-bold text-white">{(result.confidence * 100).toFixed(1)}%</p>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 mt-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${result.confidence * 100}%` }}
                  ></div>
                </div>
              </div>

              {result.heatmap && (
                <div className="glass p-4 rounded-xl">
                  <span className="text-white/60 text-xs uppercase tracking-wide mb-2 block">Grad-CAM Heatmap</span>
                  <img src={result.heatmap} alt="Heatmap" className="rounded-xl w-full shadow-lg" />
                  <p className="text-white/50 text-xs mt-2">Red areas indicate regions of interest for diagnosis</p>
                </div>
              )}

              {result.probabilities && (
                <div className="glass p-4 rounded-xl">
                  <span className="text-white/60 text-xs uppercase tracking-wide mb-3 block">Class Probabilities</span>
                  <div className="space-y-2">
                    {Object.entries(result.probabilities).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-white/80">{key}</span>
                          <span className="text-white font-medium">{(value * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full"
                            style={{ width: `${value * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.recommendation && (
                <div className="flex items-start gap-2 glass p-3 rounded-xl border border-blue-500/30">
                  <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white mb-1">Recommendation</p>
                    <p className="text-sm text-white/70">{result.recommendation}</p>
                  </div>
                </div>
              )}

              {result.detailed_analysis && (
                <div className="glass p-4 rounded-xl border border-purple-500/30">
                  <span className="text-white/60 text-xs uppercase tracking-wide mb-3 block">Detailed Analysis</span>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-white font-medium mb-1.5 text-sm">Findings:</p>
                      <ul className="space-y-1.5">
                        {result.detailed_analysis.findings.map((finding, idx) => (
                          <li key={idx} className="text-white/70 text-sm flex items-start gap-2">
                            <span className="text-purple-400 mt-1">•</span>
                            <span>{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-white font-medium mb-1.5 text-sm">Severity: 
                        <span className={`ml-2 ${
                          result.detailed_analysis.severity === 'Normal' ? 'text-green-400' :
                          result.detailed_analysis.severity.includes('Mild') ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>{result.detailed_analysis.severity}</span>
                      </p>
                    </div>

                    <div>
                      <p className="text-white font-medium mb-1.5 text-sm">Next Steps:</p>
                      <ul className="space-y-1.5">
                        {result.detailed_analysis.next_steps.map((step, idx) => (
                          <li key={idx} className="text-white/70 text-sm flex items-start gap-2">
                            <span className="text-cyan-400 mt-1">→</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
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
