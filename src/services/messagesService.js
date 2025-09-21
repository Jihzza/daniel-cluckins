// src/services/messagesService.js
import { supabase } from '../lib/supabaseClient';

// No changes needed here, this function is correct.
export const searchUsers = async (username, currentUserId) => {
  if (!username.trim() || !currentUserId) return { data: [], error: null };

  return supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url')
    .ilike('username', `%${username}%`)
    .neq('id', currentUserId);
};

// --- FIX #1: Make getUser() asynchronous ---
export const findOrCreateConversation = async (otherUserId) => {
  // Your original code used supabase.auth.getUser().id, which is synchronous
  // and can lead to errors if the user session is still loading.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: { message: 'User not authenticated' } };

  const { data, error } = await supabase.rpc('get_or_create_conversation', {
    // We now safely use the user ID after awaiting it.
    p_user_id_1: user.id,
    p_user_id_2: otherUserId,
  });

  // The rpc function returns a single value, not an object with an id.
  // We need to return it directly.
  return { data, error };
};

// --- FIX #2: Correct the relationship query ---
export const getConversations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [], error: { message: "User not authenticated" } };

    // First, get the list of conversation IDs the user is part of.
    const { data: userConversations, error: convError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

    if (convError) return { data: [], error: convError };
    
    // --- EDGE CASE FIX ---
    // If the user has no conversations, return an empty array immediately.
    // This prevents the `.in()` filter from receiving an empty list.
    const conversationIds = userConversations.map(c => c.conversation_id);
    if (conversationIds.length === 0) {
        return { data: [], error: null };
    }

    // --- RELATIONSHIP FIX ---
    // Now, fetch the *other* participants for those conversations.
    // The syntax `profiles!conversation_participants_user_id_fkey( ... )` is the most explicit way
    // to tell Supabase exactly which foreign key relationship to use for the join.
    const { data, error } = await supabase
      .from('conversation_members')
      .select(`
        conversation_id,
        username,
        full_name,
        avatar_url,
        user_id
      `)
      .in('conversation_id', conversationIds) // Use the list of IDs we just fetched
      .neq('user_id', user.id); // And exclude the current user from the results

      // We need to reshape the data slightly to match what our components expect.
      // The companent excepts an object with a nested 'profiles' key.
      if (data) {
        const formattedData = data.map(item => ({
            conversation_id: item.conversation_id,
            profiles: {
                id: item.user_id,
                username: item.username,
                full_name: item.full_name,
                avatar_url: item.avatar_url
            }
        }));
        return { data: formattedData, error: null };
      }
    
    return { data, error };
};


// --- FIX #3: Correct the relationship query for getMessages ---
export const getMessages = async (conversationId) => {
    if (!conversationId) return { data: [], error: null };
  
    // Instead of a complex join, we simply select from our new VIEW.
    // This is cleaner, more maintainable, and solves the relationship error.
    const { data, error } = await supabase
      .from('message_details') // Query the simple VIEW
      .select('*')             // Select all pre-joined columns
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
  
    // Reshape the data to match what ChatWindow expects (a nested 'profiles' object)
    if (data) {
        const formattedData = data.map(msg => ({
            ...msg,
            profiles: {
                username: msg.username,
                avatar_url: msg.avatar_url
            }
        }));
        return { data: formattedData, error: null };
    }
  
    return { data, error };
  };

// --- FIX #4: Make getUser() asynchronous ---
export const sendMessage = async (conversationId, content) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: { message: 'User not authenticated' } };
  return supabase
    .from('messages')
    .insert({ conversation_id: conversationId, content: content, sender_id: user.id })
    .select()
    .single();
};

// --- FIX #5: Enrich the real-time payload ---
export const subscribeToMessages = (conversationId, onNewMessage) => {
    const channel = supabase.channel(`messages_for_${conversationId}`);
    
    channel.on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        async (payload) => {
            // This part is good - it enriches the real-time message with profile data.
            const { data: profileData } = await supabase.from('profiles').select('username, avatar_url').eq('id', payload.new.sender_id).single();
            const messageWithProfile = {...payload.new, profiles: profileData};
            onNewMessage(messageWithProfile);
        }
      )
      .subscribe();
  
    // We return the entire channel instance, not just the subscription.
    // This is crucial for the cleanup process.
    return channel;
  };
