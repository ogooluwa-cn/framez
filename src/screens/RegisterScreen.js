// src/screens/RegisterScreen.js
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, resendConfirmationEmail } = useAuth();

  const handleRegister = async () => {
    if (!email || !password || !username || !fullName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    // Basic username validation
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      Alert.alert('Error', 'Username can only contain letters, numbers, and underscores');
      return;
    }

    setLoading(true);
    
    try {
      const { error, requiresEmailConfirmation } = await signUp(
        email, 
        password, 
        username.trim(),
        fullName.trim()
      );
      
      if (error) {
        Alert.alert('Registration Error', error);
      } else {
        // SUCCESS - Show email confirmation message
        Alert.alert(
          'Check Your Email!', 
          `We've sent a confirmation email to ${email}. 
          
Please check your inbox and click the verification link to activate your account.

After verification, you can log in to Framez.`,
          [
            { 
              text: 'Resend Email', 
              onPress: () => handleResendEmail(email)
            },
            { 
              text: 'Go to Login', 
              style: 'default',
              onPress: () => navigation.navigate('Login', { email })
            }
          ]
        );
        
        // Clear the form
        setEmail('');
        setPassword('');
        setUsername('');
        setFullName('');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async (email) => {
    setLoading(true);
    const { error } = await resendConfirmationEmail(email);
    setLoading(false);
    
    if (error) {
      Alert.alert('Error', 'Failed to resend confirmation email. Please try again.');
    } else {
      Alert.alert('Email Sent!', 'Confirmation email has been resent to your email address.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>Framez</Text>
          <Text style={styles.subtitle}>Join our community</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            editable={!loading}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoComplete="username"
            editable={!loading}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Full name"
            placeholderTextColor="#999"
            value={fullName}
            onChangeText={setFullName}
            autoComplete="name"
            editable={!loading}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.registerButtonText}>
                Create Account
              </Text>
            )}
          </TouchableOpacity>

          <Text style={styles.emailNote}>
            📧 You'll receive a confirmation email to verify your account
          </Text>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Login')}
              disabled={loading}
            >
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: 30,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#0095f6',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    fontSize: 16,
    color: '#000',
  },
  registerButton: {
    backgroundColor: '#0095f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emailNote: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: '#0095f6',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RegisterScreen;