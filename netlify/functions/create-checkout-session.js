// netlify/functions/create-checkout-session.js
// Create Stripe checkout sessions for appointments and subscriptions

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const allowedOrigin = event.headers.origin || '*';

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
      },
      body: 'Method Not Allowed',
    };
  }

  try {
    const requestData = JSON.parse(event.body);
    const { type } = requestData;

    let session;

    if (type === 'appointment') {
      session = await createAppointmentCheckout(requestData);
    } else if (type === 'subscription') {
      session = await createSubscriptionCheckout(requestData);
    } else {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': allowedOrigin,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: 'Invalid type specified',
          validTypes: ['appointment', 'subscription']
        }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: session.id
      }),
    };
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }),
    };
  }
};

async function createAppointmentCheckout(appointmentData) {
  const hourlyRate = 90; // €90/hour
  const price = Math.round(hourlyRate * (appointmentData.durationMinutes / 60) * 100) / 100;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Consultation (${appointmentData.durationMinutes} minutes)`,
            description: `Appointment on ${appointmentData.date} at ${appointmentData.startTime}`,
          },
          unit_amount: Math.round(price * 100), // Convert to cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.SITE_URL}/chatbot?payment=success&type=appointment&id=${appointmentData.appointmentId || 'pending'}`,
    cancel_url: `${process.env.SITE_URL}/chatbot?payment=cancelled&type=appointment`,
    metadata: {
      type: 'appointment',
      userId: appointmentData.userId,
      appointmentId: appointmentData.appointmentId || 'pending',
      durationMinutes: appointmentData.durationMinutes,
      date: appointmentData.date,
      startTime: appointmentData.startTime,
      contactName: appointmentData.contactName,
      contactEmail: appointmentData.contactEmail,
      contactPhone: appointmentData.contactPhone
    }
  });

  return session;
}

async function createSubscriptionCheckout(subscriptionData) {
  const planPrices = {
    basic: 40,
    standard: 90,
    premium: 230
  };

  const price = planPrices[subscriptionData.plan];
  const planNames = {
    basic: 'Basic Coaching Plan',
    standard: 'Standard Coaching Plan',
    premium: 'Premium Coaching Plan'
  };

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: planNames[subscriptionData.plan],
            description: `Monthly coaching subscription - ${subscriptionData.plan} plan`,
          },
          unit_amount: Math.round(price * 100), // Convert to cents
          recurring: {
            interval: 'month',
          },
        },
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.SITE_URL}/chatbot?payment=success&type=subscription&plan=${subscriptionData.plan}`,
    cancel_url: `${process.env.SITE_URL}/chatbot?payment=cancelled&type=subscription`,
    metadata: {
      type: 'subscription',
      userId: subscriptionData.userId,
      plan: subscriptionData.plan,
      name: subscriptionData.name,
      email: subscriptionData.email,
      phone: subscriptionData.phone
    }
  });

  return session;
}