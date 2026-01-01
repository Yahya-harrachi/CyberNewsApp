import axios from 'axios';
import { API_KEY, BASE_URL, ENDPOINTS } from '../config';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch top headlines (Breaking News)
 * @param {string} country - Country code (e.g., 'us', 'ma')
 * @param {string} category - Category (e.g., 'sports', 'technology')
 * @returns {Promise} - News articles
 */
export const getTopHeadlines = async (country = 'us', category = '') => {
  try {
    const params = {
      apiKey: API_KEY,
      country: country,
      pageSize: 20, // Number of articles to fetch
    };

    if (category) {
      params.category = category;
    }

    const response = await api.get(ENDPOINTS.TOP_HEADLINES, { params });
    
    if (response.data.status === 'ok') {
      return {
        success: true,
        articles: response.data.articles,
        totalResults: response.data.totalResults,
      };
    } else {
      return {
        success: false,
        error: 'Failed to fetch news',
      };
    }
  } catch (error) {
    console.error('Error fetching top headlines:', error);
    return {
      success: false,
      error: error.message || 'Network error',
    };
  }
};

/**
 * Search news by keyword
 * @param {string} query - Search keyword
 * @returns {Promise} - News articles
 */
export const searchNews = async (query) => {
  try {
    const response = await api.get(ENDPOINTS.EVERYTHING, {
      params: {
        apiKey: API_KEY,
        q: query,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 20,
      },
    });

    if (response.data.status === 'ok') {
      return {
        success: true,
        articles: response.data.articles,
        totalResults: response.data.totalResults,
      };
    } else {
      return {
        success: false,
        error: 'Failed to search news',
      };
    }
  } catch (error) {
    console.error('Error searching news:', error);
    return {
      success: false,
      error: error.message || 'Network error',
    };
  }
};

/**
 * Fetch news by category
 * @param {string} category - Category name
 * @returns {Promise} - News articles
 */
export const getNewsByCategory = async (category) => {
  return await getTopHeadlines('us', category);
};

/**
 * Fetch news by multiple categories
 * @param {array} categories - Array of category names
 * @returns {Promise} - Object with articles grouped by category
 */
export const getNewsByCategories = async (categories) => {
  try {
    const promises = categories.map(category => getNewsByCategory(category));
    const results = await Promise.all(promises);
    
    const categorizedNews = {};
    categories.forEach((category, index) => {
      categorizedNews[category] = results[index];
    });
    
    return {
      success: true,
      data: categorizedNews,
    };
  } catch (error) {
    console.error('Error fetching categorized news:', error);
    return {
      success: false,
      error: error.message || 'Network error',
    };
  }
};