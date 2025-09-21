// src/services/mcpClient.js
// MCP Client for communicating with the appointments MCP server

import { paymentService } from './paymentService.js';

class MCPClient {
  constructor() {
    this.serverProcess = null;
    this.isConnected = false;
  }

  /**
   * Start the MCP server process
   */
  async startServer() {
    if (this.isConnected) return;

    try {
      // In a real implementation, you would spawn the MCP server process
      // For now, we'll create a mock implementation that calls the MCP server
      // via HTTP or WebSocket (depending on your deployment strategy)
      
      // For development, you might want to run the MCP server separately
      // and connect to it via HTTP/WebSocket
      console.log('Starting MCP server connection...');
      
      // This is a placeholder - in production, you'd implement the actual
      // MCP protocol communication here
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('Failed to start MCP server:', error);
      return false;
    }
  }

  /**
   * Schedule an appointment using the MCP server
   */
  async scheduleAppointment(appointmentData) {
    try {
      // Validate required fields
      const requiredFields = ['date', 'startTime', 'durationMinutes'];
      const missingFields = requiredFields.filter(field => !appointmentData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Validate duration is one of the allowed values
      const allowedDurations = [45, 60, 75, 90, 105, 120];
      if (!allowedDurations.includes(appointmentData.durationMinutes)) {
        throw new Error(`Duration must be one of: ${allowedDurations.join(', ')} minutes`);
      }

      // Call the Netlify function for MCP appointments
      try {
        const response = await fetch('/.netlify/functions/mcp-appointments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...appointmentData,
            tool: 'schedule_appointment'
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to schedule appointment');
        }

        const result = await response.json();
        return result;
      } catch (fetchError) {
        // Fallback: Direct Supabase call (for development/testing)
        return await this.scheduleAppointmentDirect(appointmentData);
      }
    } catch (error) {
      console.error('MCP Client: Error scheduling appointment:', error);
      throw error;
    }
  }

  /**
   * Schedule an appointment with payment
   */
  async scheduleAppointmentWithPayment(appointmentData) {
    try {
      // Calculate price
      const price = paymentService.calculateAppointmentPrice(appointmentData.durationMinutes);
      
      // Create Stripe checkout session (appointment will be created after payment)
      const sessionId = await paymentService.createAppointmentCheckout({
        ...appointmentData,
        appointmentId: 'pending' // Will be created after payment
      });
      
      // Redirect to Stripe checkout
      await paymentService.redirectToCheckout(sessionId);
      
      return {
        success: true,
        message: `Redirecting to payment (${paymentService.formatPrice(price)})...`,
        sessionId: sessionId
      };
    } catch (error) {
      console.error('MCP Client: Error scheduling appointment with payment:', error);
      throw error;
    }
  }

  /**
   * Subscribe to a coaching plan using the MCP server
   */
  async subscribeToCoaching(subscriptionData) {
    try {
      // Validate required fields
      const requiredFields = ['userId', 'plan'];
      const missingFields = requiredFields.filter(field => !subscriptionData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Validate plan is one of the allowed values
      const allowedPlans = ['basic', 'standard', 'premium'];
      if (!allowedPlans.includes(subscriptionData.plan)) {
        throw new Error(`Plan must be one of: ${allowedPlans.join(', ')}`);
      }

      // Call the Netlify function for MCP subscriptions
      try {
        const response = await fetch('/.netlify/functions/mcp-appointments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...subscriptionData,
            tool: 'subscribe_coaching'
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create subscription');
        }

        const result = await response.json();
        return result;
      } catch (fetchError) {
        // Fallback: Direct Supabase call
        return await this.subscribeToCoachingDirect(subscriptionData);
      }
    } catch (error) {
      console.error('MCP Client: Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * Subscribe to coaching with payment
   */
  async subscribeToCoachingWithPayment(subscriptionData) {
    try {
      // Calculate price
      const price = paymentService.getSubscriptionPrice(subscriptionData.plan);
      
      // Create Stripe checkout session (subscription will be created after payment)
      const sessionId = await paymentService.createSubscriptionCheckout(subscriptionData);
      
      // Redirect to Stripe checkout
      await paymentService.redirectToCheckout(sessionId);
      
      return {
        success: true,
        message: `Redirecting to payment for ${subscriptionData.plan} plan (${paymentService.formatPrice(price)}/month)...`,
        sessionId: sessionId
      };
    } catch (error) {
      console.error('MCP Client: Error creating subscription with payment:', error);
      throw error;
    }
  }

  /**
   * Request a pitch deck using the MCP server
   */
  async requestPitchDeck(pitchData) {
    try {
      // Validate required fields
      const requiredFields = ['project'];
      const missingFields = requiredFields.filter(field => !pitchData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Validate project is one of the allowed values
      const allowedProjects = ['GalowClub', 'Perspectiv'];
      if (!allowedProjects.includes(pitchData.project)) {
        throw new Error(`Project must be one of: ${allowedProjects.join(', ')}`);
      }

      // Call the Netlify function for MCP pitch requests
      try {
        const response = await fetch('/.netlify/functions/mcp-appointments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...pitchData,
            tool: 'request_pitch_deck'
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to request pitch deck');
        }

        const result = await response.json();
        return result;
      } catch (fetchError) {
        // Fallback: Direct Supabase call
        return await this.requestPitchDeckDirect(pitchData);
      }
    } catch (error) {
      console.error('MCP Client: Error requesting pitch deck:', error);
      throw error;
    }
  }

  /**
   * Create a Stripe checkout link for subscription payment
   */
  async createSubscriptionCheckoutLink(subscriptionData, priceEUR) {
    try {
      const baseUrl = window.location.origin;
      const productName = `${subscriptionData.plan.charAt(0).toUpperCase() + subscriptionData.plan.slice(1)} Coaching Plan`;
      const priceInCents = Math.round(priceEUR * 100);
      
      // Use the same Supabase Edge Function as the working forms
      const { supabase } = await import('../lib/supabaseClient.js');
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      if (!accessToken) {
        throw new Error('User is not authenticated.');
      }

      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`;
      
      // Format data the same way as the working form
      const formData = {
        serviceType: 'coaching',
        coaching: {
          plan: subscriptionData.plan
        },
        contactInfo: {
          name: subscriptionData.name || '',
          email: subscriptionData.email || '',
          phone: subscriptionData.phone || ''
        }
      };

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          formData,
          userId: subscriptionData.userId,
          userEmail: subscriptionData.email,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.error || 'Failed to create checkout session.');
      }

      const { url: checkoutUrl } = await response.json();
      if (!checkoutUrl) {
        throw new Error('Did not receive a checkout URL.');
      }
      
      console.log('🔍 MCP Client: Created real Stripe subscription checkout URL:', checkoutUrl);
      return checkoutUrl;
    } catch (error) {
      console.error('MCP Client: Error creating subscription checkout link:', error);
      throw error;
    }
  }

  /**
   * Create a Stripe checkout link for direct payment
   */
  async createCheckoutLink(appointmentData, priceEUR) {
    try {
      // Create a simple checkout link using Stripe's hosted checkout
      const baseUrl = window.location.origin;
      const checkoutData = {
        line_items: [{
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Consultation (${appointmentData.durationMinutes} minutes)`,
              description: `Appointment on ${appointmentData.date} at ${appointmentData.startTime}`,
            },
            unit_amount: Math.round(priceEUR * 100), // Convert to cents
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${baseUrl}/chatbot?payment=success&type=appointment&date=${appointmentData.date}&time=${appointmentData.startTime}&duration=${appointmentData.durationMinutes}`,
        cancel_url: `${baseUrl}/chatbot?payment=cancelled&type=appointment`,
        metadata: {
          userId: appointmentData.userId,
          appointmentData: JSON.stringify(appointmentData),
          type: 'appointment',
        },
      };

      // Use the same Supabase Edge Function as the working forms
      const { supabase } = await import('../lib/supabaseClient.js');
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      if (!accessToken) {
        throw new Error('User is not authenticated.');
      }

      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`;
      
      // Format data the same way as the working form
      const formData = {
        serviceType: 'consultation',
        consultation: {
          date: new Date(appointmentData.date),
          time: appointmentData.startTime,
          duration: appointmentData.durationMinutes
        },
        contactInfo: {
          name: appointmentData.contactName || '',
          email: appointmentData.contactEmail || '',
          phone: appointmentData.contactPhone || ''
        }
      };

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          formData,
          userId: appointmentData.userId,
          userEmail: appointmentData.contactEmail,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.error || 'Failed to create checkout session.');
      }

      const { url: checkoutUrl } = await response.json();
      if (!checkoutUrl) {
        throw new Error('Did not receive a checkout URL.');
      }
      
      console.log('🔍 MCP Client: Created real Stripe checkout URL:', checkoutUrl);
      return checkoutUrl;
    } catch (error) {
      console.error('MCP Client: Error creating checkout link:', error);
      throw error;
    }
  }

  /**
   * Direct Supabase fallback for appointment scheduling
   */
  async scheduleAppointmentDirect(appointmentData) {
    try {
      // Import the existing Supabase client
      const { supabase } = await import('../lib/supabaseClient.js');
      
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
        // For now, simulate successful booking without database insert
        // This allows the system to work while we fix RLS policies
        console.log('🔍 MCP Client: Simulating appointment booking (RLS bypass)');
        
        const contactLine = 
          appointmentData.contactName || appointmentData.contactEmail || appointmentData.contactPhone
            ? ` Contact: ${appointmentData.contactName || ""}${appointmentData.contactName && appointmentData.contactEmail ? " · " : ""}${appointmentData.contactEmail || ""}${(appointmentData.contactName || appointmentData.contactEmail) && appointmentData.contactPhone ? " · " : ""}${appointmentData.contactPhone || ""}`
            : "";

        // Calculate price
        const hourlyRate = 90;
        const priceEUR = Math.round(hourlyRate * (appointmentData.durationMinutes / 60) * 100) / 100;

        // Try to create a Stripe checkout session for direct payment
        try {
          const checkoutUrl = await this.createCheckoutLink(appointmentData, priceEUR);
        return {
          success: true,
          message: `✅ Perfect! I'll schedule your consultation for ${appointmentData.date} at ${appointmentData.startTime} for ${appointmentData.durationMinutes} minutes.${contactLine}\n\n💰 **Price: €${priceEUR.toFixed(2)}**\n\n💳 **Payment Required:**\n[🛒 Click here to complete payment and confirm your booking](${checkoutUrl})\n\n*This will redirect you to Stripe's secure checkout page.*`,
          appointmentId: 'pending-payment',
          checkoutUrl: checkoutUrl
        };
        } catch (checkoutError) {
          console.error('Checkout link creation failed:', checkoutError);
          return {
            success: true,
            message: `⚠️ SIMULATION MODE: Appointment would be booked for ${appointmentData.date} at ${appointmentData.startTime} for ${appointmentData.durationMinutes} minutes. Price: €${priceEUR.toFixed(2)}.${contactLine}\n\n💳 Payment required: To complete this booking, please set up Stripe payment integration or use the manual booking form.`,
            appointmentId: 'simulated-' + Date.now()
          };
        }
      }

      const contactLine = 
        appointmentData.contactName || appointmentData.contactEmail || appointmentData.contactPhone
          ? ` Contact: ${appointmentData.contactName || ""}${appointmentData.contactName && appointmentData.contactEmail ? " · " : ""}${appointmentData.contactEmail || ""}${(appointmentData.contactName || appointmentData.contactEmail) && appointmentData.contactPhone ? " · " : ""}${appointmentData.contactPhone || ""}`
          : "";

      // Calculate price
      const hourlyRate = 90;
      const priceEUR = Math.round(hourlyRate * (appointmentData.durationMinutes / 60) * 100) / 100;

      return {
        success: true,
        message: `Appointment booked for ${appointmentData.date} at ${appointmentData.startTime} for ${appointmentData.durationMinutes} minutes. Price: €${priceEUR.toFixed(2)}.${contactLine}`,
        appointmentId: data.id
      };
    } catch (error) {
      console.error('MCP Client: Direct Supabase fallback failed:', error);
      throw error;
    }
  }

  /**
   * Direct Supabase fallback for coaching subscription
   */
  async subscribeToCoachingDirect(subscriptionData) {
    try {
      // Import the existing Supabase client
      const { supabase } = await import('../lib/supabaseClient.js');
      
      const planPrices = {
        basic: 40,
        standard: 90,
        premium: 230
      };

      // Prepare data for insertion
      const insertData = {
        user_id: subscriptionData.userId,
        plan_id: subscriptionData.plan,
        status: 'active',
        stripe_customer_id: subscriptionData.stripeCustomerId || null,
        stripe_payment_id: subscriptionData.stripePaymentId || null,
        stripe_subscription_id: subscriptionData.stripeSubscriptionId || null
      };

      console.log('🔍 MCP Client: Inserting subscription data:', insertData);

      const { data, error } = await supabase
        .from('subscriptions')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        // For now, simulate successful subscription without database insert
        console.log('🔍 MCP Client: Simulating subscription creation (RLS bypass)');
        
        const priceEUR = planPrices[subscriptionData.plan];

        // Try to create a Stripe checkout link for direct payment
        try {
          const checkoutUrl = await this.createSubscriptionCheckoutLink(subscriptionData, priceEUR);
          return {
            success: true,
            message: `✅ Perfect! I'll set up your ${subscriptionData.plan} coaching subscription.${subscriptionData.name ? `\n\n👤 **Name:** ${subscriptionData.name}` : ''}${subscriptionData.email ? `\n📧 **Email:** ${subscriptionData.email}` : ''}\n\n💰 **Price: €${priceEUR}/month**\n\n💳 **Payment Required:**\n[🛒 Click here to complete payment and activate your subscription](${checkoutUrl})\n\n*This will redirect you to Stripe's secure checkout page.*`,
            subscriptionId: 'pending-payment',
            checkoutUrl: checkoutUrl
          };
        } catch (checkoutError) {
          console.error('Subscription checkout link creation failed:', checkoutError);
          return {
            success: true,
            message: `⚠️ SIMULATION MODE: Subscription would be created: ${subscriptionData.plan} (€${priceEUR}/mo) for user ${subscriptionData.userId}.\n\n💳 Payment required: To complete this subscription, please set up Stripe payment integration or use the manual subscription form.`,
            subscriptionId: 'simulated-' + Date.now()
          };
        }
      }

      const priceEUR = planPrices[subscriptionData.plan];

      return {
        success: true,
        message: `Subscription created: ${subscriptionData.plan} (€${priceEUR}/mo) for user ${subscriptionData.userId}.`,
        subscriptionId: data.id
      };
    } catch (error) {
      console.error('MCP Client: Direct Supabase subscription fallback failed:', error);
      throw error;
    }
  }

  /**
   * Direct Supabase fallback for pitch deck request
   */
  async requestPitchDeckDirect(pitchData) {
    try {
      // Import the existing Supabase client
      const { supabase } = await import('../lib/supabaseClient.js');
      
      // Prepare data for insertion, ensuring no null values for required fields
      const insertData = {
        project: pitchData.project,
        user_id: pitchData.userId || null,
        name: pitchData.name || 'Not provided',
        email: pitchData.email || 'Not provided',
        phone: pitchData.phone || 'Not provided', // Temporary workaround for NOT NULL constraint
        role: pitchData.role || 'Not provided',
        status: 'submitted'
      };

      console.log('🔍 MCP Client: Inserting pitch request data:', insertData);

      const { data, error } = await supabase
        .from('pitch_requests')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('🔍 MCP Client: Supabase error details:', error);
        throw new Error(`Supabase insert failed: ${error.message} (Code: ${error.code})`);
      }

      return {
        success: true,
        message: `Pitch deck request recorded: ${pitchData.project}. We'll follow up by email if provided.`,
        requestId: data.id
      };
    } catch (error) {
      console.error('MCP Client: Direct Supabase pitch request fallback failed:', error);
      throw error;
    }
  }

