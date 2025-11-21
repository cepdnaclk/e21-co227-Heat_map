import React, { useEffect, useMemo, useRef, useState } from 'react';
import './Dashboard.css';
import MapExtra from './MapExtra.jsx';
import buildingApiService from './buildingApi';
import { DesktopSearchBar, useSearchBar } from './SearchBar';

import BookmarkManager, { BookmarkButton, useBookmarkManager } from './BookmarkManager';
import {focus, getUserPosition, highlightSelectedBuilding} from './map_module.js';


const categories = {
  Exhibits: '#2563eb',
  Amenities: '#16a34a',
  Emergency: '#ef4444'
};




const BookmarkIcon = ({ filled = false }) => (
  <svg width="22" height="22" viewBox="0 0 22 22" style={{ verticalAlign: 'middle' }}>
    <path
      d="M6 3.5A2.5 2.5 0 0 1 8.5 1h5A2.5 2.5 0 0 1 16 3.5v15.2a.7.7 0 0 1-1.1.6l-4.4-2.7-4.4 2.7A.7.7 0 0 1 6 18.7V3.5z"
      fill={filled ? "#2563eb" : "none"}
      stroke="#2563eb"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

// Add a simple directions icon (SVG)
const DirectionsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" style={{ verticalAlign: 'middle' }}>
    <path
      d="M11 2l8 8-8 8-8-8 8-8zm0 4v4h4"
      stroke="#2563eb"
      strokeWidth="1.5"
      fill="none"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
);

// Add a locate me icon (SVG)
const LocateIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" style={{ verticalAlign: 'middle' }}>
    <circle cx="11" cy="11" r="3" fill="currentColor"/>
    <path d="M11 1v4M11 17v4M21 11h-4M5 11H1" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>
);

// Add zoom in icon (SVG)
const ZoomInIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" style={{ verticalAlign: 'middle' }}>
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M11 7v8M7 11h8" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>
);

// Add zoom out icon (SVG)
const ZoomOutIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" style={{ verticalAlign: 'middle' }}>
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M7 11h8" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>
);

// --- Modularized Subcomponents ---

function MapLegend({ categories, activeCategories, handleLegendFilter }) {
  return (
    <div className="map-legend">
      <div className="map-legend-title">Legend (Click to Filter)</div>
      <div className="map-legend-items">
        {Object.keys(categories).map(cat => (
          <button
            key={cat}
            className={`map-legend-item${activeCategories[cat] ? ' active' : ''}`}
            style={{
              background: activeCategories[cat] ? '#e3f2fd' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              color: activeCategories[cat] ? '#1976d2' : '#6b7280',
              padding: '4px 8px',
              borderRadius: '8px'
            }}
            onClick={() => handleLegendFilter(cat)}
            type="button"
          >
            <span className="map-legend-dot" style={{ backgroundColor: categories[cat] }}></span>
            <span>{cat}</span>
          </button>
        ))}
      </div>
    </div>
  );
}


