import { Helmet } from 'react-helmet-async'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import Hero from '../components/marketing/Hero'
import StatsSection from '../components/marketing/StatsSection'
import ProcessSection from '../components/marketing/ProcessSection'
import ErrorTypesSection from '../components/marketing/ErrorTypesSection'
import FounderSection from '../components/marketing/FounderSection'
import SecuritySection from '../components/marketing/SecuritySection'
import PricingSection from '../components/marketing/PricingSection'
import FAQSection from '../components/marketing/FAQSection'
import FinalCTA from '../components/marketing/FinalCTA'

export default function LandingPage() {
  return (
    <>
      <Helmet>
        <title>BilluminateMD | Find Errors in Your Medical Bills</title>
        <meta
          name="description"
          content="80% of medical bills have errors. BilluminateMD scans your bills for unbundling, upcoding, and overcharges, then generates appeal letters. $49 flat fee."
        />
        <meta property="og:title" content="BilluminateMD - Medical Bill Error Detection" />
        <meta
          property="og:description"
          content="Find errors in your medical bills and generate appeal letters automatically."
        />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-white">
        <Header />
        <main>
          <Hero />
          <StatsSection />
          <ProcessSection />
          <ErrorTypesSection />
          <FounderSection />
          <SecuritySection />
          <PricingSection />
          <FAQSection />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </>
  )
}
