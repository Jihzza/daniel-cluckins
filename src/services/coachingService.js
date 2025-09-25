// src/services/coachingService.js
// Coaching subscription service extracted from MCP Client

import { paymentService } from './paymentService.js';

class CoachingService {
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
      console.error('Coaching Service: Error creating subscription:', error);
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
      const { sessionId, url } = await paymentService.createSubscriptionCheckout(subscriptionData);
      
      // Prefer sending a clickable link in chat; UI can still navigate
      const linkText = `🛒 Click here to complete payment and activate your subscription`;
      const link = url || '';
      const message = url
        ? `💰 **Price: ${paymentService.formatPrice(price)}/month**\n\n💳 **Payment Required:**\n[${linkText}](${link})\n\n*This will redirect you to Stripe's secure checkout page.*`
        : `Redirecting to payment for ${subscriptionData.plan} plan (${paymentService.formatPrice(price)}/month)...`;
      
      return {
        success: true,
        message,
        sessionId: sessionId,
        checkoutUrl: url || null
      };
    } catch (error) {
      console.error('Coaching Service: Error creating subscription with payment:', error);
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

      // Always try to create a checkout link first
      const priceEUR = planPrices[subscriptionData.plan];
      
      console.log('🔍 Coaching Service: Attempting to create subscription checkout link...');
      console.log('🔍 Coaching Service: Subscription data:', subscriptionData);
      console.log('🔍 Coaching Service: Price:', priceEUR);
      
      try {
        const checkoutUrl = await this.createSubscriptionCheckoutLink(subscriptionData, priceEUR);
        console.log('🔍 Coaching Service: Checkout URL created successfully:', checkoutUrl);
        
        return {
          success: true,
          message: `✅ Perfect! I'll set up your ${subscriptionData.plan} coaching subscription.${subscriptionData.name ? `\n\n👤 **Name:** ${subscriptionData.name}` : ''}${subscriptionData.email ? `\n📧 **Email:** ${subscriptionData.email}` : ''}\n\n💰 **Price: €${priceEUR}/month**\n\n💳 **Payment Required:**\n[🛒 Click here to complete payment and activate your subscription](${checkoutUrl})\n\n*This will redirect you to Stripe's secure checkout page.*`,
          subscriptionId: 'pending-payment',
          checkoutUrl: checkoutUrl
        };
      } catch (checkoutError) {
        console.error('🔍 Coaching Service: Subscription checkout link creation failed:', checkoutError);
        console.error('🔍 Coaching Service: Full error details:', {
          message: checkoutError.message,
          stack: checkoutError.stack,
          name: checkoutError.name
        });
        
        // Fallback: Try database insertion without payment
        try {
          const insertData = {
            user_id: subscriptionData.userId,
            plan_id: subscriptionData.plan,
            status: 'pending',
            stripe_customer_id: subscriptionData.stripeCustomerId || null,
            stripe_payment_id: subscriptionData.stripePaymentId || null,
            stripe_subscription_id: subscriptionData.stripeSubscriptionId || null
          };

          console.log('🔍 Coaching Service: Inserting subscription data:', insertData);

          const { data, error } = await supabase
            .from('subscriptions')
            .insert([insertData])
            .select()
            .single();

          if (error) {
            throw new Error(`Database insertion failed: ${error.message}`);
          }

          return {
            success: true,
            message: `Subscription recorded: ${subscriptionData.plan} (€${priceEUR}/mo). Payment setup failed, please contact support to complete your subscription.`,
            subscriptionId: data.id
          };
        } catch (dbError) {
          console.error('Database fallback also failed:', dbError);
          return {
            success: true,
            message: `⚠️ I understand you want the ${subscriptionData.plan} plan (€${priceEUR}/mo), but I'm having technical difficulties with the booking system. Please contact support or try the manual subscription form.`,
            subscriptionId: 'failed-' + Date.now()
          };
        }
      }
    } catch (error) {
      console.error('Coaching Service: Direct Supabase subscription fallback failed:', error);
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
      
      console.log('🔍 Coaching Service: Created real Stripe subscription checkout URL:', checkoutUrl);
      return checkoutUrl;
    } catch (error) {
      console.error('Coaching Service: Error creating subscription checkout link:', error);
      throw error;
    }
  }

  /**
   * Check if a message contains coaching subscription intent
   */
  isSubscriptionRequest(message) {
    const lowerMessage = message.toLowerCase();
    
    // Exclude informational questions about coaching - these should go to OpenAI
    const informationalPatterns = [
      /what.*(?:coaching|plan|subscription|offer|include|cover)/i,
      /how.*(?:coaching|plan|subscription|work)/i,
      /tell me about.*(?:coaching|plan|subscription)/i,
      /explain.*(?:coaching|plan|subscription)/i,
      /describe.*(?:coaching|plan|subscription)/i,
      /can you.*(?:tell|explain|describe).*(?:coaching|plan|subscription)/i,
      /which.*(?:coaching|plan|subscription)/i,
      /do you.*(?:offer|provide).*(?:coaching|plan)/i,
      /what kind of.*(?:coaching|plan)/i,
      /what type of.*(?:coaching|plan)/i,
      /information about.*(?:coaching|plan)/i,
      /learn about.*(?:coaching|plan)/i,
      /know about.*(?:coaching|plan)/i,
      /details about.*(?:coaching|plan)/i,
      /difference between.*(?:plan|coaching)/i,
      /compare.*(?:plan|coaching)/i
    ];
    
    // If it's clearly an informational question, don't trigger subscription form
    if (informationalPatterns.some(pattern => pattern.test(message))) {
      console.log('🔍 Coaching Service: Informational coaching question detected, skipping subscription detection');
      return false;
    }
    
    // Only trigger on clear subscription intent patterns
    const subscriptionPatterns = [
      // Direct subscription requests
      /(?:want to|would like to|need to|can i).*(?:subscribe|sign up|join).*(?:coaching|plan)/i,
      /(?:subscribe|sign up|join).*(?:to|for).*(?:coaching|plan|premium|basic|standard)/i,
      
      // Specific plan requests
      /(?:want|would like|need|get).*(?:premium|basic|standard).*(?:coaching|plan)/i,
      /(?:premium|basic|standard).*(?:coaching|plan).*(?:please|subscription)/i,
      
      // Direct plan mentions with intent
      /i (?:want|would like|need).*(?:premium|basic|standard)/i,
      /(?:get|start).*(?:coaching|subscription|plan)/i,
      
      // Monthly/payment related with coaching
      /(?:monthly|pay|payment).*(?:coaching|plan)/i,
      /(?:coaching|plan).*(?:monthly|subscription)/i
    ];
    
    const hasPattern = subscriptionPatterns.some(pattern => pattern.test(message));
    console.log('🔍 Coaching Service: Subscription patterns found:', hasPattern);
    
    return hasPattern;
  }

  /**
   * Parse subscription request from natural language
   */
  parseSubscriptionRequest(message) {
    console.log('🔍 Coaching Service: Parsing subscription request:', message);
    
    const planMatch = message.match(/\b(basic|standard|premium)\b/i);
    const plan = planMatch ? planMatch[1].toLowerCase() : null;
    
    const contactInfo = this.extractContactInfo(message);
    console.log('🔍 Coaching Service: Extracted plan:', plan);
    console.log('🔍 Coaching Service: Extracted contact info:', contactInfo);

    return {
      plan,
      // Extract contact info if provided
      name: contactInfo.name,
      email: contactInfo.email,
      phone: contactInfo.phone
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
   * Get subscription price
   */
  getSubscriptionPrice(plan) {
    const prices = {
      basic: 40,
      standard: 90,
      premium: 230
    };
    return prices[plan] || 0;
  }

  /**
   * Format price for display
   */
  formatPrice(amount) {
    return `€${amount.toFixed(2)}`;
  }
}

// Export a singleton instance
export const coachingService = new CoachingService();
export default coachingService;