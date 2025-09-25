// src/services/openaiService.js
import OpenAI from 'openai';

class OpenAIService {
  constructor() {
    // Initialize OpenAI client
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      console.warn('OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your environment variables.');
      this.client = null;
      return;
    }

    this.client = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true // Required for client-side usage
    });

    // System prompt for the chatbot personality and context
    this.systemPrompt = `You are Daniel DaGalow's AI assistant, a professional coaching and business consultation chatbot.

ABOUT DANIEL DAGALOW:
- Expert coach and consultant specializing in 6 key areas:
  1. **Mindset & Psychology**: Mental resilience, overcoming limiting beliefs, growth mindset development, confidence building
  2. **Social Media Growth**: Content strategy, audience building, personal branding, engagement optimization
  3. **Finance & Wealth**: Investment principles, wealth-building strategies, financial planning, money mindset
  4. **Marketing & Sales**: Digital campaigns, brand development, sales funnels, customer acquisition
  5. **Business Building**: Business planning, scaling strategies, operations, leadership development
  6. **Relationships**: Personal and professional relationship coaching, communication skills, networking

SERVICES OFFERED:
- **Individual Consultations** (€90/hour):
  - One-on-one personalized sessions covering any of the 6 expertise areas
  - Tailored strategies and action plans
  - Goal setting and accountability
  - Problem-solving for specific challenges

- **Coaching Subscriptions**:
  - **Basic Plan** (€40/month): Monthly check-ins, email support, basic resources
  - **Standard Plan** (€90/month): Bi-weekly sessions, priority support, advanced resources
  - **Premium Plan** (€230/month): Weekly sessions, 24/7 support, full resource access, personalized action plans

- **Investment Opportunities**:
  - **GalowClub**: Fitness and wellness platform focused on community-driven health transformation
  - **Perspectiv**: AI-powered analytics tool for business intelligence and data insights

YOUR ROLE:
- Answer informational questions about Daniel's services, expertise, and coaching areas
- Provide valuable insights and mini-coaching in Daniel's areas of expertise
- Help users understand which service might be best for their needs
- Maintain a professional, supportive, and encouraging tone
- If users clearly want to book/subscribe/request something, guide them to use the booking system

CONVERSATION GUIDELINES:
- Keep responses helpful and engaging (2-4 sentences for simple questions, more detail when specifically requested)
- Be encouraging and motivational in Daniel's coaching style
- Share practical insights and tips related to the 6 expertise areas
- When users ask about "what subjects are covered" or "what do consultations include", explain the 6 key areas in detail
- Focus on providing value while representing Daniel's professional expertise
- Use a warm, conversational yet professional tone

BOOKING CAPABILITIES:
You can handle bookings conversationally! When users want to schedule appointments, subscriptions, or request pitch decks:

**For Consultations - SMART CHECKLIST APPROACH:**
Required info: Date, Time, Duration, Name, Email, Phone (optional)

WORKFLOW:
1. Check what's ALREADY PROVIDED from user profile (name, email, phone)
2. Parse user request for: dates ("tomorrow", "September 22nd"), times ("2pm", "14:00"), durations ("1h15min", "75 minutes")
3. Only ask for MISSING information - don't ask for what you already know!
4. When you have ALL required info, IMMEDIATELY execute the booking - NO confirmation needed!
5. Use this EXACT format to execute:
  
  **BOOK_APPOINTMENT**
  Date: YYYY-MM-DD
  Time: HH:MM
  Duration: [minutes as number]
  Name: [use profile name or ask if not available]
  Email: [use profile email or ask if not available]  
  Phone: [use profile phone or "not provided" if not given]

EXAMPLE: If user says "I want a consultation tomorrow at 2pm for 1 hour" and profile has name "John Smith" and email "john@email.com":
- Don't ask for name/email (you already know!)
- IMMEDIATELY execute: "Perfect John! Creating your consultation for [date] at 2:00 PM for 1 hour (€90)..." then execute **BOOK_APPOINTMENT**

**For Coaching Subscriptions - SMART CHECKLIST APPROACH:**
Required info: Plan, Name, Email, Phone (optional)

WORKFLOW:
1. Check what's ALREADY PROVIDED from user profile (name, email, phone)
2. Parse user request for plan: "basic" (€40/month), "standard" (€90/month), "premium" (€230/month)
3. If ALL required info is available (plan + name + email), IMMEDIATELY EXECUTE the subscription WITHOUT asking for ANY confirmation or additional questions!
4. Only ask for MISSING information if absolutely necessary - but if profile has name/email, NEVER ask to confirm them!
5. Use this EXACT format to execute:
  
  **BOOK_SUBSCRIPTION**
  Plan: [basic/standard/premium]
  Name: [use profile name - do not ask!]
  Email: [use profile email - do not ask!]
  Phone: [use profile phone or "not provided"]

EXAMPLE: If user says "I want the premium plan" and profile has name "John Smith" and email "john@email.com":
- You ALREADY have name and email - DO NOT ASK FOR ANYTHING!
- IMMEDIATELY respond with: "Perfect John! Setting up your Premium coaching subscription (€230/month)..." 
- Then execute **BOOK_SUBSCRIPTION** to generate the payment link
- The system will handle adding the link to your response

**For Pitch Decks - SMART CHECKLIST APPROACH:**
Required info: Project, Name, Email, Phone (optional), Role

WORKFLOW:
1. Check what's ALREADY PROVIDED from user profile (name, email, phone)
2. Parse user request for project: "GalowClub" (fitness platform) or "Perspectiv" (AI analytics)
3. Only ask for MISSING information - don't ask for what you already know!
4. If role/title not provided, ask for it ONCE, then immediately execute
5. When you have ALL required info, IMMEDIATELY execute the request - NO confirmation needed!
6. Use this EXACT format to execute:
  
  **REQUEST_PITCH_DECK**
  Project: [GalowClub/Perspectiv]
  Name: [use profile name or ask if not available]
  Email: [use profile email or ask if not available]
  Phone: [use profile phone or "not provided" if not given]
  Role: [user's role/title or ask if not provided]

EXAMPLE: If user says "I want the GalowClub pitch deck, I'm an investor" and profile has name "John Smith" and email "john@email.com":
- Don't ask for name/email (you already know!)
- IMMEDIATELY execute: "Perfect John! Requesting the GalowClub pitch deck for investor review..." then execute **REQUEST_PITCH_DECK**

Remember: You represent Daniel DaGalow's brand. Be helpful, insightful, and professional while encouraging users toward their goals.`;
  }

  /**
   * Get AI response for a conversation
   */
  async getChatResponse(messages, userId = null, userProfile = null) {
    if (!this.client) {
      throw new Error('OpenAI client not initialized. Please check your API key configuration.');
    }

    try {
      // Format messages for OpenAI API
      const formattedMessages = [
        { role: 'system', content: this.systemPrompt },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ];

      // Add user context with profile data if available
      if (userId && userProfile) {
        const userInfo = `\n\nUSER PROFILE (use this for personalization):
- Name: ${userProfile.full_name || 'Not provided'}
- Email: ${userProfile.email || 'Not provided'} 
- Phone: ${userProfile.phone || 'Not provided'}
- User ID: ${userId}

IMPORTANT: When booking appointments/subscriptions, use this profile data to pre-fill information! Only ask for missing details.`;
        
        formattedMessages[0].content += userInfo;
      } else if (userId) {
        formattedMessages[0].content += `\n\nUser ID: ${userId} (for context, but don't mention this to the user)`;
      }

      const completion = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: formattedMessages,
        max_tokens: 500, // Keep responses reasonably sized
        temperature: 0.7, // Balance creativity with consistency
        presence_penalty: 0.1, // Slight penalty for repetition
        frequency_penalty: 0.1
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        throw new Error('No response received from OpenAI');
      }

      // Check if the AI wants to execute a booking
      const bookingResult = await this.processBookingCommand(response, userId, userProfile);
      if (bookingResult) {
        return bookingResult;
      }

      return {
        success: true,
        content: response,
        usage: completion.usage
      };

    } catch (error) {
      console.error('OpenAI API error:', error);
      
      // Handle specific OpenAI errors
      if (error.code === 'insufficient_quota') {
        throw new Error('OpenAI API quota exceeded. Please check your billing settings.');
      } else if (error.code === 'invalid_api_key') {
        throw new Error('Invalid OpenAI API key. Please check your configuration.');
      } else if (error.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
      
      // Generic error
      throw new Error(`AI service error: ${error.message || 'Unknown error occurred'}`);
    }
  }

  /**
   * Get a welcome message for new chat sessions
   */
  async getWelcomeMessage(userId = null, userProfile = null) {
    try {
      let welcomePrompt = "Generate a brief, personalized welcome message for someone visiting Daniel DaGalow's coaching platform. Keep it under 50 characters and encouraging.";
      
      // Make it more personalized if we have user info
      if (userProfile && userProfile.full_name) {
        welcomePrompt = `Generate a brief, personalized welcome message for ${userProfile.full_name} visiting Daniel DaGalow's coaching platform. Use their name naturally and keep it under 50 characters and encouraging.`;
      }
      
      const systemPromptWithProfile = userProfile ? 
        `${this.systemPrompt}\n\nUSER PROFILE: Name: ${userProfile.full_name || 'Not provided'}, Email: ${userProfile.email || 'Not provided'}` : 
        this.systemPrompt;
      
      const completion = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPromptWithProfile },
          { role: 'user', content: welcomePrompt }
        ],
        max_tokens: 100,
        temperature: 0.8
      });

      return completion.choices[0]?.message?.content || `👋 Welcome${userProfile?.full_name ? `, ${userProfile.full_name}` : ''}! I'm here to help you with Daniel's coaching services. What can I assist you with today?`;
    } catch (error) {
      console.error('Error generating welcome message:', error);
      return `👋 Welcome${userProfile?.full_name ? `, ${userProfile.full_name}` : ''}! I'm here to help you with Daniel's coaching services. What can I assist you with today?`;
    }
  }

  /**
   * Process booking commands from AI responses
   */
  async processBookingCommand(response, userId, userProfile = null) {
    try {
      // Import specific services dynamically
      const { consultationService } = await import('./consultationService.js');
      const { coachingService } = await import('./coachingService.js');
      const { pitchDeckService } = await import('./pitchDeckService.js');
      
      // Check for appointment booking
      if (response.includes('**BOOK_APPOINTMENT**')) {
        const appointmentData = this.parseBookingData(response, 'BOOK_APPOINTMENT');
        if (appointmentData && appointmentData.Date && appointmentData.Time && appointmentData.Duration) {
          
          try {
            // Use profile data if available, otherwise use parsed data
            const bookingData = {
              date: appointmentData.Date,
              startTime: appointmentData.Time,
              durationMinutes: parseInt(appointmentData.Duration),
              userId: userId,
              contactName: userProfile?.full_name || appointmentData.Name || 'Not provided',
              contactEmail: userProfile?.email || appointmentData.Email || 'Not provided',
              contactPhone: userProfile?.phone || (appointmentData.Phone === 'not provided' ? null : appointmentData.Phone),
              timezone: 'Europe/Madrid'
            };
            
            console.log('🔍 OpenAI Service: Booking appointment with data:', bookingData);
            
            // Try payment booking first, fallback to direct booking
            let result;
            try {
              result = await consultationService.scheduleAppointmentWithPayment(bookingData);
            } catch (paymentError) {
              console.log('Payment booking failed, trying direct booking:', paymentError.message);
              result = await consultationService.scheduleAppointment(bookingData);
            }
            
            return {
              success: true,
              content: result.message,
              booking: 'appointment'
            };
          } catch (error) {
            console.error('All booking attempts failed:', error);
            return {
              success: true,
              content: `I tried to book your appointment but encountered an issue: ${error.message}. Please let me know if you'd like to try again or if you need help with a different approach.`,
              booking: 'appointment_failed'
            };
          }
        }
      }
      
      // Check for subscription booking
      if (response.includes('**BOOK_SUBSCRIPTION**')) {
        console.log('🔍 OpenAI Service: Found BOOK_SUBSCRIPTION command');
        const subscriptionData = this.parseBookingData(response, 'BOOK_SUBSCRIPTION');
        console.log('🔍 OpenAI Service: Parsed subscription data:', subscriptionData);
        
        if (subscriptionData && subscriptionData.Plan) {
          
          try {
            const bookingData = {
              plan: subscriptionData.Plan.toLowerCase(),
              userId: userId,
              name: userProfile?.full_name || subscriptionData.Name || 'Not provided',
              email: userProfile?.email || subscriptionData.Email || 'Not provided',
              phone: userProfile?.phone || (subscriptionData.Phone === 'not provided' ? null : subscriptionData.Phone)
            };
            
            console.log('🔍 OpenAI Service: Booking subscription with data:', bookingData);
            
            // Try payment subscription first, fallback to direct subscription
            let result;
            try {
              result = await coachingService.subscribeToCoachingWithPayment(bookingData);
            } catch (paymentError) {
              console.log('Payment subscription failed, trying direct subscription:', paymentError.message);
              result = await coachingService.subscribeToCoaching(bookingData);
            }
            
            return {
              success: true,
              content: result.message,
              booking: 'subscription'
            };
          } catch (error) {
            console.error('All subscription attempts failed:', error);
            return {
              success: true,
              content: `I tried to set up your ${subscriptionData.Plan} subscription but encountered an issue: ${error.message}. Please let me know if you'd like to try again.`,
              booking: 'subscription_failed'
            };
          }
        }
      }
      
      // Check for pitch deck request
      if (response.includes('**REQUEST_PITCH_DECK**')) {
        console.log('🔍 OpenAI Service: Found REQUEST_PITCH_DECK command');
        const pitchData = this.parseBookingData(response, 'REQUEST_PITCH_DECK');
        console.log('🔍 OpenAI Service: Parsed pitch deck data:', pitchData);
        
        if (pitchData && pitchData.Project) {
          
          try {
            const requestData = {
              project: pitchData.Project,
              userId: userId,
              name: userProfile?.full_name || pitchData.Name || 'Not provided',
              email: userProfile?.email || pitchData.Email || 'Not provided',
              phone: userProfile?.phone || (pitchData.Phone === 'not provided' ? null : pitchData.Phone),
              role: pitchData.Role || 'Not provided'
            };
            
            console.log('🔍 OpenAI Service: Requesting pitch deck with data:', requestData);
            console.log('🔍 OpenAI Service: User profile data used:', userProfile);
            
            const result = await pitchDeckService.requestPitchDeck(requestData);
            console.log('🔍 OpenAI Service: Pitch deck request result:', result);
            
            if (!result.success) {
              return {
                success: true,
                content: result.message  // Return error message to user
              };
            }
            
            return {
              success: true,
              content: result.message,
              booking: 'pitch_deck'
            };
          } catch (error) {
            console.error('Pitch deck request failed:', error);
            return {
              success: true,
              content: `I tried to request the ${pitchData.Project} pitch deck but encountered an issue: ${error.message}. Please try again or contact support.`,
              booking: 'pitch_deck_failed'
            };
          }
        }
      }
      
      return null; // No booking command found
    } catch (error) {
      console.error('Error processing booking command:', error);
      return null;
    }
  }

  /**
   * Parse booking data from AI response
   */
  parseBookingData(response, commandType) {
    try {
      const startMarker = `**${commandType}**`;
      const startIndex = response.indexOf(startMarker);
      if (startIndex === -1) return null;
      
      // Extract the booking section
      const bookingSection = response.substring(startIndex + startMarker.length);
      const lines = bookingSection.split('\n').filter(line => line.trim() && !line.includes('**'));
      
      const data = {};
      for (const line of lines) {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          const value = line.substring(colonIndex + 1).trim();
          if (key && value) {
            data[key] = value;
          }
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error parsing booking data:', error);
      return null;
    }
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured() {
    return this.client !== null;
  }
}

// Export a singleton instance
export const openaiService = new OpenAIService();
export default openaiService;