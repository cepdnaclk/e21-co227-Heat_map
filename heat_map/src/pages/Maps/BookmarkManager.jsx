import React, { useState, useEffect, useCallback } from 'react';
import buildingApiService from './buildingApi';

// Bookmark Icon Component
const BookmarkIcon = ({ filled = false, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 22 22" style={{ verticalAlign: 'middle' }}>
    <path
      d="M6 3.5A2.5 2.5 0 0 1 8.5 1h5A2.5 2.5 0 0 1 16 3.5v15.2a.7.7 0 0 1-1.1.6l-4.4-2.7-4.4 2.7A.7.7 0 0 1 6 18.7V3.5z"
      fill={filled ? "#2563eb" : "none"}
      stroke="#2563eb"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

// Bookmark Manager Hook
export const useBookmarkManager = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isBookmarkSidebarOpen, setIsBookmarkSidebarOpen] = useState(false);

  // Cookie helpers for bookmark persistence
  const COOKIE_KEY = "iem_bookmarks";
  
  const getCookie = (name) => {
    if (typeof document === "undefined") return "";
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return "";
  };

  const setCookie = (name, value, days = 365) => {
    if (typeof document === "undefined") return;
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
  };

  const readBookmarks = useCallback(() => {
    try {
      const raw = getCookie(COOKIE_KEY);
      if (!raw) return [];
      return JSON.parse(decodeURIComponent(raw));
    } catch {
      return [];
    }
  }, []);

  const writeBookmarks = useCallback((bookmarks) => {
    try {
      const serialized = encodeURIComponent(JSON.stringify(bookmarks));
      setCookie(COOKIE_KEY, serialized);
    } catch {
      // ignore write errors
    }
  }, []);

  const isBookmarked = useCallback((id) => {
    return bookmarks.some((b) => String(b.id) === String(id));
  }, [bookmarks]);

  const addBookmark = useCallback((item) => {
    const bookmarkData = {
      id: item.id,
      name: item.name,
      category: item.category || item.type,
      description: item.description,
      buildingId: item.buildingId,
      buildingName: item.buildingName,
      svgBuildingId: item.svgBuildingId,
      coordinates: item.coordinates,
      addedAt: new Date().toISOString()
    };

    const currentBookmarks = readBookmarks();
    const exists = currentBookmarks.some((b) => String(b.id) === String(bookmarkData.id));
    
    if (!exists) {
      const newBookmarks = [...currentBookmarks, bookmarkData];
      writeBookmarks(newBookmarks);
      setBookmarks(newBookmarks);
      
      // Show notification
      showNotification(`"${bookmarkData.name}" added to bookmarks`, 'success');
    }
  }, [readBookmarks, writeBookmarks]);

  const removeBookmark = useCallback((id) => {
    const currentBookmarks = readBookmarks();
    const bookmarkToRemove = currentBookmarks.find(b => String(b.id) === String(id));
    const newBookmarks = currentBookmarks.filter((b) => String(b.id) !== String(id));
    
    writeBookmarks(newBookmarks);
    setBookmarks(newBookmarks);
    
    if (bookmarkToRemove) {
      showNotification(`"${bookmarkToRemove.name}" removed from bookmarks`, 'info');
    }
  }, [readBookmarks, writeBookmarks]);

  const toggleBookmark = useCallback((item) => {
    if (isBookmarked(item.id)) {
      removeBookmark(item.id);
    } else {
      addBookmark(item);
    }
  }, [isBookmarked, addBookmark, removeBookmark]);

  const clearAllBookmarks = useCallback(() => {
    writeBookmarks([]);
    setBookmarks([]);
    showNotification('All bookmarks cleared', 'info');
  }, [writeBookmarks]);

  const showNotification = useCallback((message, type = 'success') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 3000);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Load bookmarks on mount
  useEffect(() => {
    const savedBookmarks = readBookmarks();
    setBookmarks(savedBookmarks);
  }, [readBookmarks]);

  // Expose global functions for MapExtra integration
  useEffect(() => {
    window.addBookmark = addBookmark;
    window.removeBookmark = removeBookmark;
    window.isBookmarked = isBookmarked;
    
    return () => {
      delete window.addBookmark;
      delete window.removeBookmark;
      delete window.isBookmarked;
    };
  }, [addBookmark, removeBookmark, isBookmarked]);

  return {
    bookmarks,
    notifications,
    isBookmarkSidebarOpen,
    setIsBookmarkSidebarOpen,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    isBookmarked,
    clearAllBookmarks,
    showNotification,
    removeNotification
  };
};

