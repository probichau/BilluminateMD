import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ResultsPage from './pages/ResultsPage'
import './App.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/results/:auditId" element={<ResultsPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
