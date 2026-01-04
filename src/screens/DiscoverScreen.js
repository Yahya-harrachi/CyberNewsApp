import React, { useState, useEffect, useContext } from 'react';
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
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { searchNews, getTopHeadlines } from '../services/newsApi';
import { ThemeContext } from '../../Context/ThemeContext';

const { width } = Dimensions.get('window');

export default function DiscoverScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trendingTopics, setTrendingTopics] = useState([]);

  const themeContext = useContext(ThemeContext);
  const mode = themeContext?.mode || 'light';
  const theme = themeContext?.theme || {
    background: '#f5f5f5',
    text: '#1a1a1a',
    card: '#ffffff',
  };
  const isDark = mode === 'dark';

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
      style={[styles.articleCard, { backgroundColor: theme.card }]}
      onPress={() => navigation.navigate('ArticleDetail', { article })}
    >
      <Image
        source={{ uri: article.urlToImage }}
        style={styles.articleImage}
        resizeMode="cover"
      />
      <View style={styles.articleContent}>
        <Text style={[styles.articleTitle, { color: theme.text }]} numberOfLines={2}>
          {article.title}
        </Text>
        <View style={styles.articleMeta}>
          <Text style={styles.articleSource}>{article.source.name}</Text>
          <Text style={[styles.articleDate, { color: isDark ? '#94A3B8' : '#999' }]}>
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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: isDark ? '#334155' : '#E5E5EA' }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>🔍 Discover</Text>
        <Text style={[styles.headerSubtitle, { color: isDark ? '#94A3B8' : '#666' }]}>
          Explore tech & security news
        </Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
          <View style={[styles.searchBar, { backgroundColor: isDark ? '#1E293B' : '#f5f5f5' }]}>
            <Ionicons name="search" size={20} color={isDark ? '#94A3B8' : '#999'} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search news, topics, sources..."
              placeholderTextColor={isDark ? '#64748B' : '#999'}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={isDark ? '#94A3B8' : '#999'} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Categories</Text>
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
                  { 
                    backgroundColor: selectedCategory === category.id ? category.color : theme.card,
                    borderColor: isDark ? '#334155' : '#E5E5EA'
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
                    { color: selectedCategory === category.id ? '#fff' : theme.text },
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
              <Text style={[styles.sectionTitle, { color: theme.text }]}>🔥 Trending Now</Text>
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
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Popular Searches</Text>
          <View style={styles.quickSearchGrid}>
            {popularSearches.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.quickSearchChip, { backgroundColor: theme.card, borderColor: isDark ? '#334155' : '#E5E5EA' }]}
                onPress={() => handleQuickSearch(item.text)}
              >
                <Ionicons name={item.icon} size={16} color="#007AFF" />
                <Text style={[styles.quickSearchText, { color: theme.text }]}>{item.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Articles List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {searchQuery ? `Results for "${searchQuery}"` : 'Latest Articles'}
          </Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={[styles.loadingText, { color: isDark ? '#94A3B8' : '#666' }]}>
                Loading articles...
              </Text>
            </View>
          ) : articles.length > 0 ? (
            <View style={styles.articlesGrid}>
              {articles.map((article, index) => renderArticleCard(article, index))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="documents-outline" size={60} color="#ccc" />
              <Text style={[styles.emptyText, { color: isDark ? '#94A3B8' : '#666' }]}>
                No articles found
              </Text>
              <Text style={[styles.emptyHint, { color: isDark ? '#64748B' : '#999' }]}>
                Try a different search term
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
  headerSubtitle: { fontSize: 14 },
  scrollContent: { paddingBottom: 20 },
  searchContainer: { paddingHorizontal: 16, paddingVertical: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, height: 44 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16 },
  section: { marginTop: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '700', paddingHorizontal: 16, marginBottom: 12 },
  seeAllText: { fontSize: 14, color: '#007AFF', fontWeight: '600' },
  categoriesScroll: { paddingHorizontal: 16 },
  categoryChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, marginRight: 10, borderRadius: 20, borderWidth: 1 },
  categoryText: { marginLeft: 6, fontSize: 14, fontWeight: '600' },
  trendingScroll: { paddingLeft: 16 },
  trendingCard: { width: width * 0.7, height: 200, marginRight: 12, borderRadius: 12, overflow: 'hidden', backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  trendingImage: { width: '100%', height: '100%' },
  trendingOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12, backgroundColor: 'rgba(0, 0, 0, 0.7)' },
  trendingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.2)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginBottom: 8 },
  trendingBadgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold', marginLeft: 4 },
  trendingTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  trendingSource: { fontSize: 12, color: 'rgba(255, 255, 255, 0.8)' },
  quickSearchGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8 },
  quickSearchChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1 },
  quickSearchText: { fontSize: 13, marginLeft: 6, fontWeight: '500' },
  articlesGrid: { paddingHorizontal: 16 },
  articleCard: { flexDirection: 'row', borderRadius: 12, marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  articleImage: { width: 100, height: 100 },
  articleContent: { flex: 1, padding: 12, justifyContent: 'space-between' },
  articleTitle: { fontSize: 14, fontWeight: '600', lineHeight: 18 },
  articleMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  articleSource: { fontSize: 12, color: '#007AFF', fontWeight: '500' },
  articleDate: { fontSize: 11 },
  loadingContainer: { padding: 40, alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14 },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 18, fontWeight: '600', marginTop: 12 },
  emptyHint: { fontSize: 14, marginTop: 4 },
});