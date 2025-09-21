// netlify/functions/stripe-webhook.js
// Handle Stripe webhooks to create appointments/subscriptions after payment

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  const sig = event.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return {
      statusCode: 400,
      body: 'Webhook signature verification failed'
    };
  }

  try {
    // Handle the event
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(stripeEvent.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handleSubscriptionPaymentSucceeded(stripeEvent.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      body: 'Webhook processed successfully'
    };
  } catch (error) {
    console.error('Webhook processing error:', error);
    return {
      statusCode: 500,
      body: 'Webhook processing failed'
    };
  }
};

async function handleCheckoutCompleted(session) {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { type, userId, appointmentId, plan } = session.metadata;

  if (type === 'appointment') {
    // Create appointment after successful payment
    const { data, error } = await supabase
      .from('appointments')
      .insert([{
        user_id: userId,
        duration_minutes: parseInt(session.metadata.durationMinutes),
        contact_name: session.metadata.contactName,
        contact_email: session.metadata.contactEmail,
        contact_phone: session.metadata.contactPhone,
        status: 'Confirmed',
        stripe_payment_id: session.payment_intent,
        appointment_start: new Date(`${session.metadata.date}T${session.metadata.startTime}:00`).toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Failed to create appointment:', error);
      throw error;
    }

    console.log('Appointment created:', data.id);
  } else if (type === 'subscription') {
    // Create subscription after successful payment
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([{
        user_id: userId,
        plan_id: plan,
        status: 'active',
        stripe_customer_id: session.customer,
        stripe_payment_id: session.payment_intent,
        stripe_subscription_id: session.subscription
      }])
      .select()
      .single();

    if (error) {
      console.error('Failed to create subscription:', error);
      throw error;
    }

    console.log('Subscription created:', data.id);
  }
}

async function handleSubscriptionPaymentSucceeded(invoice) {
  // Handle recurring subscription payments
  console.log('Subscription payment succeeded:', invoice.subscription);
}
