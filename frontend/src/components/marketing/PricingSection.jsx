import { motion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
import Container from '../layout/Container'
import Section from '../layout/Section'
import Card from '../ui/Card'
import Button from '../ui/Button'

export default function PricingSection() {
  const features = [
    'Upload any medical bill',
    'AI-powered error detection',
    'Comparison against Medicare rates',
    'Professional appeal letter generated',
    'Detailed findings report',
    'Email support',
  ]

  return (
    <Section bgColor="bg-white">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="font-headline text-3xl font-bold text-gray-900 sm:text-4xl">
            Simple Pricing. Serious Savings.
          </h2>
        </motion.div>

        <div className="mt-16 max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
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
                    $49
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
          </motion.div>

          {/* Value comparison */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 text-center"
          >
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong className="text-gray-900">Medical billing advocates charge 25-50% of savings.</strong>
                <br />
                On a $5,000 error, that's $1,250-$2,500.
                <br />
                <span className="text-primary-600 font-semibold">You pay $49. Period.</span>
              </p>
            </div>
          </motion.div>

          {/* Coming soon tier */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-12"
          >
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="inline-flex items-center gap-2 text-primary-600 mb-3">
                <Sparkles className="h-5 w-5" />
                <span className="text-sm font-bold uppercase tracking-wide">Coming Soon</span>
              </div>
              <h3 className="font-headline text-xl font-bold text-gray-900 mb-2">
                Continuous Monitoring
              </h3>
              <div className="text-2xl font-bold text-gray-900 mb-3">
                $14.99<span className="text-base font-normal text-gray-600">/month</span>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                Connect your insurance via secure API for automatic EOB monitoring.
                Like Rocket Money for healthcare.
              </p>
              <Button variant="secondary" size="md" className="w-full" disabled>
                Join Waitlist
              </Button>
            </div>
          </motion.div>
        </div>
      </Container>
    </Section>
  )
}
