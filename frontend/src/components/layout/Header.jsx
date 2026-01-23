import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Container from './Container'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'FAQ', href: '/faq' },
    { name: 'About', href: '/about' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <Container>
        <nav className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-headline font-bold text-primary-600">
              Billuminate<span className="text-accent-500">MD</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
              >
                {item.name}
              </Link>
            ))}
            <Link
              to="/app"
              className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white bg-gradient-trust rounded-lg hover:opacity-90 transition-opacity shadow-sm"
            >
              Scan Your Bill
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-gray-200">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="block text-base font-medium text-gray-700 hover:text-primary-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link
              to="/app"
              className="block text-center px-6 py-2.5 text-sm font-semibold text-white bg-gradient-trust rounded-lg hover:opacity-90 transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            >
              Scan Your Bill
            </Link>
          </div>
        )}
      </Container>
    </header>
  )
}
