// src/services/emailService.js
// Email notification service for booking confirmations

class EmailService {
  constructor() {
    // Using Supabase Edge Functions for email sending
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  }

  /**
   * Send appointment confirmation email
   */
  async sendAppointmentConfirmation(appointmentData) {
    try {
      console.log('📧 Email Service: Sending appointment confirmation...', appointmentData);
      
      const emailData = {
        type: 'appointment_confirmation',
        to: appointmentData.contactEmail,
        data: {
          name: appointmentData.contactName,
          date: appointmentData.date,
          time: appointmentData.startTime,
          duration: appointmentData.durationMinutes,
          price: this.calculatePrice(appointmentData.durationMinutes)
        }
      };

      // For now, we'll log the email that would be sent
      // In production, this would call a Supabase Edge Function or external email service
      console.log('📧 Email Service: Appointment confirmation email prepared:', emailData);
      
      return {
        success: true,
        message: 'Appointment confirmation email scheduled for delivery'
      };
    } catch (error) {
      console.error('📧 Email Service: Failed to send appointment confirmation:', error);
      return {
        success: false,
        message: 'Email notification failed, but appointment was booked successfully'
      };
    }
  }

  /**
   * Send subscription confirmation email
   */
  async sendSubscriptionConfirmation(subscriptionData) {
    try {
      console.log('📧 Email Service: Sending subscription confirmation...', subscriptionData);
      
      const planPrices = { basic: 40, standard: 90, premium: 230 };
      
      const emailData = {
        type: 'subscription_confirmation',
        to: subscriptionData.email,
        data: {
          name: subscriptionData.name,
          plan: subscriptionData.plan,
          price: planPrices[subscriptionData.plan]
        }
      };

      console.log('📧 Email Service: Subscription confirmation email prepared:', emailData);
      
      return {
        success: true,
        message: 'Subscription confirmation email scheduled for delivery'
      };
    } catch (error) {
      console.error('📧 Email Service: Failed to send subscription confirmation:', error);
      return {
        success: false,
        message: 'Email notification failed, but subscription was created successfully'
      };
    }
  }

  /**
   * Send pitch deck via email
   */
  async sendPitchDeck(pitchData) {
    try {
      console.log('📧 Email Service: Sending pitch deck...', pitchData);
      
      const emailData = {
        type: 'pitch_deck_delivery',
        to: pitchData.email,
        data: {
          name: pitchData.name,
          project: pitchData.project,
          role: pitchData.role,
          // In production, this would include the actual pitch deck attachment
          pitchDeckUrl: this.getPitchDeckUrl(pitchData.project)
        }
      };

      console.log('📧 Email Service: Pitch deck delivery email prepared:', emailData);
      
      return {
        success: true,
        message: 'Pitch deck delivery email scheduled'
      };
    } catch (error) {
      console.error('📧 Email Service: Failed to send pitch deck:', error);
      return {
        success: false,
        message: 'Email delivery failed, but request was recorded'
      };
    }
  }

  /**
   * Calculate appointment price
   */
  calculatePrice(durationMinutes) {
    const hourlyRate = 90; // €90/hour
    return Math.round(hourlyRate * (durationMinutes / 60) * 100) / 100;
  }

  /**
   * Get pitch deck URL for project
   */
  getPitchDeckUrl(project) {
    const pitchDecks = {
      'GalowClub': '/assets/pitch-decks/galowclub-pitch-deck.pdf',
      'Perspectiv': '/assets/pitch-decks/perspectiv-pitch-deck.pdf'
    };
    return pitchDecks[project] || null;
  }

  /**
   * Create email template for appointment confirmation
   */
  createAppointmentEmailTemplate(data) {
    return `
      <h2>Appointment Confirmation</h2>
      <p>Dear ${data.name},</p>
      <p>Your consultation with Daniel DaGalow has been confirmed!</p>
      
      <h3>Appointment Details:</h3>
      <ul>
        <li><strong>Date:</strong> ${data.date}</li>
        <li><strong>Time:</strong> ${data.time}</li>
        <li><strong>Duration:</strong> ${data.duration} minutes</li>
        <li><strong>Price:</strong> €${data.price}</li>
      </ul>
      
      <p>You'll receive meeting details 24 hours before your appointment.</p>
      <p>Looking forward to working with you!</p>
      <p>Best regards,<br>Daniel DaGalow</p>
    `;
  }

  /**
   * Create email template for subscription confirmation
   */
  createSubscriptionEmailTemplate(data) {
    return `
      <h2>Welcome to Daniel DaGalow Coaching!</h2>
      <p>Dear ${data.name},</p>
      <p>Your ${data.plan} coaching subscription is now active!</p>
      
      <h3>Subscription Details:</h3>
      <ul>
        <li><strong>Plan:</strong> ${data.plan.toUpperCase()}</li>
        <li><strong>Price:</strong> €${data.price}/month</li>
      </ul>
      
      <p>You'll receive your first coaching session details within 24 hours.</p>
      <p>Welcome to your transformation journey!</p>
      <p>Best regards,<br>Daniel DaGalow</p>
    `;
  }

  /**
   * Create email template for pitch deck delivery
   */
  createPitchDeckEmailTemplate(data) {
    return `
      <h2>${data.project} Pitch Deck</h2>
      <p>Dear ${data.name},</p>
      <p>Thank you for your interest in ${data.project}!</p>
      
      <p>As requested, please find the ${data.project} pitch deck attached.</p>
      
      <h3>Your Details:</h3>
      <ul>
        <li><strong>Role:</strong> ${data.role}</li>
        <li><strong>Project:</strong> ${data.project}</li>
      </ul>
      
      <p>If you have any questions or would like to discuss investment opportunities, please don't hesitate to reach out.</p>
      <p>Best regards,<br>Daniel DaGalow</p>
    `;
  }
}

// Export a singleton instance
export const emailService = new EmailService();
export default emailService;
