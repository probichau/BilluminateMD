import { Helmet } from 'react-helmet-async'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import Container from '../components/layout/Container'
import Section from '../components/layout/Section'

export default function PrivacyPage() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | BilluminateMD</title>
        <meta
          name="description"
          content="BilluminateMD Privacy Policy - Learn how we protect your medical billing information."
        />
      </Helmet>

      <div className="min-h-screen bg-white">
        <Header />
        <main>
          <Section bgColor="bg-gray-50">
            <Container>
              <div className="max-w-4xl mx-auto">
                <h1 className="font-headline text-4xl font-bold text-gray-900 mb-6">
                  Privacy Policy
                </h1>
                <p className="text-sm text-gray-600 mb-8">
                  Last Updated: January 2025
                </p>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-headline text-2xl font-bold text-gray-900 mt-8 mb-4">
                    1. Introduction
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    BilluminateMD ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our medical bill auditing service.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    <strong>Important:</strong> BilluminateMD is NOT a HIPAA-covered entity or business associate. We are a consumer-facing Personal Health Record (PHR) service subject to FTC regulation. However, we implement HIPAA-equivalent security practices to protect your sensitive medical billing information.
                  </p>

                  <h2 className="font-headline text-2xl font-bold text-gray-900 mt-8 mb-4">
                    2. Information We Collect
                  </h2>
                  <h3 className="font-headline text-xl font-semibold text-gray-900 mt-6 mb-3">
                    2.1 Medical Billing Information
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    When you upload medical bills for analysis, we process:
                  </p>
                  <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                    <li>Patient name and demographic information</li>
                    <li>Medical service details and procedure codes</li>
                    <li>Billing amounts and insurance information</li>
                    <li>Provider and facility information</li>
                    <li>Dates of service</li>
                  </ul>

                  <h3 className="font-headline text-xl font-semibold text-gray-900 mt-6 mb-3">
                    2.2 Account Information
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    To create and manage your account, we collect:
                  </p>
                  <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                    <li>Email address</li>
                    <li>Password (encrypted)</li>
                    <li>Payment information (processed through Stripe, not stored by us)</li>
                  </ul>

                  <h3 className="font-headline text-xl font-semibold text-gray-900 mt-6 mb-3">
                    2.3 Usage Information
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We automatically collect:
                  </p>
                  <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                    <li>Device and browser information</li>
                    <li>IP address</li>
                    <li>Usage patterns and analytics</li>
                  </ul>

                  <h2 className="font-headline text-2xl font-bold text-gray-900 mt-8 mb-4">
                    3. How We Use Your Information
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We use your information to:
                  </p>
                  <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                    <li><strong>Provide our service:</strong> Analyze medical bills for billing errors</li>
                    <li><strong>Generate results:</strong> Create detailed error reports and appeal letters</li>
                    <li><strong>Process payments:</strong> Handle billing through our payment processor (Stripe)</li>
                    <li><strong>Improve our service:</strong> Analyze usage patterns to enhance functionality</li>
                    <li><strong>Customer support:</strong> Respond to your inquiries and provide assistance</li>
                    <li><strong>Security:</strong> Detect and prevent fraud or unauthorized access</li>
                  </ul>

                  <h2 className="font-headline text-2xl font-bold text-gray-900 mt-8 mb-4">
                    4. Data Storage and Retention
                  </h2>
                  <h3 className="font-headline text-xl font-semibold text-gray-900 mt-6 mb-3">
                    4.1 Ephemeral Processing
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    <strong>Critical Privacy Feature:</strong> Uploaded medical bills are processed in memory and immediately deleted after analysis. We do NOT permanently store your medical bills in our databases.
                  </p>

                  <h3 className="font-headline text-xl font-semibold text-gray-900 mt-6 mb-3">
                    4.2 What We Retain
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We retain only:
                  </p>
                  <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                    <li>Account information (email, encrypted password)</li>
                    <li>Audit results and generated appeal letters (stored in your browser)</li>
                    <li>Transaction records (for billing purposes)</li>
                    <li>Anonymized analytics data</li>
                  </ul>

                  <h2 className="font-headline text-2xl font-bold text-gray-900 mt-8 mb-4">
                    5. Data Security
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We implement industry-standard security measures:
                  </p>
                  <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                    <li><strong>Encryption in Transit:</strong> All data transmitted using TLS 1.2+ encryption</li>
                    <li><strong>Encryption at Rest:</strong> AES-256 encryption for stored data</li>
                    <li><strong>Access Controls:</strong> Role-based access with multi-factor authentication for internal systems</li>
                    <li><strong>Regular Security Audits:</strong> Periodic assessment of security practices</li>
                    <li><strong>Secure Infrastructure:</strong> Hosted on enterprise-grade cloud platforms</li>
                  </ul>

                  <h2 className="font-headline text-2xl font-bold text-gray-900 mt-8 mb-4">
                    6. Third-Party Services
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We use the following third-party services:
                  </p>
                  <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                    <li><strong>Anthropic Claude API:</strong> AI-powered medical bill analysis (covered by BAA)</li>
                    <li><strong>Stripe:</strong> Payment processing (PCI-DSS compliant)</li>
                    <li><strong>Analytics:</strong> Anonymized usage analytics to improve our service</li>
                  </ul>

                  <h2 className="font-headline text-2xl font-bold text-gray-900 mt-8 mb-4">
                    7. Data Sharing and Disclosure
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    <strong>We do NOT sell, rent, or share your personal health information with third parties for marketing purposes.</strong>
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We may disclose information only in these limited circumstances:
                  </p>
                  <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                    <li><strong>With your consent:</strong> When you explicitly authorize sharing</li>
                    <li><strong>Service providers:</strong> Third-party vendors who assist in providing our service (under strict confidentiality agreements)</li>
                    <li><strong>Legal compliance:</strong> When required by law or court order</li>
                    <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets (with continued privacy protections)</li>
                  </ul>

                  <h2 className="font-headline text-2xl font-bold text-gray-900 mt-8 mb-4">
                    8. Your Privacy Rights
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    You have the right to:
                  </p>
                  <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                    <li><strong>Access:</strong> Request a copy of your personal information</li>
                    <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                    <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                    <li><strong>Export:</strong> Download your data in portable format</li>
                    <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    To exercise these rights, contact us at <a href="mailto:privacy@billuminate.com" className="text-primary-600 hover:underline">privacy@billuminate.com</a>
                  </p>

                  <h2 className="font-headline text-2xl font-bold text-gray-900 mt-8 mb-4">
                    9. Data Breach Notification
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    In accordance with the FTC Health Breach Notification Rule, we will notify you within 60 days of discovering any breach of unsecured health information.
                  </p>

                  <h2 className="font-headline text-2xl font-bold text-gray-900 mt-8 mb-4">
                    10. Children's Privacy
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Our service is not directed to individuals under 18. We do not knowingly collect information from minors.
                  </p>

                  <h2 className="font-headline text-2xl font-bold text-gray-900 mt-8 mb-4">
                    11. Changes to This Privacy Policy
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We may update this Privacy Policy periodically. We will notify you of material changes by email or prominent notice on our website.
                  </p>

                  <h2 className="font-headline text-2xl font-bold text-gray-900 mt-8 mb-4">
                    12. Contact Us
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    For privacy-related questions or concerns:
                  </p>
                  <ul className="list-none mb-4 text-gray-700 space-y-2">
                    <li><strong>Email:</strong> <a href="mailto:privacy@billuminate.com" className="text-primary-600 hover:underline">privacy@billuminate.com</a></li>
                    <li><strong>General Support:</strong> <a href="mailto:support@billuminate.com" className="text-primary-600 hover:underline">support@billuminate.com</a></li>
                  </ul>

                  <h2 className="font-headline text-2xl font-bold text-gray-900 mt-8 mb-4">
                    13. Legal Disclaimer
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    <strong>This is not legal advice.</strong> BilluminateMD provides medical billing analysis services for informational purposes only. We are not attorneys and do not provide legal advice. Consult with a healthcare attorney for legal guidance specific to your situation.
                  </p>
                </div>
              </div>
            </Container>
          </Section>
        </main>
        <Footer />
      </div>
    </>
  )
}
