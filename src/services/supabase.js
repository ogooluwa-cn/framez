// src/services/supabase.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://ehchuzpkmwzvnlffiawu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoY2h1enBrbXd6dm5sZmZpYXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NzQ4NjMsImV4cCI6MjA3ODM1MDg2M30.w7e9MdHLy0KR5MCbHFTI6UhWaTnomqlywJUrObTLBOc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});