  /**
   * Parse natural language for appointment scheduling
   */
  parseAppointmentRequest(message) {
    
    // Enhanced regex patterns to extract appointment information
    const patterns = {
      // Date patterns - now includes relative dates
      date: /(?:on|for)\s+(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}-\d{1,2}-\d{4}|tomorrow|today|yesterday|next\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|this\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday))/i,
      
      // Time patterns - enhanced for 12h/24h and time ranges
      time: /(?:at|for)\s+(\d{1,2}:\d{2}|\d{1,2}\s*(?:am|pm)|from\s+\d{1,2}:\d{2}|\d{1,2}:\d{2}\s*until\s+\d{1,2}:\d{2}|\d{1,2}\s*(?:am|pm)\s*until\s+\d{1,2}\s*(?:am|pm))/i,
      
      // Duration patterns - now includes time ranges
      duration: /(?:for|lasting)\s+(\d+)\s*(?:minutes?|mins?|hours?|hrs?)|from\s+\d{1,2}:\d{2}\s*until\s+\d{1,2}:\d{2}|\d{1,2}:\d{2}\s*until\s+\d{1,2}:\d{2}|\d{1,2}\s*(?:am|pm)\s*until\s+\d{1,2}\s*(?:am|pm)/i,
      
      // Time range patterns - enhanced to handle "from X to Y" format
      timeRange: /(?:from\s+)?(\d{1,2}(?::\d{2})?[ap]m|\d{1,2}:\d{2})\s*(?:until|to|-)\s*(\d{1,2}(?::\d{2})?[ap]m|\d{1,2}:\d{2})/i,
      
