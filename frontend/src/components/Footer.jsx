import { Activity, Github, Linkedin, Mail, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="glass-strong border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-7 h-7 text-purple-400" />
              <span className="text-white text-xl font-bold">EDDS</span>
            </div>
            <p className="text-white/60 text-base leading-relaxed">
              AI-powered medical diagnosis system for early detection of Skin Cancer, Pneumonia, and Heart Disease.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-base">Quick Links</h3>
            <ul className="space-y-2 text-white/60 text-base">
              <li><a href="/" className="hover:text-white transition">Home</a></li>
              <li><a href="/about" className="hover:text-white transition">About Us</a></li>
              <li><a href="/terms" className="hover:text-white transition">Terms & Conditions</a></li>
              <li><a href="/privacy" className="hover:text-white transition">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Connect</h3>
            <div className="flex gap-4">
              <a href="https://github.com/coderarham/Early-Disease-Detection-System-EDDS-" target="_blank" rel="noopener noreferrer" className="glass p-3 rounded-lg hover:bg-white/20 transition">
                <Github className="w-5 h-5 text-white/80" />
              </a>
              <a href="https://www.linkedin.com/in/md-arham-47aa6b241/" target="_blank" rel="noopener noreferrer" className="glass p-3 rounded-lg hover:bg-white/20 transition">
                <Linkedin className="w-5 h-5 text-white/80" />
              </a>
              <a href="mailto:mdarham1749@gmail.com" className="glass p-3 rounded-lg hover:bg-white/20 transition">
                <Mail className="w-5 h-5 text-white/80" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/70 text-sm">
            © 2025 EDDS. All rights reserved.
          </p>
          <p className="text-white/70 text-sm flex items-center gap-2">
            Developed by <span className="text-purple-400 font-bold text-base">Md Arham</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
