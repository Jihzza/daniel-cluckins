// supabase/functions/stripe-webhooks/index.ts
// FINAL VERSION: This code is now fully aligned with the production database schema.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@11.1.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0';

// --- ARCHITECTURAL OVERVIEW ---
// This function is the single, unified endpoint for all incoming Stripe webhooks.
// Its primary responsibilities are:
// 1. SECURITY: Manually verify webhook signatures using the Web Crypto API, native to the Deno runtime.
// 2. ROUTING: Determine the event type and route the data to the correct logic.
// 3. FULFILLMENT: Update the database with the results of the Stripe event.
// 4. ACKNOWLEDGEMENT: Send a success response (200 OK) back to Stripe immediately.

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const stripeSigningSecret = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET');
if (!stripeSigningSecret) {
    throw new Error("FATAL: STRIPE_WEBHOOK_SIGNING_SECRET is not set.");
}

// --- THE DEFINITIVE FIX: Manual Signature Verification using Web Crypto API ---
// Helper function to convert an ArrayBuffer to a hexadecimal string.
function bufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

// This function manually reconstructs the signature verification process using native Deno APIs.
async function verifyStripeSignature(signatureHeader: string, body: string, secret: string): Promise<boolean> {
    const parts = signatureHeader.split(',');
    const timestamp = parts.find(part => part.startsWith('t='))?.split('=')[1];
    const stripeSignature = parts.find(part => part.startsWith('v1='))?.split('=')[1];

    if (!timestamp || !stripeSignature) {
        console.error("Signature header is missing timestamp or v1 signature part.");
        return false;
    }
    
    const signedPayload = `${timestamp}.${body}`;
    const encoder = new TextEncoder();

    // Import the signing secret as a cryptographic key.
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );

    // Generate the HMAC signature of the payload using the key.
    const signatureBuffer = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(signedPayload)
    );

    // Convert the generated signature to a hex string.
    const generatedSignature = bufferToHex(signatureBuffer);

    // Compare our generated signature with the one from Stripe.
    return generatedSignature === stripeSignature;
}


serve(async (req) => {
  console.log("--- New Webhook Event Received ---");

  const signature = req.headers.get('Stripe-Signature');
  if (!signature) {
    console.error("❌ Error: Request is missing 'Stripe-Signature' header.");
    return new Response("Missing signature", { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;

  try {
    // --- STEP 1: Verify Signature (Native Web Crypto API Method) ---
    console.log("Attempting to verify webhook signature using native Web Crypto API...");
    const isVerified = await verifyStripeSignature(signature, body, stripeSigningSecret);
    
    if (!isVerified) {
        throw new Error("Webhook signature is invalid.");
    }

    event = JSON.parse(body) as Stripe.Event;
    console.log("✅ Signature verified successfully. Event ID:", event.id);

  } catch (err) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // --- STEP 2: Handle the 'checkout.session.completed' Event ---
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata;

    console.log(`Processing 'checkout.session.completed' for session ${session.id}.`);

    if (!metadata || !metadata.serviceType || !metadata.userId) {
        console.error("❌ Error: Webhook metadata is missing required fields (serviceType, userId). Metadata received:", metadata);
        return new Response("Webhook Error: Missing required metadata", { status: 400 });
    }
    
    console.log("Metadata received:", metadata);

    try {
      // --- STEP 3: Fulfill the Order (Database Insertion) ---
      const { serviceType, userId } = metadata;
      console.log(`Service Type: '${serviceType}', User ID: '${userId}'`);

      if (serviceType === 'consultation') {
        console.log("Inserting into 'appointments' table...");
        
        // Combine date and time from metadata into a single ISO 8601 timestamp string.
        const appointmentStart = `${metadata.date}T${metadata.time}:00Z`;

        const { error } = await supabaseAdmin.from('appointments').insert({
          user_id: userId,
          // THE FINAL FIX: Aligning all column names with the user-provided SQL schema.
          appointment_start: appointmentStart,
          duration_minutes: parseInt(metadata.duration, 10),
          contact_name: metadata.name,
          contact_email: metadata.email,
          contact_phone: metadata.phone,
          status: 'Confirmed',
          stripe_payment_id: session.payment_intent as string,
        });
        if (error) throw new Error(`Database error inserting consultation: ${error.message}`);
        console.log(`✅ Successfully inserted consultation for user ${userId}.`);

      } else if (serviceType === 'coaching') {
        console.log("Inserting into 'subscriptions' table...");
        const { error } = await supabaseAdmin.from('subscriptions').insert({
          user_id: userId,
          plan_id: metadata.plan,
          status: 'active',
          stripe_subscription_id: session.subscription as string,
        });
        if (error) throw new Error(`Database error inserting coaching plan: ${error.message}`);
        console.log(`✅ Successfully inserted coaching plan for user ${userId}.`);
      
      } else {
        console.warn(`⚠️ Unhandled service type: ${serviceType}`);
      }

    } catch (dbError) {
      console.error('❌ Fulfillment Error:', dbError.message);
      return new Response(`Webhook handler failed during fulfillment: ${dbError.message}`, { status: 500 });
    }
  } else {
    console.log(`Received and acknowledged unhandled event type: ${event.type}`);
  }

  // --- STEP 4: Acknowledge Success ---
  console.log("--- Event processed successfully. Sending 200 OK to Stripe. ---");
  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
