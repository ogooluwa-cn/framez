// src/contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert, Linking } from 'react-native';
import { supabase } from '../services/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    // Handle deep links for email confirmation
    const handleDeepLink = async (url) => {
      console.log('Deep link received:', url);
      
      try {
        // Extract the access token from the URL
        if (url.includes('access_token=') && url.includes('type=signup')) {
          console.log('Email confirmation link detected');
          
          // Show success message
          Alert.alert(
            'Email Verified!',
            'Your email has been verified successfully. You can now log in to your account.',
            [{ text: 'OK' }]
          );
          
          // The session will be updated automatically via onAuthStateChange
        }
      } catch (error) {
        console.error('Error handling deep link:', error);
      }
    };

    // Get initial URL if app was opened from a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Listen for deep links
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session:', session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
        setSessionChecked(true);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        if (event === 'SIGNED_IN') {
          console.log('User signed in successfully');
        } else if (event === 'USER_UPDATED') {
          console.log('User updated (email confirmed)');
          // When email is confirmed, the user is automatically signed in
        }
        
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setSessionChecked(true);
      }
    );

    return () => {
      subscription?.remove();
      authSubscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        if (error.code === 'PGRST116') {
          console.log('Profile not found');
        }
      } else {
        console.log('Profile fetched successfully:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  const signUp = async (email, password, username, fullName) => {
    try {
      console.log('Starting signup process with email confirmation...');
      
      // Clean the username
      const cleanUsername = username.trim().replace(/\s+/g, '_').toLowerCase();
      
      // Use deep link URL for email confirmation redirect
      const redirectUrl = 'framez://auth/callback';
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: cleanUsername,
            full_name: fullName.trim()
          },
          emailRedirectTo: redirectUrl
        }
      });

      if (authError) {
        console.error('Signup auth error:', authError);
        
        if (authError.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please log in instead.');
        }
        throw authError;
      }

      console.log('Auth signup successful:', authData);

      return { 
        error: null,
        requiresEmailConfirmation: true 
      };
      
    } catch (error) {
      console.error('Complete signup error:', error);
      return { error: error.message };
    }
  };

  const signIn = async (email, password) => {
    try {
      console.log('Attempting sign in with:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Sign in response:', { data, error });

      if (error) {
        console.error('Sign in error details:', error);
        
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Please check your email to verify your account before logging in. We sent a confirmation link to your email.');
        } else {
          throw error;
        }
      }

      console.log('Sign in successful');
      return { error: null };
    } catch (error) {
      console.error('Sign in catch error:', error);
      return { error: error.message };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const resendConfirmationEmail = async (email) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: 'framez://auth/callback'
        }
      });

      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  };

  const value = {
    user,
    profile,
    loading: loading || !sessionChecked,
    signUp,
    signIn,
    signOut,
    resendConfirmationEmail,
    refreshProfile: () => user && fetchProfile(user.id),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};