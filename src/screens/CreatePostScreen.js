// src/screens/CreatePostScreen.js
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';

const CreatePostScreen = ({ navigation }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const pickImage = async () => {
    try {
      console.log('Requesting image picker permissions...');
      
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }

      console.log('Launching image picker...');
      
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      console.log('Image picker result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
        console.log('Image selected:', result.assets[0].uri);
      } else {
        console.log('Image selection canceled');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // FIXED: Working image upload using fetch API with proper blob handling
  const uploadImage = async (uri) => {
    try {
      console.log('Starting image upload...', uri);
      
      // Generate unique filename
      const fileExt = uri.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `posts/${fileName}`;

      console.log('Uploading file:', fileName);

      // Method 1: Using fetch to get the file and create blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('posts')
        .upload(filePath, blob, {
          contentType: `image/${fileExt}`,
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      console.log('Upload successful:', data);
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('posts')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // FIXED: Base64 upload with proper encoding
  const uploadImageBase64 = async (uri) => {
    try {
      console.log('Starting base64 upload...', uri);
      
      const fileExt = uri.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `posts/${fileName}`;

      // Read file as base64 - FIXED: Use string 'base64' instead of undefined constant
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64', // Use string directly
      });

      console.log('Base64 data length:', base64.length);

      // Convert base64 to Uint8Array
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      // Upload as Uint8Array
      const { data, error } = await supabase.storage
        .from('posts')
        .upload(filePath, byteArray, {
          contentType: `image/${fileExt}`,
        });

      if (error) {
        console.error('Base64 upload error:', error);
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('posts')
        .getPublicUrl(filePath);

      console.log('Base64 upload successful');
      return publicUrl;
    } catch (error) {
      console.error('Error in base64 upload:', error);
      throw error;
    }
  };

  // NEW: Simple FormData upload (most reliable)
  const uploadImageFormData = async (uri) => {
    try {
      console.log('Starting FormData upload...', uri);
      
      const fileExt = uri.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `posts/${fileName}`;

      // Create FormData
      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        type: `image/${fileExt}`,
        name: fileName,
      });

      // Get session for auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No authentication session found');
      }

      // Upload using Supabase storage API
      const { data, error } = await supabase.storage
        .from('posts')
        .upload(filePath, formData, {
          contentType: `image/${fileExt}`,
        });

      if (error) {
        console.error('FormData upload error:', error);
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('posts')
        .getPublicUrl(filePath);

      console.log('FormData upload successful');
      return publicUrl;
    } catch (error) {
      console.error('Error in FormData upload:', error);
      throw error;
    }
  };

  const createPost = async () => {
    if (!content.trim() && !image) {
      Alert.alert('Error', 'Please add some content or an image to your post');
      return;
    }

    setUploading(true);
    try {
      console.log('Starting post creation...');
      console.log('User ID:', user?.id);
      console.log('Content:', content);
      console.log('Has image:', !!image);

      let imageUrl = null;
      if (image) {
        console.log('Uploading image...');
        
        // Try multiple upload methods in sequence
        try {
          imageUrl = await uploadImageFormData(image);
          console.log('FormData upload successful');
        } catch (error1) {
          console.log('FormData failed, trying blob method...');
          try {
            imageUrl = await uploadImage(image);
            console.log('Blob upload successful');
          } catch (error2) {
            console.log('Blob failed, trying base64 method...');
            imageUrl = await uploadImageBase64(image);
            console.log('Base64 upload successful');
          }
        }
        
        console.log('Image uploaded, URL:', imageUrl);
      }

      console.log('Creating post in database...');
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: content.trim(),
          image_url: imageUrl,
        })
        .select();

      if (error) {
        console.error('Database insert error:', error);
        throw error;
      }

      console.log('Post created successfully:', data);

      Alert.alert('Success', 'Your post has been shared!');
      setContent('');
      setImage(null);
      
      // Navigate back to feed
      navigation.reset({
        index: 0,
        routes: [{ name: 'Feed' }],
      });
      
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert(
        'Error', 
        `Failed to create post: ${error.message}\n\nTry posting without an image first.`
      );
    } finally {
      setUploading(false);
    }
  };

  // Text-only post for testing
  const createTextPost = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please add some content to your post');
      return;
    }

    setUploading(true);
    try {
      console.log('Creating text-only post...');
      
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: content.trim(),
          image_url: null,
        })
        .select();

      if (error) {
        console.error('Text post error:', error);
        throw error;
      }

      console.log('Text post created:', data);
      Alert.alert('Success', 'Your post has been shared!');
      setContent('');
      setImage(null);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Feed' }],
      });
    } catch (error) {
      console.error('Error creating text post:', error);
      Alert.alert('Error', `Failed to create post: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          disabled={uploading}
        >
          <Text style={[styles.cancelButton, uploading && styles.disabled]}>
            Cancel
          </Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Post</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            onPress={createTextPost} 
            disabled={uploading || !content.trim()}
            style={styles.textPostButton}
          >
            <Text style={[
              styles.textOnlyButton, 
              (uploading || !content.trim()) && styles.disabled
            ]}>
              Text Only
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={createPost} 
            disabled={uploading || (!content.trim() && !image)}
          >
            <Text style={[
              styles.shareButton, 
              (uploading || (!content.trim() && !image)) && styles.disabled
            ]}>
              {uploading ? 'Sharing...' : 'Share'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <TextInput
          style={styles.textInput}
          placeholder="What's on your mind?"
          placeholderTextColor="#999"
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          editable={!uploading}
        />

        {image && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeImage}
              onPress={() => setImage(null)}
              disabled={uploading}
            >
              <Text style={styles.removeImageText}>×</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.addPhotoButton, uploading && styles.disabledButton]} 
          onPress={pickImage}
          disabled={uploading}
        >
          <Text style={styles.addPhotoText}>
            {image ? 'Change Photo' : 'Add Photo'}
          </Text>
        </TouchableOpacity>

        {uploading && (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="small" color="#0095f6" />
            <Text style={styles.uploadingText}>
              {image ? 'Uploading image...' : 'Sharing post...'}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cancelButton: {
    fontSize: 16,
    color: '#666',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0095f6',
    position : 'relative',
    top      : 30,
  },
  textOnlyButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  textPostButton: {
    marginRight: 0,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledButton: {
    opacity: 0.5,
  },
  content: {
    padding: 16,
  },
  textInput: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 20,
    color: '#000',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
  removeImage: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  addPhotoButton: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderStyle: 'dashed',
  },
  addPhotoText: {
    color: '#0095f6',
    fontWeight: '600',
    fontSize: 16,
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  uploadingText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
});

export default CreatePostScreen;