import { motion } from 'framer-motion'
import { Lock, Database, Shield, UserX } from 'lucide-react'
import { Link } from 'react-router-dom'
import Container from '../layout/Container'
import Section from '../layout/Section'
import Card from '../ui/Card'

export default function SecuritySection() {
  const features = [
    {
      icon: Lock,
      title: 'End-to-End Encryption',
      description:
        'Your bills are encrypted in transit and at rest using AES-256 encryption.',
    },
    {
      icon: Database,
      title: 'We Don\'t Store Your Data',
      description:
        'Bills are processed and immediately deleted. We keep nothing.',
    },
    {
      icon: Shield,
      title: 'HIPAA-Aligned Practices',
      description:
        'Built with healthcare compliance standards from day one.',
    },
    {
      icon: UserX,
      title: 'No Third-Party Sharing',
      description:
        'Your information is never sold, shared, or used for advertising.',
    },
  ]

  return (
    <Section bgColor="bg-gradient-to-br from-primary-600 to-accent-600 text-white">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="font-headline text-3xl font-bold sm:text-4xl">
            Your Privacy Is Non-Negotiable
          </h2>
          <p className="mt-4 text-lg text-primary-100">
            We built BilluminateMD with the same security standards used by hospitals
            and financial institutions
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-white/10 backdrop-blur-sm mb-4">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-headline text-lg font-bold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-primary-100 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Link
            to="/privacy"
            className="inline-flex items-center text-sm font-medium text-white hover:text-primary-100 transition-colors"
          >
            Read our full Privacy Policy →
          </Link>
        </motion.div>
      </Container>
    </Section>
  )
}
