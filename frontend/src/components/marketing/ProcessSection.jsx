import { motion } from 'framer-motion'
import { Upload, Search, FileText } from 'lucide-react'
import Container from '../layout/Container'
import Section from '../layout/Section'
import Button from '../ui/Button'

export default function ProcessSection() {
  const steps = [
    {
      number: '1',
      icon: Upload,
      title: 'Upload Your Bill',
      description:
        'Snap a photo or upload your itemized bill and EOB. We support all formats.',
    },
    {
      number: '2',
      icon: Search,
      title: 'AI Scans for Errors',
      description:
        'Our system checks for unbundling, upcoding, duplicate charges, and inflated costs against Medicare rates.',
    },
    {
      number: '3',
      icon: FileText,
      title: 'Get Your Appeal Letter',
      description:
        'Download a professional appeal letter ready to send to your provider or insurance company.',
    },
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
            BilluminateMD: Your Personal Billing Advocate
          </h2>
        </motion.div>

        <div className="mt-16 relative">
          {/* Connecting line for desktop */}
          <div className="hidden lg:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-600 via-primary-600 to-primary-600 opacity-20" />

          <div className="grid gap-12 lg:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="relative"
                >
                  <div className="text-center">
                    {/* Step number circle */}
                    <div className="relative inline-flex items-center justify-center">
                      <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-trust text-white shadow-lg">
                        <Icon className="h-8 w-8" />
                      </div>
                      <div className="absolute inset-0 rounded-full bg-primary-600 opacity-10 blur-xl" />
                    </div>

                    {/* Step number badge */}
                    <div className="mt-4 inline-flex items-center justify-center">
                      <span className="font-headline text-sm font-bold text-primary-600">
                        STEP {step.number}
                      </span>
                    </div>

                    {/* Content */}
                    <h3 className="mt-4 font-headline text-xl font-bold text-gray-900">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-base text-gray-700 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow connector for desktop */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-16 -right-6 text-primary-600 opacity-30">
                      <svg
                        className="h-6 w-12"
                        fill="none"
                        viewBox="0 0 48 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M36 12H12m24 0l-6-6m6 6l-6 6"
                        />
                      </svg>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <Button to="/app" size="lg">
            Start Your Scan — $49
          </Button>
        </motion.div>
      </Container>
    </Section>
  )
}
