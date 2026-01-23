import { Helmet } from 'react-helmet-async'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import ProcessSection from '../components/marketing/ProcessSection'
import ErrorTypesSection from '../components/marketing/ErrorTypesSection'
import Container from '../components/layout/Container'
import Section from '../components/layout/Section'
import Button from '../components/ui/Button'

export default function HowItWorksPage() {
  return (
    <>
      <Helmet>
        <title>How It Works | BilluminateMD</title>
        <meta
          name="description"
          content="Learn how BilluminateMD analyzes your medical bills for errors and generates appeal letters."
        />
      </Helmet>

      <div className="min-h-screen bg-white">
        <Header />
        <main>
          <Section bgColor="bg-gradient-to-b from-primary-100/30 to-white">
            <Container>
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="font-headline text-4xl font-bold text-gray-900 sm:text-5xl mb-6">
                  How BilluminateMD Works
                </h1>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Our AI-powered system scans your medical bills in minutes, identifies
                  billing errors, and generates professional appeal letters—all for a flat
                  $49 fee.
                </p>
              </div>
            </Container>
          </Section>

          <ProcessSection />
          <ErrorTypesSection />

          <Section bgColor="bg-white">
            <Container>
              <div className="max-w-3xl mx-auto">
                <h2 className="font-headline text-3xl font-bold text-gray-900 mb-8 text-center">
                  What You'll Receive
                </h2>

                <div className="space-y-6">
                  <div className="border-l-4 border-primary-600 pl-6 py-2">
                    <h3 className="font-headline text-xl font-bold text-gray-900 mb-2">
                      Detailed Findings Report
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      A comprehensive breakdown of every error we found, including:
                    </p>
                    <ul className="mt-3 space-y-2 text-gray-700">
                      <li>• Specific line items with errors</li>
                      <li>• Type of error (unbundling, upcoding, duplicate, etc.)</li>
                      <li>• Expected cost vs. actual charge</li>
                      <li>• Total potential savings</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-primary-600 pl-6 py-2">
                    <h3 className="font-headline text-xl font-bold text-gray-900 mb-2">
                      Professional Appeal Letter
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      A ready-to-send letter that includes:
                    </p>
                    <ul className="mt-3 space-y-2 text-gray-700">
                      <li>• Formal request for billing review</li>
                      <li>• Citation of specific errors with evidence</li>
                      <li>• References to Medicare rates and NCCI rules</li>
                      <li>• Professional tone and formatting</li>
                      <li>• Instructions for where to send it</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-primary-600 pl-6 py-2">
                    <h3 className="font-headline text-xl font-bold text-gray-900 mb-2">
                      Next Steps Guidance
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Clear instructions on:
                    </p>
                    <ul className="mt-3 space-y-2 text-gray-700">
                      <li>• How to submit your appeal</li>
                      <li>• What to expect from providers/insurance</li>
                      <li>• Typical resolution timelines</li>
                      <li>• When to follow up</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-12 text-center">
                  <Button to="/app" size="lg">
                    Get Started — $49
                  </Button>
                </div>
              </div>
            </Container>
          </Section>

          <Section bgColor="bg-gray-50">
            <Container>
              <div className="max-w-3xl mx-auto">
                <h2 className="font-headline text-3xl font-bold text-gray-900 mb-8 text-center">
                  Frequently Asked Questions
                </h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-headline text-lg font-bold text-gray-900 mb-2">
                      How accurate is the AI analysis?
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Our AI is trained on Medicare billing rules, NCCI bundling guidelines,
                      and thousands of medical billing codes. It cross-references your charges
                      against industry standards to identify errors with high accuracy.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-headline text-lg font-bold text-gray-900 mb-2">
                      What if my bill is complex?
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      We can handle bills of any complexity—from simple physician visits to
                      complex hospital stays with hundreds of line items. The more complex
                      the bill, the more likely we are to find errors.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-headline text-lg font-bold text-gray-900 mb-2">
                      Do I need the itemized bill or the summary?
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      For best results, upload the <strong>itemized</strong> version (also
                      called an "itemized statement" or "detailed bill"). This shows
                      individual charges with CPT codes and descriptions. Summary statements
                      lack the detail needed for thorough analysis.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-headline text-lg font-bold text-gray-900 mb-2">
                      How long does it take?
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Most analyses complete in under 2 minutes. You'll receive your results
                      and appeal letter immediately upon completion.
                    </p>
                  </div>
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
