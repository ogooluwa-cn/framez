// src/screens/ProfileScreen.js
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';

const ProfileScreen = () => {
  const [userPosts, setUserPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, profile, signOut } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserPosts();
    }
  }, [user]);

  const fetchUserPosts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserPosts(data || []);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserPosts();
    setRefreshing(false);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const renderPost = ({ item }) => (
    <View style={styles.postItem}>
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.postImage} />
      ) : (
        <View style={styles.textPost}>
          <Text style={styles.postText} numberOfLines={3}>
            {item.content}
          </Text>
          <Text style={styles.postTime}>
            {moment(item.created_at).format('MMM D, YYYY')}
          </Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0095f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleSignOut}>
          <Icon name="log-out-outline" size={34} color="black" />
        </TouchableOpacity>
      </View>

      <FlatList
        ListHeaderComponent={
          <>
            {/* Profile Info */}
            <View style={styles.profileInfo}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  {profile?.avatar_url ? (
                    <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>
                      {profile?.username?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                  )}
                </View>
              </View>
              
              <View style={styles.stats}>
                <View style={styles.stat}>
                  <Text style={styles.statNumber}>{userPosts.length}</Text>
                  <Text style={styles.statLabel}>Posts</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statNumber}>0</Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statNumber}>0</Text>
                  <Text style={styles.statLabel}>Following</Text>
                </View>
              </View>
            </View>

            {/* User Details */}
            <View style={styles.userDetails}>
              <Text style={styles.fullName}>{profile?.full_name || 'User'}</Text>
              <Text style={styles.username}>@{profile?.username || 'username'}</Text>
              <Text style={styles.email}>{user?.email}</Text>
              <Text style={styles.bio}>
                Welcome to my Framez profile! 📸
              </Text>
            </View>

            {/* Posts Header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Posts</Text>
            </View>
          </>
        }
        data={userPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        numColumns={3}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="camera-outline" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No posts yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Share your first moment!
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: 30,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  profileInfo: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    flex: 1,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 24,
  },
  stats: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  userDetails: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  fullName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#dbdbdb',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  postItem: {
    flex: 1,
    aspectRatio: 1,
    margin: 1,
    backgroundColor: '#f8f8f8',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  textPost: {
    flex: 1,
    padding: 8,
    justifyContent: 'space-between',
  },
  postText: {
    fontSize: 12,
    lineHeight: 14,
    color: '#333',
  },
  postTime: {
    fontSize: 10,
    color: '#999',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
});

export default ProfileScreen;