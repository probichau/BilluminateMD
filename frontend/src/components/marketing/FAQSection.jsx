import { motion } from 'framer-motion'
import Container from '../layout/Container'
import Section from '../layout/Section'
import Accordion from '../ui/Accordion'

export default function FAQSection() {
  const faqs = [
    {
      question: 'Is my medical information safe?',
      answer:
        'Yes. We use bank-level encryption, don\'t store your bills after processing, and never share your data with third parties. Our founder is a certified healthcare security professional with 20+ years of experience protecting patient data.',
    },
    {
      question: 'What types of bills can I upload?',
      answer:
        'We support itemized hospital bills, physician bills, Explanation of Benefits (EOB) statements, and most medical billing documents. For best results, upload the itemized version rather than a summary statement.',
    },
    {
      question: 'How long does the scan take?',
      answer:
        'Most scans complete in under 2 minutes. Complex bills with many line items may take slightly longer.',
    },
    {
      question: 'What if no errors are found?',
      answer:
        'If we don\'t find any billing errors, you\'ll receive a report confirming your bill appears accurate. Unfortunately, we cannot offer refunds for accurate bills, as the analysis work has been completed.',
    },
    {
      question: 'Do you actually send the appeal letter for me?',
      answer:
        'Currently, we generate a professional appeal letter that you download, print, and mail yourself. This gives you full control over the process and timing.',
    },
    {
      question: 'What\'s the difference between you and a billing advocate?',
      answer:
        'Traditional billing advocates charge 25-50% of whatever they save you—on a $5,000 error, that\'s $1,250-$2,500. We charge a flat $49 regardless of how much we find. You keep your savings.',
    },
    {
      question: 'Can I use this for old bills?',
      answer:
        'Yes, though we recommend reviewing bills within 60-120 days of receipt, as that\'s typically the window for filing appeals. Older bills may still be worth reviewing if you\'re being sent to collections.',
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
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-gray-700">
            Everything you need to know about BilluminateMD
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16 max-w-3xl mx-auto"
        >
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <Accordion items={faqs} />
          </div>
        </motion.div>
      </Container>
    </Section>
  )
}