// Bookmark Sidebar Component
export const BookmarkSidebar = ({ 
  bookmarks, 
  isOpen, 
  onClose, 
  onBookmarkClick, 
  onRemoveBookmark, 
  onClearAll,
  categories = {}
}) => {
  if (!isOpen) return null;

  return (
    <div className="bookmark-sidebar-overlay" onClick={onClose}>
      <div className="bookmark-sidebar" onClick={(e) => e.stopPropagation()}>
        <div className="bookmark-sidebar-header">
          <h3 className="bookmark-sidebar-title">
            Bookmarks
            <span className="bookmark-count">{bookmarks.length}</span>
          </h3>
          <button className="bookmark-sidebar-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="bookmark-sidebar-content">
          {bookmarks.length === 0 ? (
            <div className="bookmark-empty">
              <BookmarkIcon size={48} />
              <p>No bookmarks yet</p>
              <small>Bookmark buildings and exhibits to see them here</small>
            </div>
          ) : (
            <>
              <div className="bookmark-actions">
                <button 
                  className="bookmark-clear-all-btn"
                  onClick={onClearAll}
                  disabled={bookmarks.length === 0}
                >
                  Clear All
                </button>
              </div>
              
              <div className="bookmark-list">
                {bookmarks.map((bookmark) => (
                  <div key={bookmark.id} className="bookmark-item">
                    <div 
                      className="bookmark-item-content"
                      onClick={() => onBookmarkClick(bookmark)}
                    >
                      <div className="bookmark-item-header">
                        <span 
                          className="bookmark-category-dot"
                          style={{ 
                            backgroundColor: categories[bookmark.category] || '#6b7280' 
                          }}
                        />
                        <span className="bookmark-item-name">{bookmark.name}</span>
                      </div>
                      {bookmark.buildingName && (
                        <div className="bookmark-item-building">{bookmark.buildingName}</div>
                      )}
                      {bookmark.description && (
                        <div className="bookmark-item-description">{bookmark.description}</div>
                      )}
                    </div>
                    <button 
                      className="bookmark-remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveBookmark(bookmark.id);
                      }}
                      title="Remove bookmark"
                    >
                      <BookmarkIcon filled={true} size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Bookmark Button Component
export const BookmarkButton = ({ 
  item, 
  isBookmarked, 
  onToggle, 
  size = 'medium',
  showText = true 
}) => {
  const buttonClass = `bookmark-btn bookmark-btn-${size} ${isBookmarked ? 'bookmarked' : ''}`;
  
  return (
    <button 
      className={buttonClass}
      onClick={() => onToggle(item)}
      title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      <BookmarkIcon filled={isBookmarked} size={size === 'small' ? 16 : 22} />
      {showText && (
        <span className="bookmark-btn-text">
          {isBookmarked ? 'Unbookmark' : 'Bookmark'}
        </span>
      )}
    </button>
  );
};

// Notification Component
export const BookmarkNotifications = ({ notifications, onRemove }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="bookmark-notifications">
      {notifications.map((notification) => (
        <div 
          key={notification.id} 
          className={`bookmark-notification bookmark-notification-${notification.type}`}
        >
          <div className="bookmark-notification-content">
            <BookmarkIcon filled={true} size={18} />
            <span className="bookmark-notification-message">{notification.message}</span>
          </div>
          <button 
            className="bookmark-notification-close"
            onClick={() => onRemove(notification.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

// Main Bookmark Manager Component
const BookmarkManager = ({ 
  categories = {},
  onBookmarkClick,
  className = ''
}) => {
  const {
    bookmarks,
    notifications,
    isBookmarkSidebarOpen,
    setIsBookmarkSidebarOpen,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    isBookmarked,
    clearAllBookmarks,
    removeNotification
  } = useBookmarkManager();

  const handleBookmarkClick = (bookmark) => {
    if (onBookmarkClick) {
      onBookmarkClick(bookmark);
    }
    
    // Try to highlight building on map if available
    if (bookmark.svgBuildingId && window.highlightBuilding) {
      window.highlightBuilding(bookmark.svgBuildingId);
    }
    
    // Try to show building info if available
    if (window.showBuildingInfo) {
      window.showBuildingInfo(bookmark.id, bookmark.name);
    }
  };

  return (
    <div className={`bookmark-manager ${className}`}>
      {/* Bookmark Sidebar Toggle Button */}
      <button 
        className="bookmark-sidebar-toggle"
        onClick={() => setIsBookmarkSidebarOpen(true)}
        title="View Bookmarks"
      >
        <BookmarkIcon filled={bookmarks.length > 0} size={20} />
        <span className="bookmark-toggle-text">Bookmarks</span>
        {bookmarks.length > 0 && (
          <span className="bookmark-toggle-count">{bookmarks.length}</span>
        )}
      </button>

      {/* Bookmark Sidebar */}
      <BookmarkSidebar
        bookmarks={bookmarks}
        isOpen={isBookmarkSidebarOpen}
        onClose={() => setIsBookmarkSidebarOpen(false)}
        onBookmarkClick={handleBookmarkClick}
        onRemoveBookmark={removeBookmark}
        onClearAll={clearAllBookmarks}
        categories={categories}
      />

      {/* Notifications */}
      <BookmarkNotifications 
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  );
};

export default BookmarkManager;

// Export individual components for flexibility
export {
  BookmarkIcon
};
