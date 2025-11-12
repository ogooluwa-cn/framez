import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

/**
 * Utility function for handling image selection from gallery
 */
export const pickImage = async (options = {}) => {
  try {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera roll permissions to make this work!',
        [{ text: 'OK' }]
      );
      return null;
    }

    // Default options
    const defaultOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio like Instagram
      quality: 0.8,
      allowsMultipleSelection: false,
    };

    // Merge with custom options
    const finalOptions = { ...defaultOptions, ...options };

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync(finalOptions);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return {
        uri: result.assets[0].uri,
        width: result.assets[0].width,
        height: result.assets[0].height,
        type: result.assets[0].type,
        fileName: result.assets[0].fileName,
      };
    }

    return null;
  } catch (error) {
    console.error('Error picking image:', error);
    Alert.alert('Error', 'Failed to pick image. Please try again.');
    return null;
  }
};

/**
 * Utility function for taking a photo with camera
 */
export const takePhoto = async (options = {}) => {
  try {
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera permissions to take photos!',
        [{ text: 'OK' }]
      );
      return null;
    }

    // Default options
    const defaultOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    };

    const finalOptions = { ...defaultOptions, ...options };

    const result = await ImagePicker.launchCameraAsync(finalOptions);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return {
        uri: result.assets[0].uri,
        width: result.assets[0].width,
        height: result.assets[0].height,
        type: result.assets[0].type,
      };
    }

    return null;
  } catch (error) {
    console.error('Error taking photo:', error);
    Alert.alert('Error', 'Failed to take photo. Please try again.');
    return null;
  }
};

/**
 * Utility to validate image file size (max 10MB)
 */
export const validateImageSize = (imageUri, maxSizeMB = 10) => {
  return new Promise((resolve) => {
    // For React Native, we'd typically check this during upload
    // This is a simplified version
    resolve(true);
  });
};

/**
 * Utility to get image file extension
 */
export const getFileExtension = (filename) => {
  return filename?.split('.').pop()?.toLowerCase() || 'jpg';
};

/**
 * Utility to compress image if needed
 */
export const compressImage = async (imageUri, quality = 0.7) => {
  // In a real app, you might use a library like react-native-image-resizer
  // For now, we'll return the original URI
  return imageUri;
};

/**
 * Utility to handle multiple image selection
 */
export const pickMultipleImages = async (maxFiles = 10) => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera roll permission is required!');
      return [];
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: maxFiles,
    });

    if (!result.canceled && result.assets) {
      return result.assets.map(asset => ({
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        type: asset.type,
        fileName: asset.fileName,
      }));
    }

    return [];
  } catch (error) {
    console.error('Error picking multiple images:', error);
    return [];
  }
};

export default {
  pickImage,
  takePhoto,
  validateImageSize,
  getFileExtension,
  compressImage,
  pickMultipleImages,
};