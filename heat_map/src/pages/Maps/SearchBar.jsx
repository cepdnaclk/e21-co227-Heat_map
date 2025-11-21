import React, { useState, useEffect, useRef } from 'react';
import buildingApiService from './buildingApi';

// Search icon component (clickable)
const SearchIconBtn = ({ onClick }) => (
  <button
    className="map-search-icon-btn"
    type="button"
    aria-label="Search"
    onClick={onClick}
    tabIndex={0}
    style={{
      position: 'absolute',
      right: '40px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="10" cy="10" r="7" stroke="#2563eb" strokeWidth="2"/>
      <line x1="16" y1="16" x2="21" y2="21" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  </button>
);

// Desktop Search Bar Component
export const DesktopSearchBar = ({ 
  searchQuery, 
  setSearchQuery, 
  allResults, 
  handleSelectResult, 
  categories, 
  isSearching, 
  hasSelectedResult, 
  isSelecting,
  buildingRelatedResults,
  showBuildingResults,
  setShowBuildingResults,
  setBuildingRelatedResults,
  setHasSelectedResult,
  setIsSelecting
}) => {
  const [isDropdownHidden, setIsDropdownHidden] = useState(false);
  
  // Custom handleSelectResult that immediately hides dropdown
  const handleSelectResultWithHide = (item) => {
    
    setIsDropdownHidden(true); // Immediately hide dropdown
    handleSelectResult(item); // Call original handler
  };
  
  return (
    <div className="map-search" style={{ position: 'relative' }}>
      <input
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          // Reset selection states when user types
          setHasSelectedResult(false);
          setIsSelecting(false);
          setIsDropdownHidden(false); // Show dropdown when user types
        }}
        placeholder="Search exhibits..."
        className="map-search-input"
        style={{ paddingRight: '48px' }}
        onKeyDown={e => {
          if (e.key === 'Enter' && searchQuery) {
            // Optionally trigger search logic here
          }
        }}
      />
      <SearchIconBtn onClick={() => {
        document.querySelector('.map-search-input')?.focus();
      }} />
      {searchQuery && (
        <button className="map-search-clear" onClick={() => {
          setSearchQuery('');
          setShowBuildingResults(false);
          setBuildingRelatedResults([]);
          setHasSelectedResult(false);
          setIsSelecting(false);
        }} aria-label="Clear search">×</button>
      )}
      
      {/* Show building-related results when a building is selected */}
      {searchQuery && showBuildingResults && buildingRelatedResults.length > 0 && (
        <div className="map-search-results">
          <div style={{ padding: '8px 12px', fontSize: '12px', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>
            Related items in {searchQuery}:
          </div>
          {buildingRelatedResults.slice(0, 8).map(item => (
            <button key={item.id} className="map-search-result" onClick={() => handleSelectResultWithHide(item)}>
              <span className="map-result-dot" style={{ backgroundColor: categories[item.category] || '#6b7280' }} />
              <div className="map-result-text">
                <div className="map-result-title">{item.name}</div>
                <div className="map-result-sub">
                  {item.type === 'building' ? 'Building' : 
                   item.type === 'exhibit' ? 'Exhibit' : 
                   item.type === 'amenity' ? 'Amenity' : item.category}
                  {item.buildingName && ` • ${item.buildingName}`}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
      
      {/* Show regular search results when not showing building results */}
      {(() => {
        const shouldShow = !isDropdownHidden && searchQuery && !hasSelectedResult && !isSelecting && !showBuildingResults && (isSearching || allResults.length > 0);
        // console.log('Dropdown visibility check:', {
        //   isDropdownHidden,
        //   searchQuery,
        //   hasSelectedResult,
        //   isSelecting,
        //   showBuildingResults,
        //   isSearching,
        //   allResultsLength: allResults.length,
        //   shouldShow
        // });
        return shouldShow;
      })() && (
        <div className="map-search-results">
          {isSearching ? (
            <div style={{ padding: '12px', textAlign: 'center', color: '#6b7280' }}>
              Searching...
            </div>
          ) : allResults.length > 0 ? (
            allResults.slice(0, 8).map(item => (
              <button key={item.id} className="map-search-result" onClick={() => handleSelectResultWithHide(item)}>
                <span className="map-result-dot" style={{ backgroundColor: categories[item.category] || '#6b7280' }} />
                <div className="map-result-text">
                  <div className="map-result-title">{item.name}</div>
                  <div className="map-result-sub">
                    {item.type === 'building' ? 'Building' : 
                     item.type === 'exhibit' ? 'Exhibit' : 
                     item.type === 'amenity' ? 'Amenity' : item.category}
                    {item.buildingName && ` • ${item.buildingName}`}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div style={{ padding: '12px', textAlign: 'center', color: '#6b7280' }}>
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Mobile Search Bar Component
export const MobileSearchBar = ({ 
  searchQuery, 
  setSearchQuery, 
  searchResults, 
  handleSelectResult, 
  isSearchFocused, 
  setIsSearchFocused 
}) => {
  return (
    <div className="mobile-search-bar" style={{ 
      position: "fixed", 
      top: 20, 
      left: 20, 
      right: 20, 
      zIndex: 10000,
      maxWidth: "600px",
      margin: "0 auto",
      transform: "none",
      willChange: "auto"
    }}>
      <div style={{
        background: "#ffffff",
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1)",
        overflow: "hidden",
        position: "relative"
      }}>
        {/* Search Input */}
        <div className="mobile-search-input" style={{
          display: "flex",
          alignItems: "center",
          padding: "12px 16px",
          borderBottom: searchResults.length > 0 ? "1px solid #e5e7eb" : "none"
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 12, color: "#6b7280" }}>
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search buildings, exhibits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: "16px",
              color: "#1f2937",
              background: "transparent",
              padding: 0
            }}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                marginLeft: 8,
                borderRadius: 4,
                color: "#6b7280"
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {(isSearchFocused || searchResults.length > 0) && searchResults.length > 0 && (
          <div style={{
            background: "#ffffff",
            borderTop: "1px solid #e5e7eb",
            maxHeight: "300px",
            overflowY: "auto"
          }}>
            {searchResults.map((building, index) => (
              <button
                key={building.building_id}
                onClick={() => handleSelectResult(building)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "none",
                  background: "transparent",
                  textAlign: "left",
                  cursor: "pointer",
                  borderBottom: index < searchResults.length - 1 ? "1px solid #f3f4f6" : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  transition: "background-color 0.2s ease"
                }}
                onMouseEnter={(e) => e.target.style.background = "#f9fafb"}
                onMouseLeave={(e) => e.target.style.background = "transparent"}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "#6b7280", flexShrink: 0 }}>
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: "#1f2937", marginBottom: 2 }}>
                    {building.building_name}
                  </div>
                  <div style={{ fontSize: "14px", color: "#6b7280", lineHeight: 1.4 }}>
                    {building.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Main Search Bar Hook - contains all search logic
export const useSearchBar = (fetchedBuilding = null) => {
  // State for desktop search (Dashboard.jsx)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSelectedResult, setHasSelectedResult] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [buildingRelatedResults, setBuildingRelatedResults] = useState([]);
  const [showBuildingResults, setShowBuildingResults] = useState(false);

  // State for mobile search (MapExtra.jsx)
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Search function using buildingApiService (for Dashboard)
  const performSearch = async (query, category, zone, subzone) => {
    if (!query || query.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await buildingApiService.searchBuildings(query, { zone, subzone });
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Function to fetch building-related items (for Dashboard)
  const fetchBuildingRelatedItems = async (buildingId, buildingName) => {
    try {
      // Search for all items in this building by using the building name as query
      const results = await buildingApiService.searchBuildings(buildingName, { zone: 'all', subzone: 'all' });
      
      // Filter results to only include items from the same building
      const buildingItems = results.filter(item => 
        item.buildingId === buildingId || 
        item.buildingName === buildingName ||
        item.name === buildingName
      );
      
      setBuildingRelatedResults(buildingItems);
      setShowBuildingResults(true);
    } catch (error) {
      console.error('Failed to fetch building related items:', error);
      setBuildingRelatedResults([]);
    }
  };

  // Search functionality for mobile (MapExtra.jsx)
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }
    
    // Filter buildings based on search query
    const filtered = fetchedBuilding?.current?.filter(building => 
      building.building_name?.toLowerCase().includes(query.toLowerCase()) ||
      building.description?.toLowerCase().includes(query.toLowerCase()) ||
      building.exhibits?.some(exhibit => exhibit.toLowerCase().includes(query.toLowerCase()))
    ) || [];
    
    setSearchResults(filtered.slice(0, 5)); // Limit to 5 results
  };

  // Debounced search effect (for Dashboard)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        setHasSelectedResult(false); // Reset selection flag when user types
        setIsSelecting(false); // Reset selecting flag when user types
        console.log('User typing, resetting selection flag');
        performSearch(searchQuery, 'all', 'all', 'all');
      } else {
        setSearchResults([]);
        setIsSearching(false);
        setHasSelectedResult(false);
        setIsSelecting(false);
        setShowBuildingResults(false);
        setBuildingRelatedResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, hasSelectedResult, showBuildingResults]);

  // Auto-select first result when there's only one result (for Dashboard)
  useEffect(() => {
    if (searchResults.length === 1 && !hasSelectedResult && !isSelecting && searchQuery.trim()) {
      // Small delay to ensure the search is complete
      const autoSelectTimeout = setTimeout(() => {
        console.log('Auto-selecting first result:', searchResults[0]);
        // handleSelectResult(searchResults[0]); // This will be passed as prop
      }, 100);
      
      return () => clearTimeout(autoSelectTimeout);
    }
  }, [searchResults, hasSelectedResult, isSelecting, searchQuery]);

  // Debug effect to monitor state changes (for Dashboard)
  useEffect(() => {
    console.log('State changed - searchQuery:', searchQuery, 'hasSelectedResult:', hasSelectedResult, 'isSelecting:', isSelecting, 'isSearching:', isSearching, 'allResults.length:', searchResults.length);
  }, [searchQuery, hasSelectedResult, isSelecting, isSearching, searchResults.length]);

  return {
    // State
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
    isSearchFocused,
    setIsSearchFocused,
    
    // Functions
    performSearch,
    fetchBuildingRelatedItems,
    handleSearch,
    
    // Computed values
    allResults: searchResults
  };
};

export default {
  DesktopSearchBar,
  MobileSearchBar,
  useSearchBar,
  SearchIconBtn
};
