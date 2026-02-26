import { Shield } from 'lucide-react'

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="glass-strong rounded-2xl p-8 md:p-12">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-10 h-10 text-purple-400" />
          <h1 className="text-3xl md:text-4xl font-bold text-white">Privacy Policy</h1>
        </div>
        
        <p className="text-white/60 mb-8">Last updated: January 2025</p>

        <div className="space-y-6 text-white/80">
          <section>
            <h2 className="text-2xl font-bold text-white mb-3">1. Information We Collect</h2>
            <p className="leading-relaxed mb-3">
              EDDS collects the following types of information:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Medical Images:</strong> Skin lesion photos, chest X-rays uploaded for analysis</li>
              <li><strong>Clinical Data:</strong> Heart disease parameters (age, blood pressure, cholesterol, etc.)</li>
              <li><strong>Usage Data:</strong> Browser type, device information, access times</li>
              <li><strong>Account Information:</strong> Email, name (if you create an account)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">2. How We Use Your Information</h2>
            <p className="leading-relaxed mb-3">Your data is used to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide AI-powered disease detection and predictions</li>
              <li>Improve our machine learning models and accuracy</li>
              <li>Analyze system performance and user experience</li>
              <li>Communicate important updates about the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">3. Data Security</h2>
            <p className="leading-relaxed mb-3">
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Encrypted data transmission using HTTPS/SSL</li>
              <li>Secure server infrastructure with access controls</li>
              <li>Regular security audits and updates</li>
              <li>No permanent storage of medical images (processed in memory)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">4. Data Sharing</h2>
            <p className="leading-relaxed mb-3">
              We do NOT sell or share your personal medical data with third parties. Data may be shared only:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>With your explicit consent</li>
              <li>When required by law or legal process</li>
              <li>In anonymized, aggregated form for research purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">5. Data Retention</h2>
            <p className="leading-relaxed">
              Medical images are processed in real-time and not permanently stored on our servers. 
              Clinical data and prediction results may be retained for service improvement and 
              quality assurance purposes. You can request deletion of your data at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">6. Your Rights</h2>
            <p className="leading-relaxed mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of data collection for research purposes</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">7. Cookies and Tracking</h2>
            <p className="leading-relaxed">
              EDDS uses minimal cookies for essential functionality (session management, preferences). 
              We do not use third-party tracking or advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">8. Children's Privacy</h2>
            <p className="leading-relaxed">
              EDDS is not intended for users under 18 years of age. We do not knowingly collect 
              personal information from children. If you believe we have collected data from a minor, 
              please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">9. Changes to Privacy Policy</h2>
            <p className="leading-relaxed">
              We may update this Privacy Policy periodically. Significant changes will be notified 
              through the platform. Continued use after changes indicates acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3">10. Contact Us</h2>
            <p className="leading-relaxed">
              For privacy-related questions or to exercise your data rights, please contact us 
              through the feedback form on our About Us page or email us directly.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
