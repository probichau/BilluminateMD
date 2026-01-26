import { motion } from 'framer-motion'
import { Award, Shield, GraduationCap, Building2 } from 'lucide-react'
import Container from '../layout/Container'
import Section from '../layout/Section'
import Card from '../ui/Card'

export default function FounderSection() {
  const credentials = [
    {
      icon: Building2,
      text: 'Author and expert in Healthcare Information Privacy and Security',
    },
    {
      icon: Shield,
      text: 'Certified Information Systems Security Professional (CISSP)',
    },
    {
      icon: Shield,
      text: 'Certified Chief Information Security Officer (C|CISO)',
    },
    {
      icon: GraduationCap,
      text: 'Software as Medical Device (SaMD) expertise',
    },
    {
      icon: Shield,
      text: 'HIPAA/HITRUST compliance specialist',
    },
    {
      icon: Award,
      text: '2023 CISO Hall of Fame',
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
            Built by a Health TechPrivacy and Security Expert
          </h2>
        </motion.div>

        <div className="mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="max-w-4xl mx-auto">
              <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
                {/* Founder photo placeholder */}
                <div className="flex justify-center lg:justify-start">
                  <div className="h-48 w-48 rounded-lg bg-gradient-trust flex items-center justify-center text-white font-headline text-6xl font-bold">
                    PR
                  </div>
                </div>

                {/* Founder bio */}
                <div>
                  <h3 className="font-headline text-2xl font-bold text-gray-900">
                    <a
                      href="https://robichau.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary-600 transition-colors"
                    >
                      Peter Robichau
                    </a>
                  </h3>
                  <p className="mt-1 text-base font-medium text-primary-600">
                    Tech Leader: Healthcare AI Industry
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    CISSP | CISO Hall of Fame
                  </p>

                  <blockquote className="mt-6 text-base text-gray-700 leading-relaxed border-l-4 border-primary-600 pl-4 italic">
                    "After 20+ years protecting healthcare data at leading healthcare
                    institutions, I saw how much effort went into ensuring that healthcare
                    providers could bill as much as possible as efficiently as possible. 
                    80% of medical bills contain errors, but what do you do?
                    Patients need an advocate, and BilluminateMD is yours."
                  </blockquote>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Credentials grid */}
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            {credentials.map((credential, index) => {
              const Icon = credential.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg"
                >
                  <Icon className="h-5 w-5 text-primary-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-900">
                    {credential.text}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>
      </Container>
    </Section>
  )
}
