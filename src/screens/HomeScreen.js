import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  RefreshControl,
  Dimensions,
  StatusBar,
  Modal,
  Animated,
  Switch,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { searchNews } from '../services/newsApi';
import { AuthContext } from '../../Context/AuthContext';
import { ThemeContext } from '../../Context/ThemeContext';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(-300))[0];

  const { user, logout } = useContext(AuthContext);
  
  // Safe theme context with fallback
  const themeContext = useContext(ThemeContext);
  const mode = themeContext?.mode || 'light';
  const theme = themeContext?.theme || {
    background: '#FAFAFA',
    text: '#1E293B',
    card: '#ffffff',
    primary: '#6366F1',
  };
  const toggleTheme = themeContext?.toggleTheme || (() => {
    Alert.alert('Theme Error', 'Theme provider not configured');
  });

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    if (sidebarVisible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [sidebarVisible]);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    const result = await searchNews('cybersecurity');
    if (result.success) {
      const filteredArticles = result.articles.filter(
        article => article.urlToImage && article.urlToImage !== null
      );
      setNews(filteredArticles.slice(0, 20));
    } else {
      setError(result.error);
    }
    setLoading(false);
    setRefreshing(false);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNews();
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleLogout = () => {
    setSidebarVisible(false);
    setTimeout(async () => {
      try {
        await logout();
      } catch (error) {
        console.error('Logout error:', error);
      }
    }, 300);
  };

  const getInitials = () => {
    if (user?.displayName) {
      return user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const isDark = mode === 'dark';

  if (loading && !refreshing) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={[styles.loadingText, { color: theme.text }]}>Loading latest news...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <View style={styles.errorIcon}>
          <Ionicons name="cloud-offline-outline" size={64} color="#EF4444" />
        </View>
        <Text style={[styles.errorText, { color: theme.text }]}>Oops! Something went wrong</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchNews}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.greeting, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}
            </Text>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Stay Secure 🛡️</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={() => setSidebarVisible(true)}>
            <View style={styles.profileIcon}>
              {user?.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
              ) : (
                <Text style={styles.profileInitials}>{getInitials()}</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#6366F1" />
        }
      >
        <View style={styles.trendingBadge}>
          <Ionicons name="flame" size={16} color="#EF4444" />
          <Text style={styles.trendingText}>Trending Now</Text>
        </View>

        {news[0] && (
          <TouchableOpacity 
            style={styles.heroCard}
            activeOpacity={0.95}
            onPress={() => navigation.navigate('ArticleDetail', { article: news[0] })}
          >
            <Image source={{ uri: news[0].urlToImage }} style={styles.heroImage} resizeMode="cover" />
            <View style={styles.heroOverlay}>
              <View style={styles.heroTop}>
                <View style={styles.liveBadge}>
                  <View style={styles.liveIndicator} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              </View>
              <View style={styles.heroBottom}>
                <View style={styles.categoryPill}>
                  <Ionicons name="shield-checkmark" size={14} color="#fff" />
                  <Text style={styles.categoryText}>Cybersecurity</Text>
                </View>
                <Text style={styles.heroTitle} numberOfLines={3}>{news[0].title}</Text>
                <View style={styles.heroMeta}>
                  <View style={styles.sourceInfo}>
                    <View style={styles.sourceDot} />
                    <Text style={styles.heroSource}>{news[0].source.name}</Text>
                  </View>
                  <Text style={styles.heroTime}>{formatTimeAgo(news[0].publishedAt)}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Latest Stories</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{news.length - 1}</Text>
            </View>
          </View>

          {news.slice(1, 15).map((article, index) => (
            <TouchableOpacity 
              key={`${article.url}-${index}`}
              style={[styles.storyCard, { backgroundColor: theme.card }]}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('ArticleDetail', { article })}
            >
              <View style={styles.storyLeft}>
                <View style={[styles.storyNumber, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
                  <Text style={[styles.numberText, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                    {(index + 1).toString().padStart(2, '0')}
                  </Text>
                </View>
                <View style={styles.storyInfo}>
                  <View style={styles.storyTags}>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>Security</Text>
                    </View>
                    <Text style={styles.storyTime}>{formatTimeAgo(article.publishedAt)}</Text>
                  </View>
                  <Text style={[styles.storyTitle, { color: theme.text }]} numberOfLines={2}>
                    {article.title}
                  </Text>
                  <Text style={[styles.storySource, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                    {article.source.name}
                  </Text>
                </View>
              </View>
              <Image source={{ uri: article.urlToImage }} style={styles.storyImage} resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal visible={sidebarVisible} transparent={true} animationType="none" onRequestClose={() => setSidebarVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSidebarVisible(false)}>
          <Animated.View 
            style={[styles.sidebar, { backgroundColor: theme.card, transform: [{ translateX: slideAnim }] }]}
            onStartShouldSetResponder={() => true}
          >
            <View style={[styles.sidebarHeader, { borderBottomColor: isDark ? '#334155' : '#E2E8F0' }]}>
              <View style={styles.userInfo}>
                <View style={styles.sidebarAvatar}>
                  {user?.photoURL ? (
                    <Image source={{ uri: user.photoURL }} style={styles.sidebarAvatarImage} />
                  ) : (
                    <Text style={styles.sidebarAvatarText}>{getInitials()}</Text>
                  )}
                </View>
                <View style={styles.userDetails}>
                  <Text style={[styles.userName, { color: theme.text }]}>{user?.displayName || 'User'}</Text>
                  <Text style={[styles.userEmail, { color: isDark ? '#94A3B8' : '#64748B' }]}>{user?.email}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={() => setSidebarVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.sidebarContent}>
              <View style={[styles.menuSection, { borderBottomColor: isDark ? '#334155' : '#E2E8F0' }]}>
                <Text style={[styles.sectionLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>APPEARANCE</Text>
                <View style={styles.menuItem}>
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.menuIconContainer, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}>
                      <Ionicons name={isDark ? "moon" : "sunny"} size={20} color={isDark ? "#FBBF24" : "#F59E0B"} />
                    </View>
                    <View style={styles.menuItemText}>
                      <Text style={[styles.menuItemTitle, { color: theme.text }]}>Dark Mode</Text>
                      <Text style={[styles.menuItemSubtitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                        {isDark ? 'Enabled' : 'Disabled'}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={isDark}
                    onValueChange={toggleTheme}
                    trackColor={{ false: '#CBD5E1', true: '#6366F1' }}
                    thumbColor={isDark ? '#fff' : '#f4f3f4'}
                    ios_backgroundColor="#CBD5E1"
                  />
                </View>
              </View>

              <View style={[styles.menuSection, { borderBottomColor: isDark ? '#334155' : '#E2E8F0' }]}>
                <Text style={[styles.sectionLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>MENU</Text>
                
                <TouchableOpacity style={styles.menuItem} onPress={() => { setSidebarVisible(false); navigation.navigate('Profile'); }}>
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.menuIconContainer, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}>
                      <Ionicons name="person-outline" size={20} color="#6366F1" />
                    </View>
                    <View style={styles.menuItemText}>
                      <Text style={[styles.menuItemTitle, { color: theme.text }]}>Profile</Text>
                      <Text style={[styles.menuItemSubtitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                        View and edit profile
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={isDark ? '#64748B' : '#94A3B8'} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => { setSidebarVisible(false); navigation.navigate('Bookmarks'); }}>
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.menuIconContainer, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}>
                      <Ionicons name="bookmark-outline" size={20} color="#FBBF24" />
                    </View>
                    <View style={styles.menuItemText}>
                      <Text style={[styles.menuItemTitle, { color: theme.text }]}>Bookmarks</Text>
                      <Text style={[styles.menuItemSubtitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>Saved articles</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={isDark ? '#64748B' : '#94A3B8'} />
                </TouchableOpacity>
              </View>

              <View style={styles.menuSection}>
                <TouchableOpacity 
                  style={[styles.logoutButton, { backgroundColor: isDark ? '#1E293B' : '#FEF2F2' }]}
                  onPress={handleLogout}
                >
                  <Ionicons name="log-out-outline" size={22} color="#EF4444" />
                  <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={[styles.sidebarFooter, { borderTopColor: isDark ? '#334155' : '#E2E8F0' }]}>
              <View style={styles.appInfo}>
                <Ionicons name="shield-checkmark" size={20} color="#6366F1" />
                <Text style={[styles.appInfoText, { color: isDark ? '#94A3B8' : '#64748B' }]}>CyberNews v2.1.0</Text>
              </View>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 16, fontSize: 16, fontWeight: '500' },
  errorIcon: { marginBottom: 16 },
  errorText: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  errorSubtext: { fontSize: 14, color: '#94A3B8', textAlign: 'center', marginBottom: 24, paddingHorizontal: 40 },
  retryButton: { backgroundColor: '#6366F1', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  retryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  headerTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  profileButton: { padding: 4 },
  profileIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  profileImage: { width: 44, height: 44, borderRadius: 22 },
  profileInitials: { fontSize: 16, fontWeight: '700', color: '#6366F1' },
  scrollContent: { paddingTop: 20, paddingBottom: 30 },
  trendingBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginLeft: 20, marginBottom: 16, backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
  trendingText: { color: '#EF4444', fontSize: 13, fontWeight: '700', letterSpacing: 0.3 },
  heroCard: { marginHorizontal: 20, height: 380, borderRadius: 24, overflow: 'hidden', backgroundColor: '#000', shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.3, shadowRadius: 24, elevation: 12 },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: 24, justifyContent: 'space-between' },
  heroTop: { alignItems: 'flex-end' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.9)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, gap: 6 },
  liveIndicator: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  liveText: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  heroBottom: { gap: 12 },
  categoryPill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: 'rgba(99, 102, 241, 0.95)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, gap: 6 },
  categoryText: { color: '#fff', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: '800', lineHeight: 34, letterSpacing: -0.5, textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 },
  heroMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sourceInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sourceDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  heroSource: { color: '#fff', fontSize: 15, fontWeight: '600' },
  heroTime: { color: 'rgba(255, 255, 255, 0.9)', fontSize: 14, fontWeight: '500' },
  section: { marginTop: 32 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  countBadge: { backgroundColor: '#6366F1', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  countText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  storyCard: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 16, borderRadius: 20, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
  storyLeft: { flex: 1, flexDirection: 'row', gap: 14, marginRight: 16 },
  storyNumber: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  numberText: { fontSize: 15, fontWeight: '800' },
  storyInfo: { flex: 1, gap: 8 },
  storyTags: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tag: { backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText: { color: '#6366F1', fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  storyTime: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
  storyTitle: { fontSize: 16, fontWeight: '700', lineHeight: 22, letterSpacing: -0.3 },
  storySource: { fontSize: 13, fontWeight: '500' },
  storyImage: { width: 100, height: 100, borderRadius: 16, backgroundColor: '#F1F5F9' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  sidebar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 300, shadowColor: '#000', shadowOffset: { width: 2, height: 0 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 10 },
  sidebarHeader: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, borderBottomWidth: 1 },
  userInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sidebarAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center', marginRight: 12, overflow: 'hidden' },
  sidebarAvatarImage: { width: 56, height: 56, borderRadius: 28 },
  sidebarAvatarText: { fontSize: 20, fontWeight: '700', color: '#fff' },
  userDetails: { flex: 1 },
  userName: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  userEmail: { fontSize: 13, fontWeight: '500' },
  closeButton: { position: 'absolute', top: 50, right: 20, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  sidebarContent: { flex: 1 },
  menuSection: { paddingVertical: 20, paddingHorizontal: 20, borderBottomWidth: 1 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  menuIconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  menuItemText: { flex: 1 },
  menuItemTitle: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  menuItemSubtitle: { fontSize: 12, fontWeight: '500' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 14, borderRadius: 12 },
  logoutButtonText: { color: '#EF4444', fontSize: 16, fontWeight: '700' },
  sidebarFooter: { paddingVertical: 16, paddingHorizontal: 20, borderTopWidth: 1 },
  appInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  appInfoText: { fontSize: 12, fontWeight: '500' },
});