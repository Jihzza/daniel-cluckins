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

Remember: You represent Daniel DaGalow's brand. Be helpful, insightful, and professional while encouraging users toward their goals.`;
  }

  /**
   * Get AI response for a conversation
   */
  async getChatResponse(messages, userId = null) {
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

      // Add user context if available
      if (userId) {
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
  async getWelcomeMessage(userId = null) {
    try {
      const welcomePrompt = "Generate a brief, personalized welcome message for someone visiting Daniel DaGalow's coaching platform. Keep it under 50 characters and encouraging.";
      
      const completion = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: welcomePrompt }
        ],
        max_tokens: 100,
        temperature: 0.8
      });

      return completion.choices[0]?.message?.content || "👋 Welcome! I'm here to help you with Daniel's coaching services. What can I assist you with today?";
    } catch (error) {
      console.error('Error generating welcome message:', error);
      return "👋 Welcome! I'm here to help you with Daniel's coaching services. What can I assist you with today?";
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
