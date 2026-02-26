import { FileText } from 'lucide-react'

export default function TermsAndConditions() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="glass-strong rounded-2xl p-8 md:p-12">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-10 h-10 text-purple-400" />
          <h1 className="text-3xl md:text-4xl font-bold text-white">Terms and Conditions</h1>
        </div>
        
        <p className="text-white/60 mb-8">Last updated: November 2025</p>

        <div className="space-y-6 text-white/80">
          <section>
            <h2 className="text-2xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By accessing and using the Early Disease Detection System (EDDS), you accept and agree to be bound by 
              the terms and provision of this agreement. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">2. Medical Disclaimer</h2>
            <p className="leading-relaxed mb-3">
              EDDS is an AI-powered diagnostic assistance tool and should NOT be used as a substitute for professional 
              medical advice, diagnosis, or treatment. Important points:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Always consult qualified healthcare professionals for medical decisions</li>
              <li>AI predictions are probabilistic and may contain errors</li>
              <li>Results should be verified by licensed medical practitioners</li>
              <li>Do not delay seeking medical advice based on EDDS results</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">3. Use of Service</h2>
            <p className="leading-relaxed mb-3">You agree to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide accurate information when using the system</li>
              <li>Use the service for lawful purposes only</li>
              <li>Not attempt to reverse engineer or exploit the AI models</li>
              <li>Not upload inappropriate or malicious content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">4. Data Privacy</h2>
            <p className="leading-relaxed">
              We respect your privacy. Medical images and data uploaded to EDDS are processed securely. 
              Please refer to our Privacy Policy for detailed information about data handling and storage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">5. Limitation of Liability</h2>
            <p className="leading-relaxed">
              EDDS and its developers shall not be liable for any direct, indirect, incidental, consequential, 
              or punitive damages arising from the use or inability to use the service. The system is provided 
              "as is" without warranties of any kind.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">6. Intellectual Property</h2>
            <p className="leading-relaxed">
              All content, features, and functionality of EDDS, including AI models, algorithms, and design, 
              are owned by the developers and protected by international copyright and intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">7. Changes to Terms</h2>
            <p className="leading-relaxed">
              We reserve the right to modify these terms at any time. Continued use of EDDS after changes 
              constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">8. Contact Information</h2>
            <p className="leading-relaxed">
              For questions about these Terms and Conditions, please contact us through the feedback form 
              on our About Us page.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
