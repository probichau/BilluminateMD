import { Helmet } from 'react-helmet-async'
import { Check, Sparkles } from 'lucide-react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import Container from '../components/layout/Container'
import Section from '../components/layout/Section'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { REPORT_PRICE, SUBSCRIPTION_PRICE } from '../config'

export default function PricingPage() {
  const features = [
    'Upload any medical bill',
    'AI-powered error detection',
    'Comparison against Medicare rates',
    'Professional appeal letter generated',
    'Detailed findings report',
    'Email support',
  ]

  return (
    <>
      <Helmet>
        <title>Pricing | BilluminateMD</title>
        <meta
          name="description"
          content="Simple, transparent pricing for medical bill auditing. $49 per bill with no hidden fees."
        />
      </Helmet>

      <div className="min-h-screen bg-white">
        <Header />
        <main>
          <Section bgColor="bg-gradient-to-b from-primary-100/30 to-white">
            <Container>
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="font-headline text-4xl font-bold text-gray-900 sm:text-5xl mb-6">
                  Simple Pricing. Serious Savings.
                </h1>
                <p className="text-lg text-gray-700 leading-relaxed">
                  No percentage fees. No hidden costs. You keep 100% of your savings.
                </p>
              </div>
            </Container>
          </Section>

          <Section bgColor="bg-white">
            <Container>
              <div className="max-w-lg mx-auto">
                {/* Main Pricing Card */}
                <Card className="relative overflow-hidden">
                  {/* Best value badge */}
                  <div className="absolute top-0 right-0">
                    <div className="bg-gradient-trust text-white px-4 py-1 text-xs font-bold rounded-bl-lg">
                      BEST VALUE
                    </div>
                  </div>

                  <div className="text-center pt-6">
                    <h3 className="font-headline text-2xl font-bold text-gray-900">
                      One-Time Bill Scan
                    </h3>
                    <div className="mt-4 flex items-baseline justify-center gap-2">
                      <span className="font-headline text-5xl font-bold text-primary-600">
                        ${REPORT_PRICE.toFixed(2)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">One-time payment, per bill</p>
                  </div>

                  <ul className="mt-8 space-y-4">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-accent-500 flex-shrink-0 mt-0.5" />
                        <span className="text-base text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <Button to="/app" size="lg" className="w-full">
                      Scan My Bill Now
                    </Button>
                  </div>
                </Card>

                {/* Value comparison */}
                <div className="mt-8 text-center">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <strong className="text-gray-900">
                        Medical billing advocates charge 25-50% of savings.
                      </strong>
                      <br />
                      On a $5,000 error, that's $1,250-$2,500.
                      <br />
                      <span className="text-primary-600 font-semibold">
                        You pay ${REPORT_PRICE.toFixed(2)}. Period.
                      </span>
                    </p>
                  </div>
                </div>

                {/* Coming soon tier */}
                <div className="mt-12">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="inline-flex items-center gap-2 text-primary-600 mb-3">
                      <Sparkles className="h-5 w-5" />
                      <span className="text-sm font-bold uppercase tracking-wide">
                        Coming Soon
                      </span>
                    </div>
                    <h3 className="font-headline text-xl font-bold text-gray-900 mb-2">
                      Continuous Monitoring
                    </h3>
                    <div className="text-2xl font-bold text-gray-900 mb-3">
                      ${SUBSCRIPTION_PRICE.toFixed(2)}
                      <span className="text-base font-normal text-gray-600">/month</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-4">
                      Connect your insurance via secure API for automatic EOB monitoring. Like
                      Rocket Money for healthcare.
                    </p>
                    <Button variant="secondary" size="md" className="w-full" disabled>
                      Join Waitlist
                    </Button>
                  </div>
                </div>
              </div>
            </Container>
          </Section>

          {/* FAQ Section */}
          <Section bgColor="bg-gray-50">
            <Container>
              <div className="max-w-3xl mx-auto">
                <h2 className="font-headline text-3xl font-bold text-gray-900 mb-8 text-center">
                  Pricing FAQs
                </h2>

                <div className="space-y-6">
                  <Card>
                    <h3 className="font-headline text-lg font-bold text-gray-900 mb-2">
                      What happens if no errors are found?
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      If we don't find any billing errors, you'll receive a report confirming
                      your bill appears accurate. Unfortunately, we cannot offer refunds for
                      accurate bills, as the analysis work has been completed.
                    </p>
                  </Card>

                  <Card>
                    <h3 className="font-headline text-lg font-bold text-gray-900 mb-2">
                      How is this different from billing advocates?
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Traditional billing advocates charge 25-50% of whatever they save you. On
                      a $5,000 error, that's $1,250-$2,500 in fees. We charge a flat $
                      {REPORT_PRICE.toFixed(2)} regardless of how much we find. You keep 100% of
                      your savings.
                    </p>
                  </Card>

                  <Card>
                    <h3 className="font-headline text-lg font-bold text-gray-900 mb-2">
                      Can I use this for multiple bills?
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Yes! Each bill requires a separate ${REPORT_PRICE.toFixed(2)} payment. If
                      you have multiple bills to review regularly, join the waitlist for our
                      upcoming monthly monitoring subscription.
                    </p>
                  </Card>

                  <Card>
                    <h3 className="font-headline text-lg font-bold text-gray-900 mb-2">
                      Do I need an account?
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      No account is required! Simply upload your bill, pay the one-time fee, and
                      receive your analysis and appeal letter immediately.
                    </p>
                  </Card>

                  <Card>
                    <h3 className="font-headline text-lg font-bold text-gray-900 mb-2">
                      What payment methods do you accept?
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      We accept all major credit cards (Visa, Mastercard, American Express,
                      Discover) through our secure payment processor, Stripe.
                    </p>
                  </Card>
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
