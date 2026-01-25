import Stripe from 'stripe'

let stripe = null

/**
 * Get or create Stripe client instance
 * Lazy initialization ensures environment variables are loaded first
 */
function getStripeClient() {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set')
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  }
  return stripe
}

export async function createPaymentIntent(req, res) {
  try {
    const { auditId } = req.body

    if (!auditId) {
      return res.status(400).json({ error: 'Audit ID required' })
    }

    // Fixed price: $49.00 per bill (in cents)
    const amount = 4900

    // Create payment intent
    const stripeClient = getStripeClient()
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      metadata: {
        auditId,
        paymentType: 'one_time',
      },
    })

    res.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    res.status(500).json({
      error: 'Failed to create payment intent',
      details: error.message,
    })
  }
}

export async function handleWebhook(req, res) {
  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event

  try {
    const stripeClient = getStripeClient()
    event = stripeClient.webhooks.constructEvent(req.body, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object
      console.log(`Payment succeeded for audit: ${paymentIntent.metadata.auditId}`)
      // Additional processing can be done here
      break
    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  res.json({ received: true })
}
