import { Helmet } from 'react-helmet-async'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import Container from '../components/layout/Container'
import Section from '../components/layout/Section'

export default function TermsPage() {
  return (
    <>
      <Helmet>
        <title>Terms of Service | BilluminateMD</title>
        <meta
          name="description"
          content="BilluminateMD Terms of Service - Read our user agreement and service terms."
        />
      </Helmet>

      <div className="min-h-screen bg-white">
        <Header />
        <main>
          <Section bgColor="bg-gray-50">
            <Container>
              <div className="max-w-4xl mx-auto">
                <h1 className="font-headline text-4xl font-bold text-gray-900 mb-6">
                  Terms of Service
                </h1>
                <p className="text-sm text-gray-600 mb-8">
                  Last Updated: January 2025
                </p>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-headline text-2xl font-bold text-gray-900 mt-8 mb-4">
                    1. Acceptance of Terms
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    By accessing or using BilluminateMD ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service.
                  </p>

                  <h2 className="font-headline text-2xl font-bold text-gray-900 mt-8 mb-4">
                    2. Description of Service
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    BilluminateMD is a medical bill auditing service that:
                  </p>
                  <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                    <li>Analyzes uploaded medical bills for billing errors</li>
                    <li>Identifies issues such as unbundling, upcoding, duplicate charges, and inflated costs</li>
                    <li>Generates professional appeal letters for disputing errors</li>
                    <li>Provides detailed findings reports</li>
                  </ul>

                  <h2 className="font-headline text-2xl font-bold text-gray-900 mt-8 mb-4">
                    3. User Responsibilities
                  </h2>
                  <h3 className="font-headline text-xl font-semibold text-gray-900 mt-6 mb-3">
                    3.1 Accurate Information
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    You agree to:
                  </p>
                  <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                    <li>Provide accurate, complete medical bills for analysis</li>
                    <li>Upload only bills for which you are the patient or authorized representative</li>
                    <li>Maintain the security of your account credentials</li>
                    <li>Notify us immediately of any unauthorized account access</li>
                  </ul>

                  <h3 className="font-headline text-xl font-semibold text-gray-900 mt-6 mb-3">
                    3.2 Prohibited Uses
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    You may NOT:
                  </p>
                  <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                    <li>Upload bills that do not belong to you without proper authorization</li>
                    <li>Use the Service for any illegal purpose</li>
                    <li>Attempt to reverse-engineer or copy our technology</li>
                    <li>Transmit malware, viruses, or harmful code</li>
                    <li>Use automated systems to access the Service without permission</li>
                    <li>Resell or redistribute our Service without authorization</li>
                  </ul>

                  <h2 className="font-headline text-2xl font-bold text-gray-900 mt-8 mb-4">
                    4. Pricing and Payment
                  </h2>
                  <h3 className="font-headline text-xl font-semibold text-gray-900 mt-6 mb-3">
                    4.1 Current Pricing
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    One-time bill scan: $49 per bill
                  </p>

                  <h3 className="font-headline text-xl font-semibold text-gray-900 mt-6 mb-3">
                    4.2 Payment Processing
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Payments are processed through Stripe. By using the Service, you agree to Stripe's Terms of Service.
                  </p>

                  <h3 className="font-headline text-xl font-semibold text-gray-900 mt-6 mb-3">
                    4.3 Refund Policy
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    <strong>No Refunds for Completed Analysis:</strong> Once we have completed the analysis of your medical bill, we cannot offer refunds, regardless of whether errors were found. The $49 fee covers the analytical work performed, not the discovery of specific errors.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    <strong>Technical Issues:</strong> If our Service fails to process your bill due to technical errors on our end, we will offer a full refund or re-analysis at no additional charge.
                  </p>

                  <h2 className="font-headline text-2xl font-bold text-gray-900 mt-8 mb-4">
                    5. Intellectual Property
                  </h2>
                  <h3 className="font-headline text-xl font-semibold text-gray-900 mt-6 mb-3">
                    5.1 Our Content
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    All content on BilluminateMD, including software, algorithms, text, graphics, logos, and trademarks, is owned by BilluminateMD or its licensors and protected by copyright and trademark laws.
                  </p>

                  <h3 className="font-headline text-xl font-semibold text-gray-900 mt-6 mb-3">
                    5.2 Your Content
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    You retain ownership of the medical bills you upload. By using our Service, you grant us a limited license to process your bills solely for the purpose of providing the Service.
                  </p>

                  <h2 className="font-headline text-2xl font-bold text-gray-900 mt-8 mb-4">
                    6. Disclaimers and Limitations of Liability
                  </h2>
                  <h3 className="font-headline text-xl font-semibold text-gray-900 mt-6 mb-3">
                    6.1 Not Legal or Medical Advice
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    <strong>IMPORTANT:</strong> BilluminateMD provides informational services only. We are NOT:
                  </p>
                  <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                    <li>A law firm or legal service provider</li>
                    <li>A licensed medical billing advocate</li>
                    <li>A healthcare provider or medical professional</li>
                    <li>A financial advisor</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Our analysis and appeal letters are for informational purposes only. Consult with appropriate professionals (attorneys, medical billing advocates, financial advisors) for specific guidance.
                  </p>

                  <h3 className="font-headline text-xl font-semibold text-gray-900 mt-6 mb-3">
                    6.2 No Guarantees
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We make NO guarantees that:
                  </p>
                  <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                    <li>Errors will be found in your medical bills</li>
                    <li>Identified errors will be corrected by providers or insurance companies</li>
                    <li>You will achieve any specific financial savings</li>
                    <li>Our appeal letters will result in successful disputes</li>
                    <li>The Service will be available 24/7 without interruption</li>
                  </ul>

                  <h3 className="font-headline text-xl font-semibold text-gray-900 mt-6 mb-3">
                    6.3 Service "As Is"
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
                  </p>

                  <h3 className="font-headline text-xl font-semibold text-gray-900 mt-6 mb-3">
                    6.4 Limitation of Liability
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, BILLUMINATEMD SHALL NOT BE LIABLE FOR:
                  </p>
                  <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                    <li>Indirect, incidental, special, consequential, or punitive damages</li>
                    <li>Loss of profits, revenue, data, or use</li>
                    <li>Any damages exceeding the amount you paid for the Service ($49)</li>
                  </ul>

                  <h2 className="font-headline text-2xl font-bold text-gray-900 mt-8 mb-4">
                    7. Indemnification
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    You agree to indemnify and hold harmless BilluminateMD from any claims, damages, or expenses arising from:
                  </p>
                  <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                    <li>Your violation of these Terms</li>
                    <li>Your use of the Service</li>
                    <li>Your disputes with healthcare providers or insurance companies</li>
                    <li>Unauthorized use of your account</li>
                  </ul>

                  <h2 className="font-headline text-2xl font-bold text-gray-900 mt-8 mb-4">
                    8. Privacy
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Your use of the Service is also governed by our <a href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</a>, which is incorporated into these Terms by reference.
                  </p>

                  <h2 className="font-headline text-2xl font-bold text-gray-900 mt-8 mb-4">
                    9. Termination
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We reserve the right to suspend or terminate your access to the Service at any time for:
                  </p>
                  <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                    <li>Violation of these Terms</li>
                    <li>Fraudulent or illegal activity</li>
                    <li>Non-payment</li>
                    <li>Any reason at our sole discretion</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    You may terminate your account at any time by contacting <a href="mailto:support@billuminate.com" className="text-primary-600 hover:underline">support@billuminate.com</a>
                  </p>

                  <h2 className="font-headline text-2xl font-bold text-gray-900 mt-8 mb-4">
                    10. Dispute Resolution
                  </h2>
                  <h3 className="font-headline text-xl font-semibold text-gray-900 mt-6 mb-3">
                    10.1 Governing Law
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    These Terms are governed by the laws of the State of California, without regard to conflict of law principles.
                  </p>

                  <h3 className="font-headline text-xl font-semibold text-gray-900 mt-6 mb-3">
                    10.2 Arbitration
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Any disputes arising from these Terms or your use of the Service shall be resolved through binding arbitration in accordance with the American Arbitration Association rules, except where prohibited by law.
                  </p>

                  <h2 className="font-headline text-2xl font-bold text-gray-900 mt-8 mb-4">
                    11. Changes to Terms
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We may update these Terms at any time. Material changes will be communicated via email or prominent notice on our website. Continued use of the Service after changes constitutes acceptance of the updated Terms.
                  </p>

                  <h2 className="font-headline text-2xl font-bold text-gray-900 mt-8 mb-4">
                    12. Severability
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    If any provision of these Terms is found to be unenforceable, the remaining provisions shall remain in full force and effect.
                  </p>

                  <h2 className="font-headline text-2xl font-bold text-gray-900 mt-8 mb-4">
                    13. Contact Information
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    For questions about these Terms:
                  </p>
                  <ul className="list-none mb-4 text-gray-700 space-y-2">
                    <li><strong>Email:</strong> <a href="mailto:support@billuminate.com" className="text-primary-600 hover:underline">support@billuminate.com</a></li>
                    <li><strong>Legal inquiries:</strong> <a href="mailto:legal@billuminate.com" className="text-primary-600 hover:underline">legal@billuminate.com</a></li>
                  </ul>
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
