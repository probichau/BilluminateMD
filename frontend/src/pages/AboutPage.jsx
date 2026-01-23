import { Helmet } from 'react-helmet-async'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import Container from '../components/layout/Container'
import Section from '../components/layout/Section'
import FounderSection from '../components/marketing/FounderSection'
import SecuritySection from '../components/marketing/SecuritySection'

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About Us | BilluminateMD</title>
        <meta
          name="description"
          content="Learn about BilluminateMD and our mission to help patients fight medical billing errors."
        />
      </Helmet>

      <div className="min-h-screen bg-white">
        <Header />
        <main>
          <Section bgColor="bg-gradient-to-b from-primary-100/30 to-white">
            <Container>
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="font-headline text-4xl font-bold text-gray-900 sm:text-5xl mb-6">
                  Our Mission: End Medical Billing Overcharges
                </h1>
                <p className="text-lg text-gray-700 leading-relaxed">
                  BilluminateMD was built by a healthcare security expert who saw firsthand
                  how patients were being overcharged—and how hard it was to fight back.
                </p>
              </div>
            </Container>
          </Section>

          <Section bgColor="bg-white">
            <Container>
              <div className="max-w-3xl mx-auto">
                <h2 className="font-headline text-3xl font-bold text-gray-900 mb-6">
                  The Problem
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Medical bills are intentionally confusing. Hospitals and insurance companies
                  use complex coding systems, abbreviations, and bundled charges that make it
                  nearly impossible for patients to verify accuracy. Studies show that 80% of
                  medical bills contain errors, costing patients an average of $1,200+ per incident.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Traditional billing advocates charge 25-50% of whatever they save you. For a
                  $5,000 error, that's up to $2,500 in fees—money that should stay in your pocket.
                </p>

                <h2 className="font-headline text-3xl font-bold text-gray-900 mb-6 mt-12">
                  Our Solution
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  BilluminateMD uses AI to scan medical bills for common and costly errors:
                  unbundling violations, upcoding, duplicate charges, inflated costs, and more.
                  We compare your charges against Medicare rates and NCCI bundling rules to
                  identify overcharges you'd never catch on your own.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  For a flat $49 fee, you get a detailed analysis and a professional appeal
                  letter—ready to send to your provider or insurance company. No percentage fees.
                  No hidden costs. You keep 100% of your savings.
                </p>

                <h2 className="font-headline text-3xl font-bold text-gray-900 mb-6 mt-12">
                  Our Values
                </h2>
                <ul className="space-y-4 text-lg text-gray-700">
                  <li className="flex items-start">
                    <span className="text-primary-600 font-bold mr-3">•</span>
                    <div>
                      <strong className="text-gray-900">Transparency:</strong> We tell you
                      exactly what we find and how we found it.
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 font-bold mr-3">•</span>
                    <div>
                      <strong className="text-gray-900">Privacy:</strong> Your medical data
                      is processed and immediately deleted. We don't store bills.
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 font-bold mr-3">•</span>
                    <div>
                      <strong className="text-gray-900">Fairness:</strong> Flat-rate pricing
                      means you keep your savings, not us.
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 font-bold mr-3">•</span>
                    <div>
                      <strong className="text-gray-900">Patient Advocacy:</strong> We're on
                      your side, not the hospital's or insurance company's.
                    </div>
                  </li>
                </ul>
              </div>
            </Container>
          </Section>

          <FounderSection />
          <SecuritySection />
        </main>
        <Footer />
      </div>
    </>
  )
}
