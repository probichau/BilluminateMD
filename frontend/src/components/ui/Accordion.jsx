import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function AccordionItem({ question, answer, isOpen, onToggle }) {
  return (
    <div className="border-b border-gray-200">
      <button
        className="w-full flex items-center justify-between py-5 text-left hover:text-primary-600 transition-colors"
        onClick={onToggle}
      >
        <span className="text-lg font-semibold text-gray-900">{question}</span>
        <ChevronDown
          className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-5 text-gray-700 leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Accordion({ items }) {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <div className="divide-y divide-gray-200">
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          question={item.question}
          answer={item.answer}
          isOpen={openIndex === index}
          onToggle={() => setOpenIndex(openIndex === index ? null : index)}
        />
      ))}
    </div>
  )
}
