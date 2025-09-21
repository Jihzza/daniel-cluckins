// netlify/functions/mcp-appointments.js
// Enhanced Netlify function to handle all MCP tools (appointments, subscriptions, pitch decks)

const { createClient } = require('@supabase/supabase-js');

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
    const { tool } = requestData;
    
    let result;
    
    switch (tool) {
      case 'schedule_appointment':
        result = await handleAppointment(requestData);
        break;
      case 'subscribe_coaching':
        result = await handleSubscription(requestData);
        break;
      case 'request_pitch_deck':
        result = await handlePitchDeck(requestData);
        break;
      default:
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': allowedOrigin,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            error: 'Invalid tool specified',
            validTools: ['schedule_appointment', 'subscribe_coaching', 'request_pitch_deck']
          }),
        };
    }
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('MCP function error:', error);
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

// Helper function to get Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// Handler for appointment scheduling
async function handleAppointment(appointmentData) {
  const supabase = getSupabaseClient();
  
  // Validate required fields
  const requiredFields = ['date', 'startTime', 'durationMinutes'];
  const missingFields = requiredFields.filter(field => !appointmentData[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Validate duration
  const allowedDurations = [45, 60, 75, 90, 105, 120];
  if (!allowedDurations.includes(appointmentData.durationMinutes)) {
    throw new Error(`Duration must be one of: ${allowedDurations.join(', ')} minutes`);
  }

  // Convert date and time to ISO string
  const appointmentStartIso = new Date(`${appointmentData.date}T${appointmentData.startTime}:00`).toISOString();
  
  const { data, error } = await supabase
    .from('appointments')
    .insert([{
      user_id: appointmentData.userId || null,
      duration_minutes: appointmentData.durationMinutes,
      contact_name: appointmentData.contactName || null,
      contact_email: appointmentData.contactEmail || null,
      contact_phone: appointmentData.contactPhone || null,
      status: appointmentData.status || 'Confirmed',
      stripe_payment_id: appointmentData.stripePaymentId || null,
      appointment_start: appointmentStartIso
    }])
    .select()
    .single();

  if (error) {
    throw new Error(`Supabase insert failed: ${error.message}`);
  }

  // Calculate price
  const hourlyRate = 90;
  const priceEUR = Math.round(hourlyRate * (appointmentData.durationMinutes / 60) * 100) / 100;

  const contactLine = 
    appointmentData.contactName || appointmentData.contactEmail || appointmentData.contactPhone
      ? ` Contact: ${appointmentData.contactName || ""}${appointmentData.contactName && appointmentData.contactEmail ? " · " : ""}${appointmentData.contactEmail || ""}${(appointmentData.contactName || appointmentData.contactEmail) && appointmentData.contactPhone ? " · " : ""}${appointmentData.contactPhone || ""}`
      : "";

  return {
    success: true,
    message: `Appointment booked for ${appointmentData.date} at ${appointmentData.startTime} for ${appointmentData.durationMinutes} minutes. Price: €${priceEUR.toFixed(2)}.${contactLine}`,
    appointmentId: data.id
  };
}

// Handler for coaching subscriptions
async function handleSubscription(subscriptionData) {
  const supabase = getSupabaseClient();
  
  // Validate required fields
  const requiredFields = ['userId', 'plan'];
  const missingFields = requiredFields.filter(field => !subscriptionData[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Validate plan
  const allowedPlans = ['basic', 'standard', 'premium'];
  if (!allowedPlans.includes(subscriptionData.plan)) {
    throw new Error(`Plan must be one of: ${allowedPlans.join(', ')}`);
  }

  const planPrices = {
    basic: 40,
    standard: 90,
    premium: 230
  };

  const { data, error } = await supabase
    .from('subscriptions')
    .insert([{
      user_id: subscriptionData.userId,
      plan_id: subscriptionData.plan,
      status: 'active',
      stripe_customer_id: subscriptionData.stripeCustomerId || null,
      stripe_payment_id: subscriptionData.stripePaymentId || null,
      stripe_subscription_id: subscriptionData.stripeSubscriptionId || null
    }])
    .select()
    .single();

  if (error) {
    throw new Error(`Supabase insert failed: ${error.message}`);
  }

  const priceEUR = planPrices[subscriptionData.plan];

  return {
    success: true,
    message: `Subscription created: ${subscriptionData.plan} (€${priceEUR}/mo) for user ${subscriptionData.userId}.`,
    subscriptionId: data.id
  };
}

// Handler for pitch deck requests
async function handlePitchDeck(pitchData) {
  const supabase = getSupabaseClient();
  
  // Validate required fields
  const requiredFields = ['project'];
  const missingFields = requiredFields.filter(field => !pitchData[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Validate project
  const allowedProjects = ['GalowClub', 'Perspectiv'];
  if (!allowedProjects.includes(pitchData.project)) {
    throw new Error(`Project must be one of: ${allowedProjects.join(', ')}`);
  }

  const { data, error } = await supabase
    .from('pitch_requests')
    .insert([{
      project: pitchData.project,
      user_id: pitchData.userId || null,
      name: pitchData.name || null,
      email: pitchData.email || null,
      phone: pitchData.phone || null,
      role: pitchData.role || null,
      status: 'submitted'
    }])
    .select()
    .single();

  if (error) {
    throw new Error(`Supabase insert failed: ${error.message}`);
  }

  return {
    success: true,
    message: `Pitch deck request recorded: ${pitchData.project}. We'll follow up by email if provided.`,
    requestId: data.id
  };
}
