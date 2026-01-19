import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PricingPage from './pages/PricingPage'
import SubscriptionSuccessPage from './pages/SubscriptionSuccessPage'
import FinancialInfoPage from './pages/FinancialInfoPage'
import ResultsPage from './pages/ResultsPage'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/subscription-success" element={<SubscriptionSuccessPage />} />
            <Route path="/financial-info" element={<FinancialInfoPage />} />
            <Route path="/results/:auditId" element={<ResultsPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
