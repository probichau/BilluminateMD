import { Link } from 'react-router-dom'
import Container from './Container'

export default function Footer() {
  const footerLinks = {
    product: [
      { name: 'How It Works', href: '/how-it-works' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'FAQ', href: '/faq' },
      { name: 'App Login', href: '/app' },
    ],
    company: [
      { name: 'About', href: '/about' },
      { name: 'Support', href: '/support' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
  }

  return (
    <footer className="bg-gray-900 text-white">
      <Container>
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {/* Logo and description */}
            <div className="col-span-2 lg:col-span-1">
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-headline font-bold text-white">
                  Billuminate<span className="text-accent-500">MD</span>
                </span>
              </Link>
              <p className="mt-4 text-sm text-gray-400">
                Your personal medical billing advocate. Find errors, save money.
              </p>
            </div>

            {/* Product links */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-gray-400 hover:text-accent-500 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company links */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    {link.href.startsWith('mailto:') ? (
                      <a
                        href={link.href}
                        className="text-sm text-gray-400 hover:text-accent-500 transition-colors"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-sm text-gray-400 hover:text-accent-500 transition-colors"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal links */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-gray-400 hover:text-accent-500 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <p className="text-sm text-gray-400 text-center">
              © {new Date().getFullYear()} BilluminateMD. All rights reserved.
              <span className="block mt-1 text-xs">
                Not a substitute for legal or financial advice.
              </span>
            </p>
          </div>
        </div>
      </Container>
    </footer>
  )
}
