import { Helmet } from 'react-helmet-async'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import FAQSection from '../components/marketing/FAQSection'

export default function FAQPage() {
  return (
    <>
      <Helmet>
        <title>Frequently Asked Questions | BilluminateMD</title>
        <meta
          name="description"
          content="Find answers to common questions about BilluminateMD's medical bill auditing service."
        />
      </Helmet>

      <div className="min-h-screen bg-white">
        <Header />
        <main>
          <FAQSection />
        </main>
        <Footer />
      </div>
    </>
  )
}
