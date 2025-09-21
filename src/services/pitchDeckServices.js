// src/services/pitchDeckServices.js
import { supabase } from '../lib/supabaseClient';

// src/services/pitchDeckServices.js
export async function getPitchDeckRequestsByUserId(userId) {
  const { data, error } = await supabase
    .from('pitch_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
}


export async function createPitchRequest(payload) {
  const { data, error } = await supabase
    .from('pitch_requests')
    .insert([payload])
    .select()
    .single();
  return { data, error };
}
