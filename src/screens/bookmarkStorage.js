import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKMARKS_KEY = '@cybernews_bookmarks';

/**
 * Fetch all bookmarked articles from local storage
 * @returns {Promise<Array>} - Array of bookmarked articles
 */
export async function fetchBookmarksFromStorage() {
    try {
        const bookmarksJson = await AsyncStorage.getItem(BOOKMARKS_KEY);
        if (bookmarksJson) {
            return JSON.parse(bookmarksJson);
        }
        return [];
    } catch (error) {
        console.error("Error fetching bookmarks:", error);
        return [];
    }
}

/**
 * Add an article to bookmarks
 * @param {object} article - Article object to bookmark
 * @returns {Promise<void>}
 */
export async function addBookmarkToStorage(article) {
    try {
        const bookmarks = await fetchBookmarksFromStorage();
        
        // Check if article is already bookmarked
        const exists = bookmarks.some(b => b.url === article.url);
        if (exists) {
            return;
        }
        
        // Add bookmark with timestamp
        const newBookmark = {
            ...article,
            bookmarkedAt: Date.now(),
        };
        
        const updatedBookmarks = [newBookmark, ...bookmarks];
        await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
    } catch (error) {
        console.error("Error adding bookmark:", error);
        throw error;
    }
}

/**
 * Remove an article from bookmarks
 * @param {string} articleUrl - Article URL
 * @returns {Promise<void>}
 */
export async function removeBookmarkFromStorage(articleUrl) {
    try {
        const bookmarks = await fetchBookmarksFromStorage();
        const updatedBookmarks = bookmarks.filter(b => b.url !== articleUrl);
        await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
    } catch (error) {
        console.error("Error removing bookmark:", error);
        throw error;
    }
}

/**
 * Check if an article is bookmarked
 * @param {string} articleUrl - Article URL
 * @returns {Promise<boolean>} - True if bookmarked, false otherwise
 */
export async function isArticleBookmarked(articleUrl) {
    try {
        const bookmarks = await fetchBookmarksFromStorage();
        return bookmarks.some(b => b.url === articleUrl);
    } catch (error) {
        console.error("Error checking bookmark:", error);
        return false;
    }
}

/**
 * Clear all bookmarks
 * @returns {Promise<void>}
 */
export async function clearAllBookmarks() {
    try {
        await AsyncStorage.removeItem(BOOKMARKS_KEY);
    } catch (error) {
        console.error("Error clearing bookmarks:", error);
        throw error;
    }
}