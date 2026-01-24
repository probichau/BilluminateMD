import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import LandingPage from './pages/LandingPage'
import HomePage from './pages/HomePage'
import PricingPage from './pages/PricingPage'
import FinancialInfoPage from './pages/FinancialInfoPage'
import ResultsPage from './pages/ResultsPage'
import HowItWorksPage from './pages/HowItWorksPage'
import AboutPage from './pages/AboutPage'
import FAQPage from './pages/FAQPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import SupportPage from './pages/SupportPage'
import './App.css'

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Routes>
          {/* Marketing/Public Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/support" element={<SupportPage />} />

          {/* Application Pages (No auth required - pay per use) */}
          <Route path="/app" element={<HomePage />} />
          <Route path="/financial-info" element={<FinancialInfoPage />} />
          <Route path="/results/:auditId" element={<ResultsPage />} />
        </Routes>
      </Router>
    </HelmetProvider>
  )
}

export default App