const Dashboard = ({kiosk_mode}) => {
  const mapRef = useRef(null);
  const [activeCategories, setActiveCategories] = useState({ Exhibits: true, Amenities: true, Emergency: true });
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Use SearchBar hook for all search functionality
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    isSearching,
    setIsSearching,
    hasSelectedResult,
    setHasSelectedResult,
    isSelecting,
    setIsSelecting,
    buildingRelatedResults,
    setBuildingRelatedResults,
    showBuildingResults,
    setShowBuildingResults,
    performSearch,
    fetchBuildingRelatedItems,
    allResults
  } = useSearchBar();

  // Use BookmarkManager hook for bookmark functionality
  const {
    bookmarks,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    isBookmarked,
    showNotification
  } = useBookmarkManager();

  // Debounced search effect - triggers search when user types
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        // Only search if no result has been selected
        if (!hasSelectedResult && !isSelecting) {
          // Reset selection states when user types new query
          setHasSelectedResult(false);
          setIsSelecting(false);
          setShowBuildingResults(false);
          setBuildingRelatedResults([]);
          performSearch(searchQuery);
        }
      } else {
        // Clear results when search is empty
        setSearchResults([]);
        setHasSelectedResult(false);
        setIsSelecting(false);
        setShowBuildingResults(false);
        setBuildingRelatedResults([]);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, performSearch, hasSelectedResult, isSelecting]);

  const visiblePoints = useMemo(() => {
    // Use search results when available
    if (searchQuery.trim() && searchResults.length > 0) {
      return searchResults.filter(item => {
        const category = item.type === 'building' ? 'Building' : 
                        item.type === 'exhibit' ? 'Exhibits' : 
                        item.type === 'amenity' ? 'Amenities' : item.category;
        return activeCategories[category];
      });
    }
    
    // Return empty array when no search results
    return [];
  }, [searchQuery, searchResults, activeCategories]);



  // Map initialization is now handled by MapComponent

  const handleSelectResult = (item) => {
    // Immediately hide dropdown by setting all flags
    console.log('handleSelectResult called, hiding dropdown immediately');
    console.log('Before state update:', { hasSelectedResult, isSelecting, searchQuery });
    
    setIsSelecting(true);
    setHasSelectedResult(true);
    setSearchResults([]);
    setIsSearching(false);
    setShowBuildingResults(false);
    setBuildingRelatedResults([]);
    setSearchQuery(''); // Clear the search input as well
    
    console.log('After state update calls:', { hasSelectedResult, isSelecting, searchQuery });
    
    // Convert API result to the format expected by the rest of the app
    const point = {
      id: item.id,
      name: item.name,
      category: item.type === 'building' ? 'Building' : 
                item.type === 'exhibit' ? 'Exhibits' : 
                item.type === 'amenity' ? 'Amenities' : item.category,
      x: item.coordinates ? item.coordinates[0] * 100 : 200, // Convert lat to approximate x
      y: item.coordinates ? item.coordinates[1] * 100 : 200, // Convert lng to approximate y
      description: item.description,
      buildingId: item.buildingId,
      buildingName: item.buildingName,
      svgBuildingId: item.svgBuildingId,
      type: item.type,
      coordinates: item.coordinates
    };
    
    setSelectedPoint(point);
    setSearchQuery(item.name);
    
    // Highlight the building and show bottom sheet
    if (item.svgBuildingId) {
      // Use highlightBuilding from Map component via window object
      highlightSelectedBuilding(item.svgBuildingId);
    }
    
    // Show building info in bottom sheet (MapExtra component)
    // Add a small delay to ensure MapExtra component is fully loaded
    setTimeout(() => {
      if (window.showBuildingInfo) {
        console.log('Calling window.showBuildingInfo with:', item.svgBuildingId || item.buildingId, item.name);
        window.showBuildingInfo(item.svgBuildingId || item.buildingId, item.name);
      } else {
        console.warn('window.showBuildingInfo not available yet');
      }
    }, 100);
    
    centerOnPoint(point);
    
    // If this is a building selection, fetch and show related items from the same building
    if (item.type === 'building' && item.buildingId) {
      fetchBuildingRelatedItems(item.buildingId, item.name);
    } else {
      // If selecting a non-building item, hide building results
      setShowBuildingResults(false);
      setBuildingRelatedResults([]);
    }
  };

  const handleBookmarkClick = (bookmark) => {
    // Convert bookmark to point format and select it
    const point = {
      id: bookmark.id,
      name: bookmark.name,
      category: bookmark.category,
      description: bookmark.description,
      buildingId: bookmark.buildingId,
      buildingName: bookmark.buildingName,
      svgBuildingId: bookmark.svgBuildingId,
      coordinates: bookmark.coordinates,
      type: bookmark.category === 'Building' ? 'building' : 
            bookmark.category === 'Exhibits' ? 'exhibit' : 
            bookmark.category === 'Amenities' ? 'amenity' : 'building'
    };
    
    setSelectedPoint(point);
    setSearchQuery(bookmark.name);
    
    // Highlight building on map if available
    if (bookmark.svgBuildingId && window.highlightBuilding) {
      window.highlightBuilding(bookmark.svgBuildingId);
    }
    
    // Show building info if available
    // Add a small delay to ensure MapExtra component is fully loaded
    setTimeout(() => {
      if (window.showBuildingInfo) {
        window.showBuildingInfo(bookmark.id, bookmark.name);
      } else {
        console.warn('window.showBuildingInfo not available yet');
      }
    }, 100);
  };

  const toggleCategory = (cat) => {
    setActiveCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleLegendFilter = (cat) => {
    setActiveCategories(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  // Quick filter presets for easy viewing
  const quickFilter = (key) => {
    if (key === 'All') {
      setActiveCategories({ Exhibits: true, Amenities: true, Emergency: true });
    } else if (key === 'Amenities') {
      setActiveCategories({ Exhibits: false, Amenities: true, Emergency: false });
    } else if (key === 'Emergency') {
      setActiveCategories({ Exhibits: false, Amenities: false, Emergency: true });
    }
  };

  // Map styling is now handled by MapComponent





  // Center map on a specific point (used in search results)
  const centerOnPoint = (pt) => {
    if (!pt || !map) return;
    // You can enhance this later to center the Leaflet map on the point
    // The popup is now handled by the new unified popup system
  };

  const locateMe = async () => {
    focus(getUserPosition());
  };

  // Zoom functions
  const zoomIn = () => {
    // Access the map from MapExtra component
    if (typeof window.map !== 'undefined' && window.map) {
      window.map.zoomIn();
    }
  };

  const zoomOut = () => {
    // Access the map from MapExtra component
    if (typeof window.map !== 'undefined' && window.map) {
      window.map.zoomOut();
    }
  };



  const [isFullscreen, setIsFullscreen] = useState(false);
  const handleFullscreen = () => {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;
    if (!isFullscreen) {
      if (mapElement.requestFullscreen) mapElement.requestFullscreen();
      else if (mapElement.webkitRequestFullscreen) mapElement.webkitRequestFullscreen();
      else if (mapElement.mozRequestFullScreen) mapElement.mozRequestFullScreen();
      else if (mapElement.msRequestFullscreen) mapElement.msRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
    }
  };
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    document.addEventListener('mozfullscreenchange', onFsChange);
    document.addEventListener('MSFullscreenChange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
      document.removeEventListener('mozfullscreenchange', onFsChange);
      document.removeEventListener('MSFullscreenChange', onFsChange);
    };
  }, []);

  return (
    <div className="dashboard-container with-bottom-padding">
      <div className="map-page">
        <div className="map-header">
          <div className="dashboard-search-center">
            <DesktopSearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              allResults={allResults}
              handleSelectResult={handleSelectResult}
              categories={categories}
              isSearching={isSearching}
              hasSelectedResult={hasSelectedResult}
              isSelecting={isSelecting}
              buildingRelatedResults={buildingRelatedResults}
              showBuildingResults={showBuildingResults}
              setShowBuildingResults={setShowBuildingResults}
              setBuildingRelatedResults={setBuildingRelatedResults}
              setHasSelectedResult={setHasSelectedResult}
              setIsSelecting={setIsSelecting}
            />
          </div>
        </div>
        <div className="map-layout">
          {/* Left Sidebar */}
          <div className="map-sidebar">
            <div>
              <div className="dashboard-filter-card">
                <button
                  className="dashboard-filter-btn"
                  onClick={() => setActiveCategories(prev => {
                    const allActive = Object.values(prev).every(Boolean);
                    return {
                      Exhibits: !allActive,
                      Amenities: !allActive,
                      Emergency: !allActive
                    };
                  })}
                >
                  {Object.values(activeCategories).every(Boolean) ? 'Hide All Categories' : 'Show All Categories'}
                </button>
              </div>
              <MapLegend
                categories={categories}
                activeCategories={activeCategories}
                handleLegendFilter={handleLegendFilter}
              />
            </div>
          </div>
          {/* Main Map */}
          <div className="map-main">
            <div className="map-card">
              <div className="map-viewport">
                <MapExtra kiosk_mode={kiosk_mode} />
                {/* Custom Controls */}
                <div className="map-controls">
                  <button className="map-ctrl" onClick={zoomIn} aria-label="Zoom In" title="Zoom In">
                    <ZoomInIcon />
                  </button>
                  <button className="map-ctrl" onClick={zoomOut} aria-label="Zoom Out" title="Zoom Out">
                    <ZoomOutIcon />
                  </button>
                  <button className={`map-ctrl ${isLocating ? 'loading' : ''}`} onClick={locateMe} aria-label="Locate me">
                    <LocateIcon />
                  </button>
                  <button className="map-ctrl" onClick={handleFullscreen} aria-label="Fullscreen" title="Fullscreen">
                    {isFullscreen ? (
                      <span role="img" aria-label="Exit Fullscreen">🗗</span>
                    ) : (
                      <span role="img" aria-label="Fullscreen">🗖</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;