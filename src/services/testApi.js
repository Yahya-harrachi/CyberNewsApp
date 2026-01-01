import { getTopHeadlines, searchNews, getNewsByCategory } from './newsApi';

// Test function
export const testAPI = async () => {
  console.log('🧪 Testing News API...\n');

  // Test 1: Get top headlines
  console.log('📰 Test 1: Fetching top headlines...');
  const headlines = await getTopHeadlines('us');
  console.log('Result:', headlines.success ? '✅ Success' : '❌ Failed');
  if (headlines.success) {
    console.log(`Found ${headlines.articles.length} articles`);
    console.log('First article:', headlines.articles[0].title);
  }
  console.log('\n');

  // Test 2: Search news
  console.log('🔍 Test 2: Searching for "technology"...');
  const searchResults = await searchNews('technology');
  console.log('Result:', searchResults.success ? '✅ Success' : '❌ Failed');
  if (searchResults.success) {
    console.log(`Found ${searchResults.articles.length} articles`);
  }
  console.log('\n');

  // Test 3: Get sports news
  console.log('⚽ Test 3: Fetching sports news...');
  const sportsNews = await getNewsByCategory('sports');
  console.log('Result:', sportsNews.success ? '✅ Success' : '❌ Failed');
  if (sportsNews.success) {
    console.log(`Found ${sportsNews.articles.length} articles`);
  }
  console.log('\n');

  console.log('✅ API Testing Complete!');
};