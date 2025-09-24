// netlify/functions/create-checkout-session.js
// Create Stripe checkout sessions for appointments and subscriptions

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil'
});

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

    // Sanitize returnTo paths (prevent open redirects)
    const sanitizePath = (path, fallback) => {
      if (typeof path !== 'string') return fallback;
      if (path.startsWith('http://') || path.startsWith('https://')) {
        try {
          const url = new URL(path);
          return (url.pathname + url.search + url.hash) || fallback;
        } catch (_) {
          return fallback;
        }
      }
      if (!path.startsWith('/') || path.startsWith('//')) return fallback;
      return path;
    };

    const defaultAppointmentSuccess = '/chat?payment=success&type=appointment';
    const defaultAppointmentCancel = '/chat?payment=cancelled&type=appointment';

    const defaultSubscriptionSuccess = (plan) => `/chat?payment=success&type=subscription&plan=${plan || 'basic'}`;
    const defaultSubscriptionCancel = '/chat?payment=cancelled&type=subscription';

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

  const successPath = sanitizePath(appointmentData.returnTo, defaultAppointmentSuccess);
  const cancelPath = sanitizePath(appointmentData.cancelReturnTo ?? appointmentData.returnTo, defaultAppointmentCancel);

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
    success_url: `${process.env.SITE_URL}${successPath}`,
    cancel_url: `${process.env.SITE_URL}${cancelPath}`,
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

  // Log resolved redirect URLs for troubleshooting (no sensitive data)
  try {
    console.log('[create-checkout-session] success_url:', `${process.env.SITE_URL}${successPath}`);
    console.log('[create-checkout-session] cancel_url:', `${process.env.SITE_URL}${cancelPath}`);
    console.log('[create-checkout-session] mode:', 'payment');
  } catch (_) {}

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

  const successPath = sanitizePath(subscriptionData.returnTo, defaultSubscriptionSuccess(subscriptionData.plan));
  const cancelPath = sanitizePath(subscriptionData.cancelReturnTo ?? subscriptionData.returnTo, defaultSubscriptionCancel);

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
    success_url: `${process.env.SITE_URL}${successPath}`,
    cancel_url: `${process.env.SITE_URL}${cancelPath}`,
    metadata: {
      type: 'subscription',
      userId: subscriptionData.userId,
      plan: subscriptionData.plan,
      name: subscriptionData.name,
      email: subscriptionData.email,
      phone: subscriptionData.phone
    }
  });

  // Log resolved redirect URLs for troubleshooting (no sensitive data)
  try {
    console.log('[create-checkout-session] success_url:', `${process.env.SITE_URL}${successPath}`);
    console.log('[create-checkout-session] cancel_url:', `${process.env.SITE_URL}${cancelPath}`);
    console.log('[create-checkout-session] mode:', 'subscription');
  } catch (_) {}

  return session;
}