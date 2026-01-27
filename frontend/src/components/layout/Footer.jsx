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
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              {/* Left side - Navigation menu */}
              <nav className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
                <Link to="/support" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy
                </Link>
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms
                </Link>
              </nav>

              {/* Right side - Copyright and disclaimer */}
              <div className="text-center md:text-right">
                <p className="text-sm text-gray-400">
                  © {new Date().getFullYear()} BilluminateMD. All rights reserved.
                </p>
                <p className="text-xs text-gray-500 mt-2 max-w-2xl leading-relaxed">
                  By accessing, viewing, scrolling through, skimming, or otherwise perceiving the contents of this website (hereinafter referred to as "BilluminateMD," "this digital domicile," or "the internet equivalent of a medical billing advocate's office"), you, the Visitor, have entered into an unspoken but deeply heartfelt arrangement wherein the Proprietor hereby extends sincere and non-revocable appreciation for your presence.
                  <br /><br />
                  <strong>WHEREAS</strong>, the internet is vast and largely full of things that are not this website; and
                  <br />
                  <strong>WHEREAS</strong>, you have nonetheless elected to allocate a portion of your finite mortal existence to these particular pixels;
                  <br /><br />
                  <strong>NOW, THEREFORE</strong>, it is the express hope of the Proprietor that you have derived some modicum of value, entertainment, insight, or at minimum a brief respite from medical billing anxiety during your time here. Should you have found something useful, the Proprietor reserves the right to feel unreasonably pleased about this. Should you have not, no refunds of time shall be issued, but the Proprietor does feel kind of bad about it.
                  <br /><br />
                  This gratitude shall remain in effect in perpetuity, or until the heat death of the universe, whichever comes first.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  )
}
