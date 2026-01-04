import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { searchNews, getTopHeadlines } from '../services/newsApi';

const { width } = Dimensions.get('window');

export default function DiscoverScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trendingTopics, setTrendingTopics] = useState([]);

  const categories = [
    { id: 'all', name: 'All', icon: 'apps', color: '#007AFF' },
    { id: 'cybersecurity', name: 'Cyber', icon: 'shield-checkmark', color: '#FF3B30' },
    { id: 'ai', name: 'AI', icon: 'bulb', color: '#FF9500' },
    { id: 'blockchain', name: 'Blockchain', icon: 'link', color: '#34C759' },
    { id: 'privacy', name: 'Privacy', icon: 'eye-off', color: '#5856D6' },
    { id: 'cloud', name: 'Cloud', icon: 'cloud', color: '#00C7BE' },
  ];

  const popularSearches = [
    { id: 1, text: 'Zero-day exploits', icon: 'bug' },
    { id: 2, text: 'Data breaches', icon: 'alert-circle' },
    { id: 3, text: 'Ransomware', icon: 'lock-closed' },
    { id: 4, text: 'IoT security', icon: 'wifi' },
    { id: 5, text: 'Quantum computing', icon: 'nuclear' },
    { id: 6, text: '5G security', icon: 'cellular' },
  ];

  useEffect(() => {
    loadTrendingTopics();
    if (selectedCategory === 'all') {
      loadAllNews();
    } else {
      searchByCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const loadTrendingTopics = async () => {
    const result = await searchNews('trending technology');
    if (result.success) {
      setTrendingTopics(result.articles.slice(0, 5));
    }
  };

  const loadAllNews = async () => {
    setLoading(true);
    const result = await getTopHeadlines('us', 'technology');
    if (result.success) {
      setArticles(result.articles.filter(a => a.urlToImage).slice(0, 20));
    }
    setLoading(false);
  };

  const searchByCategory = async (category) => {
    setLoading(true);
    const result = await searchNews(category);
    if (result.success) {
      setArticles(result.articles.filter(a => a.urlToImage).slice(0, 20));
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    const result = await searchNews(searchQuery);
    if (result.success) {
      setArticles(result.articles.filter(a => a.urlToImage));
    }
    setLoading(false);
  };

  const handleQuickSearch = (searchTerm) => {
    setSearchQuery(searchTerm);
    setLoading(true);
    searchNews(searchTerm).then(result => {
      if (result.success) {
        setArticles(result.articles.filter(a => a.urlToImage));
      }
      setLoading(false);
    });
  };

  const renderTrendingCard = (article, index) => (
    <TouchableOpacity
      key={index}
      style={styles.trendingCard}
      onPress={() => navigation.navigate('ArticleDetail', { article })}
    >
      <Image
        source={{ uri: article.urlToImage }}
        style={styles.trendingImage}
        resizeMode="cover"
      />
      <View style={styles.trendingOverlay}>
        <View style={styles.trendingBadge}>
          <Ionicons name="flame" size={14} color="#FF3B30" />
          <Text style={styles.trendingBadgeText}>Trending #{index + 1}</Text>
        </View>
        <Text style={styles.trendingTitle} numberOfLines={2}>
          {article.title}
        </Text>
        <Text style={styles.trendingSource}>{article.source.name}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderArticleCard = (article, index) => (
    <TouchableOpacity
      key={index}
      style={styles.articleCard}
      onPress={() => navigation.navigate('ArticleDetail', { article })}
    >
      <Image
        source={{ uri: article.urlToImage }}
        style={styles.articleImage}
        resizeMode="cover"
      />
      <View style={styles.articleContent}>
        <Text style={styles.articleTitle} numberOfLines={2}>
          {article.title}
        </Text>
        <View style={styles.articleMeta}>
          <Text style={styles.articleSource}>{article.source.name}</Text>
          <Text style={styles.articleDate}>
            {new Date(article.publishedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔍 Discover</Text>
        <Text style={styles.headerSubtitle}>Explore tech & security news</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search news, topics, sources..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && {
                    backgroundColor: category.color,
                  },
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Ionicons
                  name={category.icon}
                  size={18}
                  color={selectedCategory === category.id ? '#fff' : category.color}
                />
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category.id && styles.categoryTextActive,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Trending Topics */}
        {trendingTopics.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🔥 Trending Now</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.trendingScroll}
            >
              {trendingTopics.map((article, index) => renderTrendingCard(article, index))}
            </ScrollView>
          </View>
        )}

        {/* Quick Search Topics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Searches</Text>
          <View style={styles.quickSearchGrid}>
            {popularSearches.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.quickSearchChip}
                onPress={() => handleQuickSearch(item.text)}
              >
                <Ionicons name={item.icon} size={16} color="#007AFF" />
                <Text style={styles.quickSearchText}>{item.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Articles List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {searchQuery ? `Results for "${searchQuery}"` : 'Latest Articles'}
          </Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Loading articles...</Text>
            </View>
          ) : articles.length > 0 ? (
            <View style={styles.articlesGrid}>
              {articles.map((article, index) => renderArticleCard(article, index))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="documents-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No articles found</Text>
              <Text style={styles.emptyHint}>Try a different search term</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1a1a1a',
  },
  section: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  categoriesScroll: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  categoryTextActive: {
    color: '#fff',
  },
  trendingScroll: {
    paddingLeft: 16,
  },
  trendingCard: {
    width: width * 0.7,
    height: 200,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trendingImage: {
    width: '100%',
    height: '100%',
  },
  trendingOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  trendingBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  trendingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  trendingSource: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  quickSearchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },
  quickSearchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  quickSearchText: {
    fontSize: 13,
    color: '#1a1a1a',
    marginLeft: 6,
    fontWeight: '500',
  },
  articlesGrid: {
    paddingHorizontal: 16,
  },
  articleCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  articleImage: {
    width: 100,
    height: 100,
  },
  articleContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  articleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    lineHeight: 18,
  },
  articleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  articleSource: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  articleDate: {
    fontSize: 11,
    color: '#999',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
  },
  emptyHint: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
});