      name: /(?:name|call me)\s+([a-zA-Z\s]+)/i,
      email: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
      phone: /(\+?[\d\s\-\(\)]{10,})/i
    };

    const extracted = {};
    
    // Helper function to convert relative dates to YYYY-MM-DD
    const parseRelativeDate = (dateStr) => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      
      switch (dateStr.toLowerCase()) {
        case 'today':
          return today.toISOString().split('T')[0];
        case 'tomorrow':
          return tomorrow.toISOString().split('T')[0];
        case 'yesterday':
          return yesterday.toISOString().split('T')[0];
        default:
          return null;
      }
    };
    
    // Helper function to convert 12h to 24h format
    const convertTo24Hour = (timeStr) => {
      const isPM = timeStr.toLowerCase().includes('pm');
      const isAM = timeStr.toLowerCase().includes('am');
      
      if (isPM || isAM) {
        // Remove am/pm and any spaces, then split by colon
        const timeOnly = timeStr.replace(/\s*(am|pm)/i, '').trim();
        const [hours, minutes] = timeOnly.split(':');
        let hour24 = parseInt(hours);
        
        if (isPM && hour24 !== 12) hour24 += 12;
        if (isAM && hour24 === 12) hour24 = 0;
        
        return `${hour24.toString().padStart(2, '0')}:${minutes || '00'}`;
      }
      
      return timeStr; // Already in 24h format
    };
    
    // Helper function to calculate duration from time range
    const calculateDurationFromRange = (startTime, endTime) => {
      const start = convertTo24Hour(startTime);
      const end = convertTo24Hour(endTime);
      
      const [startHour, startMin] = start.split(':').map(Number);
      const [endHour, endMin] = end.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      let duration = endMinutes - startMinutes;
      
      // Handle case where end time is on the next day (e.g., 23:00 to 01:00)
      if (duration < 0) {
        duration += 24 * 60; // Add 24 hours in minutes
      }
      
      // Ensure duration is positive
      if (duration <= 0) {
        console.warn('Invalid time range: end time must be after start time');
        return 60; // Default to 1 hour if calculation fails
      }
      
      return duration;
    };
    
    // Extract date
    const dateMatch = message.match(patterns.date);
    if (dateMatch) {
      let date = dateMatch[1];
      
      // Check if it's a relative date (tomorrow, today, etc.)
      const relativeDate = parseRelativeDate(date);
      if (relativeDate) {
        extracted.date = relativeDate;
      } else {
        // Convert various date formats to YYYY-MM-DD
        if (date.includes('/')) {
          const parts = date.split('/');
          if (parts[0].length === 4) {
            // YYYY/MM/DD
            extracted.date = date;
          } else {
            // MM/DD/YYYY or DD/MM/YYYY
            extracted.date = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
          }
        } else if (date.includes('-')) {
          const parts = date.split('-');
          if (parts[0].length === 4) {
            // YYYY-MM-DD
            extracted.date = date;
          } else {
            // MM-DD-YYYY or DD-MM-YYYY
            extracted.date = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
          }
        }
      }
    }

    // Check for time range first (e.g., "3pm until 4pm", "from 5pm to 6:15pm")
    const timeRangeMatch = message.match(patterns.timeRange);
    if (timeRangeMatch) {
      const [, startTime, endTime] = timeRangeMatch;
      extracted.startTime = convertTo24Hour(startTime);
      extracted.durationMinutes = calculateDurationFromRange(startTime, endTime);
    } else {
      // Extract single time
      const timeMatch = message.match(patterns.time);
      if (timeMatch) {
        let time = timeMatch[1];
        extracted.startTime = convertTo24Hour(time);
      }
    }

    // Extract duration (only if not already calculated from time range)
    if (!extracted.durationMinutes) {
      const durationMatch = message.match(patterns.duration);
      if (durationMatch) {
        let duration = parseInt(durationMatch[1]);
        const unit = message.match(/(?:minutes?|mins?|hours?|hrs?)/i)?.[0].toLowerCase();
        if (unit && (unit.includes('hour') || unit.includes('hr'))) {
          duration *= 60; // Convert hours to minutes
        }
        extracted.durationMinutes = duration;
      }
    }

    // Extract contact information
    const nameMatch = message.match(patterns.name);
    if (nameMatch) {
      extracted.contactName = nameMatch[1].trim();
    }

    const emailMatch = message.match(patterns.email);
    if (emailMatch) {
      extracted.contactEmail = emailMatch[1];
    }

    const phoneMatch = message.match(patterns.phone);
    if (phoneMatch) {
      extracted.contactPhone = phoneMatch[1];
    }

    return extracted;
  }

  /**
   * Check if a message contains appointment scheduling intent
   */
  isAppointmentRequest(message) {
    const appointmentKeywords = [
      'schedule', 'book', 'appointment', 'meeting', 'call',
      'consultation', 'session', 'available', 'time slot',
      'reserve', 'set up', 'arrange', 'organize',
      'tomorrow', 'today', 'next week', 'this week'
    ];
    
    // Exclude if it contains subscription-related terms
    const subscriptionTerms = ['coaching', 'subscription', 'subscribe', 'premium', 'basic', 'standard'];
    const lowerMessage = message.toLowerCase();
    
    if (subscriptionTerms.some(term => lowerMessage.includes(term))) {
      console.log('🔍 MCP Client: Subscription terms detected, skipping appointment detection');
      return false;
    }
    
    const matches = appointmentKeywords.filter(keyword => lowerMessage.includes(keyword));
    console.log('🔍 MCP Client: Appointment keywords found:', matches);
    return matches.length > 0;
  }

  /**
   * Check if a message contains coaching subscription intent
   */
  isSubscriptionRequest(message) {
    const subscriptionKeywords = [
      'subscribe', 'subscription', 'coaching', 'plan', 'monthly',
      'basic', 'standard', 'premium', 'coaching plan', 'membership',
      'want to', 'would like to', 'sign up', 'join'
    ];
    
    const lowerMessage = message.toLowerCase();
    
    // Check for specific patterns that indicate subscription intent
    const subscriptionPatterns = [
      /subscribe.*coaching/i,
      /coaching.*plan/i,
      /want.*subscribe/i,
      /would like.*subscribe/i,
      /sign up.*coaching/i,
      /join.*coaching/i,
      /premium.*coaching/i,
      /basic.*coaching/i,
      /standard.*coaching/i
    ];
    
    const hasPattern = subscriptionPatterns.some(pattern => pattern.test(message));
    const matches = subscriptionKeywords.filter(keyword => lowerMessage.includes(keyword));
    
    console.log('🔍 MCP Client: Subscription keywords found:', matches);
    console.log('🔍 MCP Client: Subscription patterns matched:', hasPattern);
    
    return hasPattern || matches.length > 0;
  }

  /**
   * Check if a message contains pitch deck request intent
   */
  isPitchDeckRequest(message) {
    const pitchKeywords = [
      'pitch deck', 'pitchdeck', 'galowclub', 'perspectiv',
      'presentation', 'deck', 'pitch', 'investor', 'funding'
    ];
    
    const lowerMessage = message.toLowerCase();
    
    // Check for specific patterns that indicate pitch deck intent
    const pitchPatterns = [
      /pitch deck/i,
      /pitchdeck/i,
      /galowclub/i,
      /perspectiv/i,
      /request.*pitch/i,
      /want.*pitch/i,
      /would like.*pitch/i,
      /get.*pitch/i
    ];
    
    const hasPattern = pitchPatterns.some(pattern => pattern.test(message));
    const matches = pitchKeywords.filter(keyword => lowerMessage.includes(keyword));
    
    console.log('🔍 MCP Client: Pitch deck keywords found:', matches);
    console.log('🔍 MCP Client: Pitch deck patterns matched:', hasPattern);
    
    return hasPattern || matches.length > 0;
  }

  /**
   * Parse subscription request from natural language
   */
  parseSubscriptionRequest(message) {
    console.log('🔍 MCP Client: Parsing subscription request:', message);
    
    const planMatch = message.match(/\b(basic|standard|premium)\b/i);
    const plan = planMatch ? planMatch[1].toLowerCase() : null;
    
    const contactInfo = this.extractContactInfo(message);
    console.log('🔍 MCP Client: Extracted plan:', plan);
    console.log('🔍 MCP Client: Extracted contact info:', contactInfo);

    return {
      plan,
      // Extract contact info if provided
      name: contactInfo.name,
      email: contactInfo.email,
      phone: contactInfo.phone
    };
  }

  /**
   * Parse pitch deck request from natural language
   */
  parsePitchDeckRequest(message) {
    console.log('🔍 MCP Client: Parsing pitch deck request:', message);
    
    const projectMatch = message.match(/\b(galowclub|perspectiv)\b/i);
    const project = projectMatch ? projectMatch[1].charAt(0).toUpperCase() + projectMatch[1].slice(1) : null;
    
    const contactInfo = this.extractContactInfo(message);
    const role = this.extractRole(message);
    
    console.log('🔍 MCP Client: Extracted project:', project);
    console.log('🔍 MCP Client: Extracted contact info:', contactInfo);
    console.log('🔍 MCP Client: Extracted role:', role);

    return {
      project,
      // Extract contact info if provided
      name: contactInfo.name,
      email: contactInfo.email,
      phone: contactInfo.phone,
      role: role
    };
  }

  /**
   * Extract contact information from message
   */
  extractContactInfo(message) {
    const patterns = {
      name: /(?:name|call me|i'm)\s+([a-zA-Z\s]+)/i,
      email: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
      phone: /(\+?[\d\s\-\(\)]{10,})/i
    };

    return {
      name: message.match(patterns.name)?.[1]?.trim() || null,
      email: message.match(patterns.email)?.[1] || null,
      phone: message.match(patterns.phone)?.[1] || null
    };
  }

  /**
   * Extract role/title from message
   */
  extractRole(message) {
    const roleMatch = message.match(/(?:role|title|position|i'm a|i am a)\s+([a-zA-Z\s]+)/i);
    return roleMatch ? roleMatch[1].trim() : null;
  }

  /**
   * Stop the MCP server
   */
  async stopServer() {
    if (this.serverProcess) {
      this.serverProcess.kill();
      this.serverProcess = null;
    }
    this.isConnected = false;
  }
}

// Export a singleton instance
export const mcpClient = new MCPClient();
export default mcpClient;
