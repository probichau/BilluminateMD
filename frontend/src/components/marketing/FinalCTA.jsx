import { motion } from 'framer-motion'
import { Lock, CreditCard, Zap } from 'lucide-react'
import Container from '../layout/Container'
import Section from '../layout/Section'
import Button from '../ui/Button'
import Badge from '../ui/Badge'

export default function FinalCTA() {
  const trustBadges = [
    { icon: Lock, text: 'Secure' },
    { icon: CreditCard, text: 'Money-Back Guarantee*' },
    { icon: Zap, text: 'Results in Minutes' },
  ]

  return (
    <Section bgColor="bg-gradient-trust">
      <Container>
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-headline text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Stop Overpaying for Medical Care
            </h2>
            <p className="mt-6 text-lg text-primary-100 max-w-2xl mx-auto">
              Join thousands of patients who've found errors in their bills and kept more
              money in their pockets.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10"
          >
            <Button
              to="/app"
              size="lg"
              className="bg-white text-primary-600 hover:bg-gray-50"
            >
              Scan Your Bill Now — $49
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-8"
          >
            {trustBadges.map((badge, index) => (
              <div key={index} className="text-white">
                <Badge icon={badge.icon} className="text-white">
                  {badge.text}
                </Badge>
              </div>
            ))}
          </motion.div>
        </div>
      </Container>
    </Section>
  )
}
