import React, { useState, useEffect, useRef } from "react";
import { Search, X, MapPin } from "lucide-react";

interface Building {
  buildingId: string;  // Changed from number to string
  buildingName: string;
}

interface EnhancedSearchBarProps {
  onSearch: (query: string) => void;
  onBuildingSelect: (buildingId: string) => void;
  buildings: Building[];
  placeholder?: string;
}

const EnhancedSearchBar: React.FC<EnhancedSearchBarProps> = ({ 
  onSearch, 
  onBuildingSelect,
  buildings = [],
  placeholder = "Search buildings..."
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [filteredBuildings, setFilteredBuildings] = useState<Building[]>([]);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter buildings based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = buildings.filter(building =>
        building.buildingName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBuildings(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredBuildings([]);
      setShowSuggestions(false);
    }
    setSelectedIndex(-1);
  }, [searchQuery, buildings]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) {
      if (e.key === "Enter") {
        onSearch(searchQuery);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredBuildings.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredBuildings.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && filteredBuildings[selectedIndex]) {
          selectBuilding(filteredBuildings[selectedIndex]);
        } else {
          onSearch(searchQuery);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const selectBuilding = (building: Building) => {
    setSearchQuery(building.buildingName);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onBuildingSelect(building.buildingId);
    inputRef.current?.blur();
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onSearch("");
    onBuildingSelect("all");
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (building: Building) => {
    selectBuilding(building);
  };

  return (
    <div ref={searchRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search style={{ position: 'absolute', left: '12px', zIndex: 1, color: '#6b7280' }} size={16} />
        <input
          ref={inputRef}
          type="text"
          style={{
            width: '100%',
            paddingLeft: '36px',
            paddingRight: searchQuery ? '36px' : '12px',
            paddingTop: '8px',
            paddingBottom: '8px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            outline: 'none'
          }}
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => searchQuery && setShowSuggestions(filteredBuildings.length > 0)}
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            style={{
              position: 'absolute',
              right: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px'
            }}
            type="button"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {showSuggestions && filteredBuildings.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'white',
          border: '1px solid #d1d5db',
          borderTop: 'none',
          borderRadius: '0 0 6px 6px',
          maxHeight: '200px',
          overflowY: 'auto',
          zIndex: 10,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          {filteredBuildings.map((building, index) => (
            <div
              key={building.buildingId}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                cursor: 'pointer',
                backgroundColor: index === selectedIndex ? '#f3f4f6' : 'white',
                borderBottom: index < filteredBuildings.length - 1 ? '1px solid #e5e7eb' : 'none'
              }}
              onClick={() => handleSuggestionClick(building)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <MapPin style={{ marginRight: '8px', color: '#6b7280' }} size={16} />
              <div>
                <span style={{ display: 'block', fontWeight: 500 }}>
                  {building.buildingName}
                </span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  ID: {building.buildingId}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnhancedSearchBar;