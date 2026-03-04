const { createClient } = require('@supabase/supabase-js');

// Assuming these are loaded from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Service: Sync Clerk User
 * Adds a user to the database if they don't exist.
 */
const syncUser = async (user) => {
  const { id, email, name, phone } = user;

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('id', id)
    .single();

  if (existingUser) {
    return existingUser; // Return existing user, do nothing
  }

  // Insert new user
  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        id,
        email,
        name,
        phone,
        role: 'rider', // Default role
        created_at: new Date(),
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Service: Get User Profile
 */
const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Service: Update User Profile
 * Only allows updating name and phone.
 */
const updateUserProfile = async (userId, updates) => {
  const { name, phone } = updates;
  const allowedUpdates = {};

  if (name !== undefined) allowedUpdates.name = name;
  if (phone !== undefined) allowedUpdates.phone = phone;

  if (Object.keys(allowedUpdates).length === 0) {
    throw new Error('No valid fields to update');
  }

  const { data, error } = await supabase
    .from('users')
    .update(allowedUpdates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Service: Get User By ID
 */
const getUserById = async (id) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // Supabase error for no rows found
      throw new Error('User not found');
    }
    throw new Error(error.message);
  }

  return data;
};

module.exports = {
  syncUser,
  getUserProfile,
  updateUserProfile,
  getUserById,
};
