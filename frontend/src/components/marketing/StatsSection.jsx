import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import Container from '../layout/Container'
import Section from '../layout/Section'
import Card from '../ui/Card'

function AnimatedNumber({ value, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      const duration = 2000
      const steps = 60
      const stepValue = parseInt(value) / steps
      let current = 0

      const timer = setInterval(() => {
        current += stepValue
        if (current >= parseInt(value)) {
          setCount(parseInt(value))
          clearInterval(timer)
        } else {
          setCount(Math.floor(current))
        }
      }, duration / steps)

      return () => clearInterval(timer)
    }
  }, [isInView, value])

  return (
    <span ref={ref} className="font-headline text-5xl font-bold text-primary-600">
      {count}
      {suffix}
    </span>
  )
}

export default function StatsSection() {
  const stats = [
    {
      value: '80',
      suffix: '%',
      label: 'of medical bills contain at least one error',
      source: 'Industry studies',
    },
    {
      value: '1200',
      suffix: '+',
      prefix: '$',
      label: 'Average cost of billing errors per patient',
      source: 'Medical billing advocates',
    },
    {
      value: '3',
      suffix: ' out of 4',
      label: 'people who dispute errors get them corrected',
      source: 'JAMA Health Forum, 2024',
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
            Medical Bills Are Designed to Confuse You
          </h2>
        </motion.div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card hover className="text-center h-full">
                <div className="mb-4">
                  {stat.prefix && (
                    <span className="font-headline text-5xl font-bold text-primary-600">
                      {stat.prefix}
                    </span>
                  )}
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-base font-medium text-gray-900 mb-2">{stat.label}</p>
                <p className="text-sm text-gray-500">Source: {stat.source}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <blockquote className="text-lg italic text-gray-700 border-l-4 border-primary-600 pl-6 py-2 inline-block">
            "I was charged $10,000 for a toiletry item that was supposed to cost 10 cents."
            <footer className="text-sm text-gray-500 mt-2">
              — Real billing error documented by auditors
            </footer>
          </blockquote>
        </motion.div>
      </Container>
    </Section>
  )
}
