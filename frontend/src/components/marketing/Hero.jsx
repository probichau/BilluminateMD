import { motion } from 'framer-motion'
import { Lock, Shield, CheckCircle } from 'lucide-react'
import Button from '../ui/Button'
import Container from '../layout/Container'
import Badge from '../ui/Badge'

export default function Hero() {
  const trustBadges = [
    { icon: Lock, text: 'HIPAA Compliant' },
    { icon: Shield, text: 'Bank-Level Encryption' },
    { icon: CheckCircle, text: 'No Data Stored' },
  ]

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-100/30 to-white py-20 sm:py-24 lg:py-32">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzBEOTQ4OCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />

      <Container className="relative">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-headline text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Your Medical Bill Probably Has{' '}
              <span className="text-primary-600">Errors.</span>
              <br />
              Let's Find Them.
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-lg leading-8 text-gray-700 sm:text-xl"
          >
            80% of medical bills contain mistakes—duplicate charges, upcoding, and inflated
            costs that could be costing you hundreds or thousands. BilluminateMD scans your
            bills in seconds and writes your appeal letter.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button to="/app" size="lg">
              Scan Your Bill Now — $49
            </Button>
            <Button to="/how-it-works" variant="ghost" size="lg">
              See How It Works →
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-8"
          >
            {trustBadges.map((badge, index) => (
              <Badge key={index} icon={badge.icon}>
                {badge.text}
              </Badge>
            ))}
          </motion.div>
        </div>
      </Container>
    </section>
  )
}
