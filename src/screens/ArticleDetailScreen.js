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
  Alert,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
        <Ionicons name="document-text-outline" size={64} color="#94A3B8" />
        <Text style={styles.errorText}>Article not found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Hero Image with Header Overlay */}
      <View style={styles.heroSection}>
        <Image
          source={{ uri: article.urlToImage }}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.heroOverlay}>
          <View style={styles.topBar}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.topBarRight}>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={toggleBookmark}
                disabled={loading}
              >
                <Ionicons 
                  name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                  size={24} 
                  color={isBookmarked ? "#FBBF24" : "#fff"} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={handleShare}
              >
                <Ionicons name="share-social-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Category Badge */}
        <View style={styles.categoryBadge}>
          <Ionicons name="shield-checkmark" size={14} color="#6366F1" />
          <Text style={styles.categoryText}>Cybersecurity</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{article.title}</Text>

        {/* Meta Info */}
        <View style={styles.metaContainer}>
          <View style={styles.sourceContainer}>
            <View style={styles.sourceDot} />
            <Text style={styles.source}>{article.source?.name || 'Unknown Source'}</Text>
          </View>
          <Text style={styles.date}>
            {new Date(article.publishedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </View>

        {article.author && (
          <View style={styles.authorContainer}>
            <Ionicons name="person-circle-outline" size={20} color="#64748B" />
            <Text style={styles.author}>By {article.author}</Text>
          </View>
        )}

        {/* Description */}
        {article.description && (
          <Text style={styles.description}>{article.description}</Text>
        )}

        {/* Content */}
        {article.content && (
          <Text style={styles.articleContent}>
            {article.content.replace(/\[\+\d+ chars\]/, '')}
          </Text>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleOpenInBrowser}
          >
            <Ionicons name="globe-outline" size={22} color="#fff" />
            <Text style={styles.primaryButtonText}>Read Full Article</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleShare}
          >
            <Ionicons name="share-social-outline" size={22} color="#6366F1" />
            <Text style={styles.secondaryButtonText}>Share Article</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  heroSection: {
    height: 320,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  topBarRight: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 16,
  },
  categoryText: {
    color: '#6366F1',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    lineHeight: 36,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 16,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sourceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  source: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '600',
  },
  date: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  author: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  description: {
    fontSize: 17,
    lineHeight: 28,
    color: '#475569',
    marginBottom: 20,
    fontWeight: '500',
  },
  articleContent: {
    fontSize: 16,
    lineHeight: 26,
    color: '#64748B',
    marginBottom: 32,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  secondaryButtonText: {
    color: '#6366F1',
    fontSize: 17,
    fontWeight: '700',
  },
});