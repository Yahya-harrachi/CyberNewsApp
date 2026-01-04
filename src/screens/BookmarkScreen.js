import React, { useEffect, useState, useCallback, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchBookmarksFromStorage, removeBookmarkFromStorage } from './bookmarkStorage';
import { useFocusEffect } from '@react-navigation/native';
import { ThemeContext } from '../../Context/ThemeContext';

export default function BookmarkScreen({ navigation }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const themeContext = useContext(ThemeContext);
  const mode = themeContext?.mode || 'light';
  const theme = themeContext?.theme || {
    background: '#FAFAFA',
    text: '#1E293B',
    card: '#ffffff',
  };
  const isDark = mode === 'dark';

  useFocusEffect(
    useCallback(() => {
      loadBookmarks();
    }, [])
  );

  const loadBookmarks = async () => {
    try {
      const fetchedBookmarks = await fetchBookmarksFromStorage();
      setBookmarks(fetchedBookmarks);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      Alert.alert('Error', 'Failed to load bookmarks');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadBookmarks();
  };

  const handleRemoveBookmark = async (article) => {
    Alert.alert(
      "Remove Bookmark",
      "Are you sure you want to remove this article?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await removeBookmarkFromStorage(article.url);
              setBookmarks(prev => prev.filter(b => b.url !== article.url));
            } catch (error) {
              Alert.alert('Error', 'Failed to remove bookmark');
            }
          }
        }
      ]
    );
  };

  const renderBookmarkItem = ({ item, index }) => (
    <TouchableOpacity
      style={[styles.bookmarkCard, { backgroundColor: theme.card }]}
      onPress={() => navigation.navigate('ArticleDetail', { article: item })}
      activeOpacity={0.9}
    >
      <View style={styles.cardLeft}>
        <View style={styles.numberBadge}>
          <Text style={styles.numberText}>{(index + 1).toString().padStart(2, '0')}</Text>
        </View>
        <Image
          source={{ uri: item.urlToImage }}
          style={styles.cardImage}
          resizeMode="cover"
        />
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.savedBadge}>
            <Ionicons name="bookmark" size={12} color="#FBBF24" />
            <Text style={styles.savedText}>Saved</Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleRemoveBookmark(item)}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.cardMeta}>
          <Text style={[styles.cardSource, { color: isDark ? '#94A3B8' : '#64748B' }]}>
            {item.source?.name || 'Unknown'}
          </Text>
          <View style={styles.dot} />
          <Text style={styles.cardDate}>
            {new Date(item.bookmarkedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={[styles.loadingText, { color: theme.text }]}>Loading bookmarks...</Text>
      </View>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: isDark ? '#334155' : '#F1F5F9' }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Bookmarks</Text>
        </View>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="bookmark-outline" size={80} color="#CBD5E1" />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No saved articles yet</Text>
          <Text style={[styles.emptyText, { color: isDark ? '#94A3B8' : '#64748B' }]}>
            Start bookmarking articles to read them later
          </Text>
          <TouchableOpacity 
            style={styles.exploreButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Ionicons name="compass" size={20} color="#fff" />
            <Text style={styles.exploreButtonText}>Explore News</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: isDark ? '#334155' : '#F1F5F9' }]}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Bookmarks</Text>
          <Text style={[styles.headerSubtitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
            {bookmarks.length} saved articles
          </Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{bookmarks.length}</Text>
        </View>
      </View>

      <FlatList
        data={bookmarks}
        renderItem={renderBookmarkItem}
        keyExtractor={(item, index) => `${item.url}-${index}`}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  countBadge: {
    backgroundColor: '#6366F1',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  listContent: {
    padding: 20,
  },
  bookmarkCard: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardLeft: {
    position: 'relative',
    marginRight: 16,
  },
  numberBadge: {
    position: 'absolute',
    top: -8,
    left: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  numberText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  cardImage: {
    width: 100,
    height: 100,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  cardContent: {
    flex: 1,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  savedText: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  deleteButton: {
    padding: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardSource: {
    fontSize: 13,
    fontWeight: '500',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#94A3B8',
    marginHorizontal: 8,
  },
  cardDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});