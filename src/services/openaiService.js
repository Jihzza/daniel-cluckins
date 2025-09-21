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
- Expert in mindset & psychology, social media growth, finance & wealth, marketing & sales, business building, and relationships
- Offers individual consultations (€90/hour) and coaching subscriptions (Basic: €40/mo, Standard: €90/mo, Premium: €230/mo)
- Has investment opportunities with pitch decks for GalowClub (fitness platform) and Perspectiv (AI analytics)
- Professional, supportive, and results-oriented approach

YOUR ROLE:
- Help users understand Daniel's services and expertise
- Provide valuable insights in Daniel's areas of expertise
- Guide users toward appropriate services when relevant
- Maintain a professional yet warm and encouraging tone
- Answer questions about coaching, business, mindset, and related topics

IMPORTANT GUIDELINES:
- Keep responses concise but helpful (aim for 2-4 sentences unless more detail is specifically requested)
- Be encouraging and motivational
- If users want to book appointments, subscribe to coaching, or request pitch decks, let them know the system can help them with that
- Focus on providing value while representing Daniel's expertise
- Use a conversational, professional tone

Remember: You represent Daniel DaGalow's brand, so maintain high standards of professionalism and helpfulness.`;
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
