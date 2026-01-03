import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image
} from 'react-native';
import { searchNews } from '../services/newsApi';

export default function HomeScreen({ navigation }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNews();
  }, []);

  // Keywords to filter cyber-related news
  const cyberKeywords = [
    'cyber', 'cybersecurity', 'hacking', 'hacker', 'malware', 
    'ransomware', 'data breach', 'phishing', 'security breach',
    'vulnerability', 'exploit', 'ddos', 'encryption', 'firewall',
    'zero-day', 'botnet', 'spyware', 'trojan', 'virus',
    'infosec', 'netsec', 'aptsecurity', 'threat', 'attack',
    'password', 'authentication', 'vpn', 'ssl', 'tls'
  ];

  // Function to check if article is cyber-related
  const isCyberRelated = (article) => {
    const searchText = `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase();
    
    return cyberKeywords.some(keyword => searchText.includes(keyword.toLowerCase()));
  };

  const fetchNews = async () => {
    setLoading(true);
    setError(null);

    // Search for cybersecurity news
    const result = await searchNews('cybersecurity');

    if (result.success) {
      // Filter articles that:
      // 1. Have images
      // 2. Are actually cyber-related (double-check with keywords)
      const filteredArticles = result.articles.filter(article => {
        const hasImage = article.urlToImage && article.urlToImage !== null;
        const isCyber = isCyberRelated(article);
        return hasImage && isCyber;
      });
      
      setNews(filteredArticles.slice(0, 100)); // Get first 20 filtered articles
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading cyber news...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>❌ Error: {error}</Text>
        <Text style={styles.errorHint}>
          Note: Free NewsAPI limits requests. Try again in a moment.
        </Text>
        <TouchableOpacity style={styles.button} onPress={fetchNews}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (news.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>🔍 No cyber news with images found</Text>
        <Text style={styles.emptyHint}>
          Try refreshing to load new articles
        </Text>
        <TouchableOpacity style={styles.button} onPress={fetchNews}>
          <Text style={styles.buttonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔒 CyberNews</Text>
        <Text style={styles.subtitle}>Latest cybersecurity & tech security news</Text>
        <Text style={styles.count}>{news.length} articles found</Text>
      </View>

      {news.map((article, index) => (
        <TouchableOpacity
          key={index}
          style={styles.card}
          onPress={() => navigation.navigate('ArticleDetail', { article })}
        >
          <Image
            source={{ uri: article.urlToImage }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          <View style={styles.cyberBadge}>
            <Text style={styles.cyberBadgeText}>🛡️ CYBER</Text>
          </View>
          <Text style={styles.cardTitle}>{article.title}</Text>
          <Text style={styles.cardSource}>{article.source.name}</Text>
          <Text style={styles.cardDate}>
            {new Date(article.publishedAt).toLocaleDateString()}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.refreshButton} onPress={fetchNews}>
        <Text style={styles.refreshButtonText}>🔄 Refresh News</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  count: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 22,
  },
  cardSource: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 12,
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cardImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
  },
  cyberBadge: {
    position: 'absolute',
    top: 24,
    right: 24,
    backgroundColor: 'rgba(0, 122, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cyberBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 40,
  },
  errorHint: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 40,
    fontWeight: '600',
  },
  emptyHint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 32,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});