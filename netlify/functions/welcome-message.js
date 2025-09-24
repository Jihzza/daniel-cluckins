const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({ apiKey: openaiApiKey });

const WELCOME_PROMPT = `Send a personal and with less than 50 characters welcome message to the user to welcome him and know what they need.
Access the user information, if needed, for more personalization.
The only thing you can output is the user message and don't start and end the message in quotes.`;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (error) {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { session_id, user_id } = body;

  if (!session_id) {
    return { statusCode: 400, body: 'Missing session_id' };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    console.log(`Processing welcome for session_id: ${session_id}, user_id: ${user_id || 'none'}`);

    // Check for existing welcome message
    const { data: existing, error: queryError } = await supabase
      .from('chatbot_conversations')
      .select('content')
      .eq('session_id', session_id)
      .eq('is_welcome', true)
      .eq('role', 'assistant')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (queryError) {
      console.error('Query error:', queryError);
      throw queryError;
    }

    console.log('Existing welcome:', existing ? 'found' : 'not found');

    if (existing) {
      return {
        statusCode: 200,
        body: JSON.stringify({ content: existing.content })
      };
    }

    console.log('Fetching user profile...');
    let userProfile = null;
    if (user_id) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user_id)
        .single();

      if (error) {
        console.error('Profile fetch error:', error);
        throw error;
      }
      userProfile = data;
      console.log('User profile fetched:', !!userProfile);
    }

    const variations = ['Ready to level up?', 'How can I help you today?', 'Let\'s get started!', 'What\'s on your mind?'];
    const randomVariation = variations[Math.floor(Math.random() * variations.length)];

    let personalizedPrompt = WELCOME_PROMPT.replace('know what they need.', randomVariation);
    if (userProfile?.full_name) {
      personalizedPrompt = `Generate a brief, personalized welcome message for ${userProfile.full_name}. ${personalizedPrompt}`;
    }

    console.log('Generating message with OpenAI...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant for Daniel DaGalow\'s coaching platform.' },
        { role: 'user', content: personalizedPrompt }
      ],
      max_tokens: 50,
      temperature: 1.0
    });

    let welcomeMessage;
    try {
      welcomeMessage = completion.choices[0].message.content.trim();
    } catch {
      welcomeMessage = `Welcome! How can I assist you with Daniel's coaching today?`;
    }
    console.log('Generated message:', welcomeMessage);

    console.log('Attempting insert...');
    let insertData;
    let insertError;
    let retries = 0;
    const maxRetries = 2;

    while (retries <= maxRetries) {
      ({ data: insertData, error: insertError } = await supabase
        .from('chatbot_conversations')
        .insert({
          session_id,
          user_id: user_id || null,
          role: 'assistant',
          content: welcomeMessage,
          created_at: new Date().toISOString(),
          is_welcome: true
        })
        .select('content')
        .single());

      if (!insertError) break;

      console.error(`Insert attempt ${retries + 1} failed:`, insertError);

      if (insertError.code === '23505') {
        console.log('Unique violation detected - querying existing');
        const { data, error: queryError } = await supabase
          .from('chatbot_conversations')
          .select('content')
          .eq('session_id', session_id)
          .eq('is_welcome', true)
          .single();

        if (queryError) {
          console.error('Post-violation query error:', queryError);
          throw queryError;
        }
        welcomeMessage = data.content;
        console.log('Returned existing:', welcomeMessage);
        return {
          statusCode: 200,
          body: JSON.stringify({ content: welcomeMessage })
        };
      }

      retries++;
      await new Promise(resolve => setTimeout(resolve, 500)); // Short delay before retry
    }

    if (insertError) throw insertError;

    welcomeMessage = insertData.content;
    console.log('Insert successful, ID:', insertData.id);

    return {
      statusCode: 200,
      body: JSON.stringify({ content: welcomeMessage })
    };
  } catch (error) {
    console.error('Overall error:', error, error.code, error.details);
    const fallback = '👋 Welcome! I\'m here to help with Daniel\'s coaching services. What can I do for you?';
    
    // Still try to insert fallback if no existing
    const { data: existingFallback } = await supabase
      .from('chatbot_conversations')
      .select('id')
      .eq('session_id', session_id)
      .eq('is_welcome', true)
      .limit(1);

    if (!existingFallback?.length) {
      console.log('Inserting fallback...');
      const { error: fallbackError } = await supabase
        .from('chatbot_conversations')
        .insert({
          session_id,
          user_id: user_id || null,
          role: 'assistant',
          content: fallback,
          created_at: new Date().toISOString(),
          is_welcome: true
        });

      if (fallbackError) console.error('Fallback insert error:', fallbackError);
      else console.log('Fallback inserted');
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ 
        content: fallback,
        error: error.message,
        errorCode: error.code,
        errorDetails: error.details
      })
    };
  }
};
