// supabase/functions/create-checkout-session/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@11.1.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { formData, userId } = await req.json();
    const { serviceType, consultation, coaching } = formData;

    let sessionParams: Stripe.Checkout.SessionCreateParams;
    const siteUrl = Deno.env.get('SITE_URL')!;
    if (!siteUrl) throw new Error("SITE_URL environment variable is not set.");

    // --- ARCHITECTURAL FIX: Differentiate between Payment and Subscription ---
    if (serviceType === 'consultation' && consultation?.duration) {
      const pricePerHour = 90;
      const totalAmount = (parseInt(consultation.duration, 10) / 60) * pricePerHour;
      
      sessionParams = {
        mode: 'payment', // This is a one-time payment
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'eur',
            product_data: { name: `Consultation (${consultation.duration} minutes)` },
            unit_amount: Math.round(totalAmount * 100),
          },
          quantity: 1,
        }],
        metadata: { userId, serviceType, ...consultation, ...formData.contactInfo },
        success_url: `${siteUrl}/success`,
        cancel_url: `${siteUrl}/scheduling?payment_status=cancelled`,
      };

    } else if (serviceType === 'coaching' && coaching?.plan) {
      const prices = { basic: 4000, standard: 9000, premium: 23000 }; // Prices in cents
      if (!prices[coaching.plan]) throw new Error("Invalid coaching plan.");
      
      sessionParams = {
        mode: 'subscription', // This tells Stripe to create a recurring subscription
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'eur',
            product_data: { name: `Coaching Plan: ${coaching.plan.charAt(0).toUpperCase() + coaching.plan.slice(1)}` },
            unit_amount: prices[coaching.plan],
            recurring: { interval: 'month' }, // This makes it a subscription
          },
          quantity: 1,
        }],
        metadata: { userId, serviceType, ...coaching, ...formData.contactInfo },
        success_url: `${siteUrl}/success`,
        cancel_url: `${siteUrl}/scheduling?payment_status=cancelled`,
      };

    } else {
      return new Response(JSON.stringify({ error: "Invalid service type or missing details." }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Create Checkout Session Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
