import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  Linking,
  Share,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// Update this import path based on where you placed bookmarkStorage.js
// If in services folder: '../services/bookmarkStorage'
// If in utils folder: '../utils/bookmarkStorage'
import { 
  addBookmarkToStorage, 
  removeBookmarkFromStorage, 
  isArticleBookmarked 
} from './bookmarkStorage';

export default function ArticleDetailScreen({ navigation, route }) {
  const { article } = route.params || {};
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkBookmarkStatus();
  }, [article]);

  const checkBookmarkStatus = async () => {
    if (article) {
      const bookmarked = await isArticleBookmarked(article.url);
      setIsBookmarked(bookmarked);
    }
  };

  const toggleBookmark = async () => {
    setLoading(true);
    try {
      if (isBookmarked) {
        await removeBookmarkFromStorage(article.url);
        setIsBookmarked(false);
        Alert.alert("Removed", "Article removed from bookmarks");
      } else {
        await addBookmarkToStorage(article);
        setIsBookmarked(true);
        Alert.alert("Saved", "Article saved to bookmarks");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update bookmark");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!article) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No article data available</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleOpenInBrowser = () => {
    if (article.url) {
      Linking.openURL(article.url);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${article.title}\n\n${article.url}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {article.urlToImage ? (
        <Image
          source={{ uri: article.urlToImage }}
          style={styles.headerImage}
          resizeMode="cover"
        />
      ) : null}

      {/* Bookmark Button Overlay */}
      <TouchableOpacity 
        style={styles.bookmarkButton}
        onPress={toggleBookmark}
        disabled={loading}
      >
        <Ionicons 
          name={isBookmarked ? "bookmark" : "bookmark-outline"} 
          size={28} 
          color={isBookmarked ? "#007AFF" : "#fff"} 
        />
      </TouchableOpacity>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>{article.title}</Text>

        <View style={styles.metaContainer}>
          <Text style={styles.source}>{article.source?.name || 'Unknown Source'}</Text>
          <Text style={styles.date}>
            {new Date(article.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        {article.author && (
          <Text style={styles.author}>By {article.author}</Text>
        )}

        {article.description && (
          <Text style={styles.description}>{article.description}</Text>
        )}

        {article.content && (
          <Text style={styles.content}>
            {article.content.replace(/\[\+\d+ chars\]/, '')}
          </Text>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleOpenInBrowser}
          >
            <Ionicons name="globe-outline" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Read Full Article</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleShare}
          >
            <Ionicons name="share-social-outline" size={20} color="#007AFF" />
            <Text style={styles.secondaryButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  headerImage: {
    width: '100%',
    height: 250,
  },
  bookmarkButton: {
    position: 'absolute',
    top: 200,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    lineHeight: 32,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  source: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: '#8E8E93',
  },
  author: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 16,
    fontWeight: '500',
  },
  content: {
    fontSize: 15,
    lineHeight: 24,
    color: '#444',
    marginBottom: 24,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
});