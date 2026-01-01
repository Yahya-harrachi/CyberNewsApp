// Mock news data for development and testing
export const mockBreakingNews = [
  {
    id: '1',
    source: { name: 'CNN' },
    author: 'John Doe',
    title: 'Alexander wears modified helmet in road races',
    description: 'As a tech department, we\'re visually pretty good at spotting tech that\'s out of the ordinary.',
    url: 'https://example.com/article1',
    urlToImage: 'https://via.placeholder.com/400x250/007AFF/FFFFFF?text=Breaking+News+1',
    publishedAt: '2024-01-15T10:30:00Z',
    content: 'Full article content here...',
  },
  {
    id: '2',
    source: { name: 'BBC News' },
    author: 'Jane Smith',
    title: '6 Houses Destroyed in Massive Fire in Assam\'s K.',
    description: 'Breaking news about a massive fire incident in Assam region.',
    url: 'https://example.com/article2',
    urlToImage: 'https://via.placeholder.com/400x250/FF3B30/FFFFFF?text=Breaking+News+2',
    publishedAt: '2024-01-15T09:15:00Z',
    content: 'Full article content here...',
  },
  {
    id: '3',
    source: { name: 'Reuters' },
    author: 'Mike Johnson',
    title: 'At least 25 people killed in Algeria-Morocco tension',
    description: 'Latest updates on the situation in North Africa.',
    url: 'https://example.com/article3',
    urlToImage: 'https://via.placeholder.com/400x250/34C759/FFFFFF?text=Breaking+News+3',
    publishedAt: '2024-01-15T08:00:00Z',
    content: 'Full article content here...',
  },
];

export const mockRecommendations = [
  {
    id: '4',
    source: { name: 'Sports Network' },
    author: 'Sarah Williams',
    title: 'What Training Do Volleyball Players Need?',
    description: 'Essential training routines for volleyball professionals.',
    url: 'https://example.com/article4',
    urlToImage: 'https://via.placeholder.com/80x80/FF9500/FFFFFF?text=Sport',
    publishedAt: '2024-01-14T15:20:00Z',
    content: 'Full article content here...',
    category: 'Sports',
  },
  {
    id: '5',
    source: { name: 'Education Today' },
    author: 'Robert Brown',
    title: 'Secondary school places: When do parents find out?',
    description: 'Important dates for school admission results.',
    url: 'https://example.com/article5',
    urlToImage: 'https://via.placeholder.com/80x80/5856D6/FFFFFF?text=Education',
    publishedAt: '2024-01-14T14:10:00Z',
    content: 'Full article content here...',
    category: 'Education',
  },
];

export const mockCategories = [
  { id: '1', name: 'All', icon: 'apps' },
  { id: '2', name: 'Politics', icon: 'briefcase' },
  { id: '3', name: 'Sports', icon: 'football' },
  { id: '4', name: 'Education', icon: 'school' },
  { id: '5', name: 'Technology', icon: 'laptop' },
  { id: '6', name: 'Health', icon: 'fitness' },
];

// Function to get mock data with delay (simulate API call)
export const getMockBreakingNews = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        articles: mockBreakingNews,
        totalResults: mockBreakingNews.length,
      });
    }, 1000); // 1 second delay
  });
};

export const getMockRecommendations = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        articles: mockRecommendations,
        totalResults: mockRecommendations.length,
      });
    }, 1000);
  });
};