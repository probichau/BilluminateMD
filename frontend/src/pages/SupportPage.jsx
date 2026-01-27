import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Mail, CheckCircle, AlertCircle } from 'lucide-react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import Container from '../components/layout/Container'
import Section from '../components/layout/Section'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { API_URL } from '../config'

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Technical Problem',
    auditId: '',
    priority: 'Medium',
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [incidentNumber, setIncidentNumber] = useState('')
  const [error, setError] = useState('')

  const subjectOptions = [
    'Technical Problem',
    'Billing Issue',
    'Feature Request',
    'Question About Results',
    'Other',
  ]

  const priorityOptions = ['Low', 'Medium', 'High']

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch(`${API_URL}/api/support/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit support ticket')
      }

      setIncidentNumber(data.incidentNumber)
      setSuccess(true)
      setFormData({
        name: '',
        email: '',
        subject: 'Technical Problem',
        auditId: '',
        priority: 'Medium',
        description: '',
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Contact Support | BilluminateMD</title>
        <meta
          name="description"
          content="Get help with BilluminateMD. Contact our support team for technical issues, billing questions, or feature requests."
        />
      </Helmet>

      <div className="min-h-screen bg-white">
        <Header />
        <main>
          <Section bgColor="bg-gradient-to-b from-primary-100/30 to-white">
            <Container>
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-trust rounded-full mb-6">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <h1 className="font-headline text-4xl font-bold text-gray-900 sm:text-5xl mb-4">
                  Contact Support
                </h1>
                <p className="text-lg text-gray-700">
                  We're here to help! Submit your question or issue and we'll get back to you
                  within 24 hours.
                </p>
              </div>
            </Container>
          </Section>

          <Section bgColor="bg-white">
            <Container>
              <div className="max-w-2xl mx-auto">
                {/* Success Message */}
                {success && (
                  <Card className="mb-8 border-2 border-accent-500">
                    <div className="flex items-start gap-4">
                      <CheckCircle className="h-6 w-6 text-accent-500 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-headline text-lg font-bold text-gray-900 mb-2">
                          Ticket Submitted Successfully!
                        </h3>
                        <p className="text-gray-700 mb-3">
                          Your support ticket has been received. We've sent a confirmation email
                          to {formData.email || 'your email address'}.
                        </p>
                        <div className="bg-gray-50 border-l-4 border-primary-600 p-4 rounded">
                          <p className="text-sm text-gray-700">
                            <strong>Your Incident Number:</strong>
                          </p>
                          <p className="text-2xl font-headline font-bold text-primary-600 mt-1">
                            {incidentNumber}
                          </p>
                          <p className="text-xs text-gray-600 mt-2">
                            Reference this number in any follow-up communication
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Error Message */}
                {error && (
                  <Card className="mb-8 border-2 border-error-500">
                    <div className="flex items-start gap-4">
                      <AlertCircle className="h-6 w-6 text-error-500 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-headline text-lg font-bold text-gray-900 mb-2">
                          Submission Failed
                        </h3>
                        <p className="text-gray-700">{error}</p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Support Form */}
                <Card>
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                      {/* Name */}
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-900 mb-2"
                        >
                          Your Name <span className="text-error-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent transition"
                          placeholder="John Doe"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-900 mb-2"
                        >
                          Email Address <span className="text-error-500">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent transition"
                          placeholder="john@example.com"
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          We'll send a confirmation and updates to this address
                        </p>
                      </div>

                      {/* Subject */}
                      <div>
                        <label
                          htmlFor="subject"
                          className="block text-sm font-medium text-gray-900 mb-2"
                        >
                          Subject <span className="text-error-500">*</span>
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent transition"
                        >
                          {subjectOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Audit ID (Optional) */}
                      <div>
                        <label
                          htmlFor="auditId"
                          className="block text-sm font-medium text-gray-900 mb-2"
                        >
                          Audit ID <span className="text-gray-500">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          id="auditId"
                          name="auditId"
                          value={formData.auditId}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent transition"
                          placeholder="e.g., 12345abc"
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          If your issue relates to a specific bill audit, include the audit ID
                        </p>
                      </div>

                      {/* Priority */}
                      <div>
                        <label
                          htmlFor="priority"
                          className="block text-sm font-medium text-gray-900 mb-2"
                        >
                          Priority
                        </label>
                        <div className="flex gap-4">
                          {priorityOptions.map((option) => (
                            <label
                              key={option}
                              className="flex items-center cursor-pointer"
                            >
                              <input
                                type="radio"
                                name="priority"
                                value={option}
                                checked={formData.priority === option}
                                onChange={handleChange}
                                className="w-4 h-4 text-primary-600 focus:ring-primary-600"
                              />
                              <span className="ml-2 text-sm text-gray-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label
                          htmlFor="description"
                          className="block text-sm font-medium text-gray-900 mb-2"
                        >
                          Description <span className="text-error-500">*</span>
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          required
                          rows={6}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent transition resize-none"
                          placeholder="Please describe your issue or question in detail..."
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          Include any error messages, steps to reproduce, or relevant details
                        </p>
                      </div>

                      {/* Submit Button */}
                      <div>
                        <Button
                          type="submit"
                          size="lg"
                          className="w-full"
                          disabled={loading}
                        >
                          {loading ? 'Submitting...' : 'Submit Support Ticket'}
                        </Button>
                      </div>
                    </div>
                  </form>
                </Card>

                {/* Help Text */}
                <div className="mt-8 space-y-6">
                  <div className="text-center text-sm text-gray-600">
                    <p>
                      Need immediate assistance? Email us directly at{' '}
                      <a
                        href="mailto:support@billuminate.com"
                        className="text-primary-600 hover:underline font-medium"
                      >
                        support@billuminate.com
                      </a>
                    </p>
                  </div>

                  {/* LinkedIn Section */}
                  <Card className="max-w-md mx-auto">
                    <div className="text-center">
                      <a
                        href="https://www.linkedin.com/in/probichau/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium mb-3"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        LinkedIn
                      </a>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        I don't accept cold connection requests from people I've not met, but feel free to reach out and explain why we should consider not being strangers. I'm always open to a compelling request.
                      </p>
                    </div>
                  </Card>
                </div>
              </div>
            </Container>
          </Section>
        </main>
        <Footer />
      </div>
    </>
  )
}
