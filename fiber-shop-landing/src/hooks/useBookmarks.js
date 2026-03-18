import { useState, useEffect } from 'react';

const BOOKMARKS_KEY = 'fiberagent_bookmarks';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    const loadBookmarks = () => {
      try {
        const stored = localStorage.getItem(BOOKMARKS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setBookmarks(Array.isArray(parsed) ? parsed : []);
        } else {
          setBookmarks([]);
        }
      } catch (error) {
        console.error('Error loading bookmarks:', error);
        setBookmarks([]);
      }
      setIsLoaded(true);
    };

    loadBookmarks();
  }, []);

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
      } catch (error) {
        console.error('Error saving bookmarks:', error);
      }
    }
  }, [bookmarks, isLoaded]);

  // Check if product is bookmarked
  const isBookmarked = (productId) => {
    return bookmarks.some(b => b.id === productId);
  };

  // Add or toggle bookmark
  const toggleBookmark = (product) => {
    setBookmarks(prevBookmarks => {
      const isCurrentlyBookmarked = prevBookmarks.some(b => b.id === product.id);

      if (isCurrentlyBookmarked) {
        // Remove bookmark
        return prevBookmarks.filter(b => b.id !== product.id);
      } else {
        // Add bookmark
        return [
          ...prevBookmarks,
          {
            id: product.id,
            title: product.title,
            price: product.price,
            merchant: product.merchant,
            image: product.image,
            cashback_rate: product.cashback_rate,
            cashback_amount: product.cashback_amount,
            affiliate_link: product.affiliate_link,
            savedAt: new Date().toISOString(),
          },
        ];
      }
    });
  };

  // Add multiple bookmarks
  const addBookmarks = (products) => {
    setBookmarks(prevBookmarks => {
      const newBookmarks = products.filter(
        p => !prevBookmarks.some(b => b.id === p.id)
      );

      const formattedNew = newBookmarks.map(p => ({
        id: p.id,
        title: p.title,
        price: p.price,
        merchant: p.merchant,
        image: p.image,
        cashback_rate: p.cashback_rate,
        cashback_amount: p.cashback_amount,
        affiliate_link: p.affiliate_link,
        savedAt: new Date().toISOString(),
      }));

      return [...prevBookmarks, ...formattedNew];
    });
  };

  // Remove bookmark
  const removeBookmark = (productId) => {
    setBookmarks(prevBookmarks =>
      prevBookmarks.filter(b => b.id !== productId)
    );
  };

  // Clear all bookmarks
  const clearBookmarks = () => {
    setBookmarks([]);
  };

  // Get all bookmarks
  const getBookmarks = () => {
    return bookmarks;
  };

  // Get bookmark count
  const getBookmarkCount = () => {
    return bookmarks.length;
  };

  return {
    bookmarks,
    isLoaded,
    isBookmarked,
    toggleBookmark,
    addBookmarks,
    removeBookmark,
    clearBookmarks,
    getBookmarks,
    getBookmarkCount,
  };
}
