// src/services/paymentService.js
// Stripe payment integration service

class PaymentService {
  constructor() {
    this.stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    this.stripe = null;
  }

  /**
   * Initialize Stripe
   */
  async initializeStripe() {
    if (this.stripe) return this.stripe;

    try {
      const { loadStripe } = await import('@stripe/stripe-js');
      this.stripe = await loadStripe(this.stripePublishableKey);
      return this.stripe;
    } catch (error) {
      console.error('Failed to load Stripe:', error);
      throw new Error('Payment system unavailable');
    }
  }

  /**
   * Create a Stripe checkout session for appointments
   */
  async createAppointmentCheckout(appointmentData) {
    try {
      const response = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'appointment',
          ...appointmentData,
          // Append chat sid so chat can restore the same conversation
          returnTo: (() => {
            const sid = (typeof window !== 'undefined') ? (localStorage.getItem('chatbot-session-id') || sessionStorage.getItem('chatbot-session-id')) : null;
            const base = appointmentData.returnTo || '/chat?payment=success&type=appointment';
            return sid ? `${base}${base.includes('?') ? '&' : '?'}sid=${encodeURIComponent(sid)}` : base;
          })(),
          cancelReturnTo: (() => {
            const sid = (typeof window !== 'undefined') ? (localStorage.getItem('chatbot-session-id') || sessionStorage.getItem('chatbot-session-id')) : null;
            const base = appointmentData.cancelReturnTo || '/chat?payment=cancelled&type=appointment';
            return sid ? `${base}${base.includes('?') ? '&' : '?'}sid=${encodeURIComponent(sid)}` : base;
          })()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      return sessionId;
    } catch (error) {
      console.error('Payment service error:', error);
      throw error;
    }
  }

  /**
   * Create a Stripe checkout session for coaching subscriptions
   */
  async createSubscriptionCheckout(subscriptionData) {
    try {
      const response = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'subscription',
          ...subscriptionData,
          returnTo: (() => {
            const sid = (typeof window !== 'undefined') ? (localStorage.getItem('chatbot-session-id') || sessionStorage.getItem('chatbot-session-id')) : null;
            const base = subscriptionData.returnTo || `/chat?payment=success&type=subscription&plan=${subscriptionData.plan}`;
            return sid ? `${base}${base.includes('?') ? '&' : '?'}sid=${encodeURIComponent(sid)}` : base;
          })(),
          cancelReturnTo: (() => {
            const sid = (typeof window !== 'undefined') ? (localStorage.getItem('chatbot-session-id') || sessionStorage.getItem('chatbot-session-id')) : null;
            const base = subscriptionData.cancelReturnTo || '/chat?payment=cancelled&type=subscription';
            return sid ? `${base}${base.includes('?') ? '&' : '?'}sid=${encodeURIComponent(sid)}` : base;
          })()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      return sessionId;
    } catch (error) {
      console.error('Payment service error:', error);
      throw error;
    }
  }

  /**
   * Redirect to Stripe checkout
   */
  async redirectToCheckout(sessionId) {
    try {
      const stripe = await this.initializeStripe();
      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Stripe checkout error:', error);
      throw error;
    }
  }

  /**
   * Calculate appointment price
   */
  calculateAppointmentPrice(durationMinutes) {
    const hourlyRate = 90; // €90/hour
    return Math.round(hourlyRate * (durationMinutes / 60) * 100) / 100;
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

export const paymentService = new PaymentService();
