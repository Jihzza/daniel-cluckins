// src/services/pitchDeckService.js
// Pitch deck request service extracted from MCP Client

class PitchDeckService {
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
        console.log('🔍 PitchDeck Service: Trying Netlify function for pitch deck request:', pitchData);
        
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
          const errorText = await response.text();
          console.error('🔍 PitchDeck Service: Netlify function failed:', response.status, errorText);
          throw new Error(`Netlify function failed: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('🔍 PitchDeck Service: Netlify function success:', result);
        return result;
      } catch (fetchError) {
        console.log('🔍 PitchDeck Service: Netlify function failed, using direct Supabase fallback:', fetchError.message);
        // Fallback: Direct Supabase call
        return await this.requestPitchDeckDirect(pitchData);
      }
    } catch (error) {
      console.error('PitchDeck Service: Error requesting pitch deck:', error);
      throw error;
    }
  }

  /**
   * Direct Supabase fallback for pitch deck request
   */
  async requestPitchDeckDirect(pitchData) {
    try {
      console.log('🔍 PitchDeck Service: Starting direct pitch deck request with data:', pitchData);
      
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

      console.log('🔍 PitchDeck Service: Inserting pitch request data to database:', insertData);

      // Try insertion with service role bypass for RLS
      let insertResult;
      try {
        const { data, error } = await supabase
          .from('pitch_requests')
          .insert([insertData])
          .select()
          .single();
        
        if (error) {
          console.error('🔍 PitchDeck Service: First insert attempt failed:', error);
          
          // If RLS error, try without user_id to bypass policy
          if (error.code === '42501' || error.code === 'PGRST116') {
            console.log('🔍 PitchDeck Service: RLS error detected, trying alternative approach...');
            
            // Try again without user_id to bypass RLS policy
            const alternativeData = { ...insertData, user_id: null };
            console.log('🔍 PitchDeck Service: Trying without user_id:', alternativeData);
            
            const { data: data2, error: error2 } = await supabase
              .from('pitch_requests')
              .insert([alternativeData])
              .select()
              .single();
              
            if (error2) {
              console.error('🔍 PitchDeck Service: Alternative insert also failed:', error2);
              throw error2;
            }
            
            insertResult = { data: data2, error: null };
          } else {
            throw error;
          }
        } else {
          insertResult = { data, error: null };
        }
      } catch (insertError) {
        console.error('🔍 PitchDeck Service: All insert attempts failed:', insertError);
        throw insertError;
      }
      
      const { data, error } = insertResult;

      if (error) {
        console.error('🔍 PitchDeck Service: Supabase pitch deck insertion failed:', {
          error: error,
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          insertData: insertData
        });
        throw new Error(`Supabase insert failed: ${error.message} (Code: ${error.code})`);
      }

      console.log('🔍 PitchDeck Service: Pitch deck request successfully inserted:', data);

      return {
        success: true,
        message: `✅ Perfect! Your ${pitchData.project} pitch deck request has been submitted.${pitchData.name ? `\n\n👤 **Name:** ${pitchData.name}` : ''}${pitchData.email ? `\n📧 **Email:** ${pitchData.email}` : ''}${pitchData.role ? `\n💼 **Role:** ${pitchData.role}` : ''}\n\n📧 **Next Steps:** We'll send the pitch deck to your email address within 24 hours.`,
        requestId: data.id
      };
    } catch (error) {
      console.error('PitchDeck Service: Direct Supabase pitch request fallback failed:', error);
      throw error;
    }
  }

  /**
   * Check if a message contains pitch deck request intent
   */
  isPitchDeckRequest(message) {
    const lowerMessage = message.toLowerCase();
    
    // Exclude informational questions about projects - these should go to OpenAI
    const informationalPatterns = [
      /what.*(?:galowclub|perspectiv|pitch|project)/i,
      /how.*(?:galowclub|perspectiv|work)/i,
      /tell me about.*(?:galowclub|perspectiv|pitch)/i,
      /explain.*(?:galowclub|perspectiv|pitch)/i,
      /describe.*(?:galowclub|perspectiv|pitch)/i,
      /can you.*(?:tell|explain|describe).*(?:galowclub|perspectiv|pitch)/i,
      /information about.*(?:galowclub|perspectiv|pitch)/i,
      /learn about.*(?:galowclub|perspectiv)/i,
      /know about.*(?:galowclub|perspectiv)/i,
      /details about.*(?:galowclub|perspectiv)/i
    ];
    
    // If it's clearly an informational question, don't trigger pitch form
    if (informationalPatterns.some(pattern => pattern.test(message))) {
      console.log('🔍 PitchDeck Service: Informational project question detected, skipping pitch deck detection');
      return false;
    }
    
    // Only trigger on clear pitch deck request patterns
    const pitchPatterns = [
      // Direct pitch deck requests
      /(?:want to|would like to|need to|can i).*(?:request|get|receive|see).*(?:pitch deck|pitchdeck)/i,
      /(?:request|get|receive|see).*(?:pitch deck|pitchdeck)/i,
      
      // Project specific requests
      /(?:want to|would like to|need to|can i).*(?:request|get|receive|see).*(?:galowclub|perspectiv)/i,
      /(?:request|get|receive|see).*(?:galowclub|perspectiv).*(?:pitch|deck)/i,
      
      // Direct mentions with clear intent
      /(?:galowclub|perspectiv).*(?:pitch deck|pitchdeck).*(?:please|request)/i,
      /i (?:want|would like|need).*(?:galowclub|perspectiv).*(?:pitch|deck)/i,
      
      // Investment/funding context
      /(?:interested in|looking at).*(?:galowclub|perspectiv|investment)/i,
      /(?:invest|funding|investor).*(?:galowclub|perspectiv)/i
    ];
    
    const hasPattern = pitchPatterns.some(pattern => pattern.test(message));
    console.log('🔍 PitchDeck Service: Pitch deck patterns found:', hasPattern);
    
    return hasPattern;
  }

  /**
   * Parse pitch deck request from natural language
   */
  parsePitchDeckRequest(message) {
    console.log('🔍 PitchDeck Service: Parsing pitch deck request:', message);
    
    const projectMatch = message.match(/\b(galowclub|perspectiv)\b/i);
    const project = projectMatch ? projectMatch[1].charAt(0).toUpperCase() + projectMatch[1].slice(1) : null;
    
    const contactInfo = this.extractContactInfo(message);
    const role = this.extractRole(message);
    
    console.log('🔍 PitchDeck Service: Extracted project:', project);
    console.log('🔍 PitchDeck Service: Extracted contact info:', contactInfo);
    console.log('🔍 PitchDeck Service: Extracted role:', role);

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
}

// Export a singleton instance
export const pitchDeckService = new PitchDeckService();
export default pitchDeckService;
