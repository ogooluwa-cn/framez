import moment from 'moment';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function PostItem({ post }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {post.userName?.[0]?.toUpperCase() || 'U'}
            </Text>
          </View>
          <View>
            <Text style={styles.userName}>{post.userName || 'Anonymous'}</Text>
            <Text style={styles.timestamp}>
              {post.createdAt ? moment(post.createdAt.toDate()).fromNow() : 'Just now'}
            </Text>
          </View>
        </View>
      </View>

      <Image
        source={{ uri: post.imageUrl }}
        style={styles.postImage}
        resizeMode="cover"
      />

      <View style={styles.footer}>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>🤍</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>💬</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>↗️</Text>
          </TouchableOpacity>
        </View>

        {post.caption && (
          <Text style={styles.caption}>
            <Text style={styles.captionUser}>{post.userName} </Text>
            {post.caption}
          </Text>
        )}

        <Text style={styles.likes}>{post.likes || 0} likes</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0095f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  postImage: {
    width: '100%',
    height: 400,
  },
  footer: {
    padding: 10,
  },
  actions: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  actionButton: {
    marginRight: 15,
  },
  actionIcon: {
    fontSize: 24,
  },
  caption: {
    fontSize: 14,
    marginBottom: 5,
    lineHeight: 18,
  },
  captionUser: {
    fontWeight: 'bold',
  },
  likes: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 5,
  },
});