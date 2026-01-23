import { useState } from 'react'
import { motion } from 'framer-motion'
import { Package, TrendingUp, Copy, DollarSign, XCircle, AlertTriangle } from 'lucide-react'
import Container from '../layout/Container'
import Section from '../layout/Section'
import Card from '../ui/Card'

export default function ErrorTypesSection() {
  const [activeTab, setActiveTab] = useState(0)

  const errorTypes = [
    {
      icon: Package,
      title: 'Unbundling Violations',
      description:
        'When procedures that should be billed together are split into separate charges to inflate the total. We cross-reference NCCI bundling rules automatically.',
    },
    {
      icon: TrendingUp,
      title: 'Upcoding',
      description:
        'When you\'re billed for a more expensive procedure than what was actually performed. We compare your charges against the documented services.',
    },
    {
      icon: Copy,
      title: 'Duplicate Charges',
      description:
        'The same service billed twice—happens more often than you\'d think, especially with multiple providers.',
    },
    {
      icon: DollarSign,
      title: 'Inflated Costs',
      description:
        'We compare your charges against Medicare rates and regional averages to identify extreme markups.',
    },
    {
      icon: XCircle,
      title: 'Services Not Rendered',
      description:
        'Charges for services, supplies, or medications you never actually received.',
    },
    {
      icon: AlertTriangle,
      title: 'Incorrect Patient Information',
      description:
        'Typos and errors that cause claim denials and make you responsible for the full amount.',
    },
  ]

  return (
    <Section bgColor="bg-gray-50">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="font-headline text-3xl font-bold text-gray-900 sm:text-4xl">
            Errors We Catch That Others Miss
          </h2>
          <p className="mt-4 text-lg text-gray-700">
            Our AI is trained to detect the most common and costly billing mistakes
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {errorTypes.map((error, index) => {
            const Icon = error.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card hover className="h-full">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                        <Icon className="h-6 w-6 text-primary-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-headline text-lg font-bold text-gray-900">
                        {error.title}
                      </h3>
                      <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                        {error.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}
