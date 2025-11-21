import { use, useEffect, useRef, useState } from "react";
import MapComponent from "./Map";
import { 
  map,
  addBuildingClickListner, 
  addGpsListner, 
  addMessageListner, 
  sendMessage,
  startGPS,
  buildingToNode,
  drawRoute,
  stopGps, 
  getUserPosition,
  setBuildingAccent,
  drawMarker,
  highlightSelectedBuilding
} from "./map_module";
import buildingApiService from "./buildingApi";
import mapping from "./mappings.json";
import { other_buildings } from "./buildingData";
// Removed MobileSearchBar and useSearchBar imports - not needed for this component

export default function MapExtra({kiosk_mode=false}) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const fetchedBuilding = useRef([]);
  const [navStatus, setNavStatus] = useState("");
  const [bookmarkStatus, setBookmarkStatus] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const previousBuilding = useRef(null);

  // Removed mobile search functionality - not needed for this component

  // Engineering themed dummy building data (extend as needed)

  const getBuildingInfo = (buildingId) => {
    console.log(`To be found building at 71: ${buildingId}`)
    console.log(`=================================================================================================`);
    fetchedBuilding.current.forEach(b => {
      
      console.log(`Building in list: ${b.building_id} ${b.building_name} mapped to ${buildingApiService.mapDatabaseIdToSvgId(b.building_id)}`);
      
    });
    console.log(`=================================================================================================`);
    const building = fetchedBuilding.current.find(b => buildingId === buildingApiService.mapDatabaseIdToSvgId(b.building_id));
    console.log(`found building at 71: ${building}`)
    return building;
  };

  function hashCode(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h << 5) - h + str.charCodeAt(i);
      h |= 0;
    }
    return h;
  }

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
  const readBookmarks = () => {
    try {
      const raw = getCookie(COOKIE_KEY);
      if (!raw) return [];
      return JSON.parse(decodeURIComponent(raw));
    } catch {
      return [];
    }
  };
  const writeBookmarks = (bookmarks) => {
    try {
      const serialized = encodeURIComponent(JSON.stringify(bookmarks));
      setCookie(COOKIE_KEY, serialized);
    } catch {
      // ignore write errors
    }
  };
  const isBookmarked = (id) => {
    const list = readBookmarks();
    return list.some((b) => String(b.id) === String(id));
  };
  const removeBookmarkLocal = (id) => {
    const list = readBookmarks();
    const next = list.filter((b) => String(b.id) !== String(id));
    writeBookmarks(next);
  };

  // Fullscreen functionality
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.log('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch((err) => {
        console.log('Error attempting to exit fullscreen:', err);
      });
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch((err) => {
        console.log('Error attempting to exit fullscreen:', err);
      });
    }
  };

  // Removed selectSearchResult function - not needed for this component

  // Zoom functionality
  const zoomIn = () => {
    console.log('zoomIn function called, map:', map);
    if (map) {
      console.log('Calling map.zoomIn()');
      try {
        map.zoomIn();
        console.log('map.zoomIn() executed successfully');
      } catch (error) {
        console.error('Error calling map.zoomIn():', error);
      }
    } else {
      console.log('Map is not available');
    }
  };

  const zoomOut = () => {
    console.log('zoomOut function called, map:', map);
    if (map) {
      console.log('Calling map.zoomOut()');
      try {
        map.zoomOut();
        console.log('map.zoomOut() executed successfully');
      } catch (error) {
        console.error('Error calling map.zoomOut():', error);
      }
    } else {
      console.log('Map is not available');
    }
  };

  useEffect(() => {
    // Listen for building clicks from the map module
    const unsubscribe = addBuildingClickListner((buildingId) => {
      
      setSelectedBuilding(buildingId);
      setIsSheetOpen(true);
    });

    // Expose a global function so the bookmarks sidebar can open this sheet
    window.showBuildingInfo = (buildingId, buildingName) => {
      setSelectedBuilding(buildingId);
      setIsSheetOpen(true);
      // Optionally highlight building on the map if available
      try {
        if (typeof window.highlightBuilding === "function") {
          window.highlightBuilding(buildingId);
        }
      } catch {}
    };

    // Expose the map object globally so Dashboard can access it
    if (map) {
      window.map = map;
    }

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
      try { delete window.showBuildingInfo; } catch {}
      try { delete window.map; } catch {}
    };
  }, [map]);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const loc = params.get('location');
      console.log("URL param location:", loc);
      if (loc) {
        // Delay slightly to ensure map has initialized
        setTimeout(() => {
          const mapCode = mapping.name_to_svg[loc] || null;
          if (mapCode) {
            highlightSelectedBuilding(mapCode);
            setSelectedBuilding(mapCode);
            setIsSheetOpen(true);
          }
          
          console.log("Highlighting building by name:", loc, "->", mapCode);
        }, 500);
  
        // ✅ Clear the query param after first use so it doesn’t trigger again
        const url = new URL(window.location);
        url.searchParams.delete('location');
        window.history.replaceState({}, '', url); 
      }
    } catch (e) {
      console.error("Redirect flow error:", e);
    }
  }, []);

  const nameToMapCode = {
    "Drawing Office 2": "b13",
    "Department of Manufacturing and Industrial Engineering": "b15",
    "Corridor": null,
    "Lecture Room (middle-right)": null,
    "Structures Laboratory": "b6",
    "Lecture Room (bottom-right)": "b9",
    "Engineering Library": "b10",
    "Process Laboratory": null,
    "Faculty Canteen": "b14",

    "Drawing Office 1": "b33",
    "Professor E.O.E. Pereira Theatre": "b16",
    "Administrative Building": "b7",
    "Security Unit": "b12",
    "Department of Chemical and Process Engineering": "b11",
    "Department of Engineering Mathematics / Department of Engineering Management / Computer Center": "b32",

    "Department of Electrical and Electronic Engineering": "b34",
    "Department of Computer Engineering": "b20",
    "Electrical and Electronic Workshop": "b19",
    "Surveying Lab": "b31",
    "Soil Lab": "b31",
    "Materials Lab": "b28",
    "Electronic Lab": "b17",
    "Environmental Lab": "b22",

    "Fluids Lab": "b30",
    "New Mechanics Lab": "b24",
    "Applied Mechanics Lab": "b23",
    "Thermodynamics Lab": "b29",
    "Generator Room": null,
    "Engineering Workshop": "b2",
    "Engineering Carpentry Shop": "b1"
  };

  useEffect(() => {
    buildingApiService.getAllBuildings()
    .then((r) => {
      console.log(`at 169 MapExtra:`);
      console.log(r);
      fetchedBuilding.current = [...r, ...other_buildings];
      console.log("at 173 MapExtra");
      console.log(fetchedBuilding.current);
    })
    .catch((e) => console.log("Error fetching building") );

    
  }, []);

  useEffect(() => {
    addGpsListner((latLng) => {
      drawMarker(latLng);
    })
  }, []);

  useEffect(() => {
    addGpsListner((latLng) => {
      drawMarker(latLng);
    })
  }, []);

  let unsubscribeGps = () => {};
    
  let unsubscribeRouteListner = () => {};

  useEffect(() => {
    startGPS();

    return () => {
      stopGps();
    }
  },[]);

  // Ensure zoom controls are properly enabled and fully clickable for both mobile and desktop
  useEffect(() => {
    const enableZoomControls = () => {
      if (map) {
        // Ensure zoom controls are enabled
        const zoomControl = map.zoomControl;
        if (zoomControl) {
          zoomControl.enable();
        }
        
        // Wait a bit for DOM to be ready
        setTimeout(() => {
          // Find all zoom control links
          const allZoomLinks = document.querySelectorAll('.leaflet-control-zoom a');
          console.log('Found zoom control links:', allZoomLinks.length, allZoomLinks);
          
          if (allZoomLinks.length >= 2) {
            const zoomInBtn = allZoomLinks[0]; // First link is usually zoom in
            const zoomOutBtn = allZoomLinks[1]; // Second link is usually zoom out
            
            console.log('Zoom buttons found:', {
              zoomInBtn: zoomInBtn,
              zoomInBtnText: zoomInBtn.textContent,
              zoomInBtnHref: zoomInBtn.href,
              zoomOutBtn: zoomOutBtn,
              zoomOutBtnText: zoomOutBtn.textContent,
              zoomOutBtnHref: zoomOutBtn.href
            });
            
            // Verify which is which by checking content or href
            let actualZoomInBtn, actualZoomOutBtn;
            
            if (zoomInBtn.textContent.includes('+') || zoomInBtn.href.includes('zoomIn')) {
              actualZoomInBtn = zoomInBtn;
              actualZoomOutBtn = zoomOutBtn;
              console.log('Using first button as zoom in');
            } else if (zoomOutBtn.textContent.includes('+') || zoomOutBtn.href.includes('zoomIn')) {
              actualZoomInBtn = zoomOutBtn;
              actualZoomOutBtn = zoomInBtn;
              console.log('Using second button as zoom in');
            } else {
              // Default assumption: first is zoom in, second is zoom out
              actualZoomInBtn = zoomInBtn;
              actualZoomOutBtn = zoomOutBtn;
              console.log('Using default button assignment');
            }
            
            const setupButton = (button, zoomFunction, buttonType) => {
              if (button) {
                // Remove any existing listeners first
                const oldClickHandler = button._customClickHandler;
                const oldTouchStartHandler = button._customTouchStartHandler;
                const oldTouchEndHandler = button._customTouchEndHandler;
                
                if (oldClickHandler) {
                  button.removeEventListener('click', oldClickHandler, true);
                }
                if (oldTouchStartHandler) {
                  button.removeEventListener('touchstart', oldTouchStartHandler);
                }
                if (oldTouchEndHandler) {
                  button.removeEventListener('touchend', oldTouchEndHandler);
                }
                
                // Create new handlers
                const clickHandler = (e) => {
                  console.log(`${buttonType} button clicked!`);
                  e.preventDefault();
                  e.stopPropagation();
                  e.stopImmediatePropagation();
                  zoomFunction();
                };
                
                const touchStartHandler = (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.stopImmediatePropagation();
                };
                
                const touchEndHandler = (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.stopImmediatePropagation();
                  zoomFunction();
                };
                
                // Store handlers for cleanup
                button._customClickHandler = clickHandler;
                button._customTouchStartHandler = touchStartHandler;
                button._customTouchEndHandler = touchEndHandler;
                
                // Add click listener (desktop)
                button.addEventListener('click', clickHandler, true);
                
                // Add touch listeners (mobile)
                button.addEventListener('touchstart', touchStartHandler, { passive: false });
                button.addEventListener('touchend', touchEndHandler, { passive: false });
                
                // Ensure the button is fully clickable and touchable
                button.style.pointerEvents = 'auto';
                button.style.cursor = 'pointer';
                button.style.userSelect = 'none';
                button.style.webkitUserSelect = 'none';
                button.style.mozUserSelect = 'none';
                button.style.msUserSelect = 'none';
                button.style.touchAction = 'manipulation';
                button.style.webkitTapHighlightColor = 'transparent';
                button.style.outline = 'none';
                button.style.border = 'none';
                button.style.textDecoration = 'none';
                
                // Ensure proper sizing
                button.style.minWidth = '34px';
                button.style.minHeight = '34px';
                button.style.display = 'block';
                button.style.position = 'relative';
                button.style.zIndex = '1001';
                
                // Mobile-specific enhancements
                if (window.innerWidth <= 768) {
                  button.style.minWidth = '40px';
                  button.style.minHeight = '40px';
                  button.style.fontSize = '20px';
                  button.style.lineHeight = '40px';
                }
                
                console.log(`Zoom ${buttonType} button configured successfully`);
              }
            };
            
            setupButton(actualZoomInBtn, zoomIn, 'In');
            setupButton(actualZoomOutBtn, zoomOut, 'Out');
          } else {
            console.log('Zoom controls not found, retrying...');
          }
        }, 100);
      }
    };

    // Try to enable zoom controls with multiple attempts
    enableZoomControls();
    const timeoutId1 = setTimeout(enableZoomControls, 500);
    const timeoutId2 = setTimeout(enableZoomControls, 1500);
    const timeoutId3 = setTimeout(enableZoomControls, 3000);

    // Also listen for window resize to re-enable controls
    const handleResize = () => {
      setTimeout(enableZoomControls, 100);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
      clearTimeout(timeoutId3);
      window.removeEventListener('resize', handleResize);
      
      // Clean up event listeners
      const allZoomLinks = document.querySelectorAll('.leaflet-control-zoom a');
      allZoomLinks.forEach(button => {
        if (button._customClickHandler) {
          button.removeEventListener('click', button._customClickHandler, true);
        }
        if (button._customTouchStartHandler) {
          button.removeEventListener('touchstart', button._customTouchStartHandler);
        }
        if (button._customTouchEndHandler) {
          button.removeEventListener('touchend', button._customTouchEndHandler);
        }
      });
    };
  }, [map]);
  
  useEffect(() => {
    
    if (isNavigating) {
      console.log("Navigation started");
      let c = buildingToNode(selectedBuilding) 
      sendMessage('position-update', {coords:getUserPosition(), node: c})
      unsubscribeGps = addGpsListner((latLng) => {
        if (isNavigating) {
          if (c) {
            sendMessage('position-update', {coords:latLng, node: c})
          }
          
        }
        
      })
  
      unsubscribeRouteListner = addMessageListner('route-update', (r) => drawRoute(r));
  
      
    } else {
      
      unsubscribeRouteListner();
      unsubscribeGps();
      drawRoute(undefined);
      console.log("Navigation stopped");
    }

    
}, [isNavigating]);

  // When selected building changes, reflect bookmark status from cookie
  useEffect(() => {
    
  }, [selectedBuilding]);

  useEffect(() => {
    const updateMapViewportSize = () => {
      const el = document.getElementById('map');
      if (!el) return;
      // Make map limitless - fill entire viewport
      el.style.height = '100vh';
      el.style.width = '100vw';
      el.style.position = 'fixed';
      el.style.top = '0';
      el.style.left = '0';
      el.style.zIndex = '1';
    };
    updateMapViewportSize();
    window.addEventListener('resize', updateMapViewportSize);
    return () => window.removeEventListener('resize', updateMapViewportSize);
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <style>{`
        .map-legend{display:none !important;}
        .dashboard-filter-card{display:none !important;}
        /* Prevent horizontal scrolling */
        body {
          overflow-x: hidden !important;
          position: fixed !important;
          width: 100vw !important;
          height: 100vh !important;
        }
        /* Limitless map - fills entire viewport */
        #map{
          height: 100vh !important;
          width: 100vw !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          z-index: 1 !important;
        }
        /* Ensure map container takes full space */
        .map-container, .map-card, .map-viewport, .map-layout, .map-main, .map-page {
          height: 100vh !important;
          width: 100vw !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        /* Ensure fixed elements stay truly fixed */
        /* Removed mobile search bar styles - not needed */
        @media (max-width: 640px){
          .map-card{margin-top:0 !important;}
          .map-viewport{margin-top:0 !important; padding-top:0 !important;}
          .map-header{margin-bottom:0 !important; padding-bottom:0 !important; gap:0 !important;}
          .dashboard-search-center{margin-bottom:0 !important;}
          .map-card{padding-top:0 !important;}
          .map-search{margin-bottom:0 !important;}
          .map-layout{margin-top:0 !important;}
          .map-main{margin-top:0 !important;}
          .map-page{padding-top:0 !important;}
          .map-card{margin-top:0 !important;}
          /* Mobile limitless map */
          #map{height: 100vh !important; width: 100vw !important;}
          /* Removed mobile search bar styles - not needed */
        }
      `}</style>
      <MapComponent />

      {/* Removed Mobile Search Bar - not needed for this component */}

      {/* Exit Fullscreen Button - appears only when in fullscreen */}
      {isFullscreen && (
        <div style={{ 
          position: "fixed", 
          top: 20, 
          right: 20, 
          zIndex: 10001,
          transform: "none",
          willChange: "auto"
        }}>
          <button
            type="button"
            aria-label="Exit fullscreen"
            onClick={exitFullscreen}
            style={{
              background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
              color: "#ffffff",
              border: "2px solid #ffffff",
              borderRadius: 12,
              padding: "14px 18px",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 8px 20px rgba(220, 38, 38, 0.4), 0 4px 8px rgba(0, 0, 0, 0.2)",
              transition: "all 0.3s ease",
              minWidth: "120px",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)";
              e.target.style.transform = "scale(1.05) translateY(-2px)";
              e.target.style.boxShadow = "0 12px 24px rgba(220, 38, 38, 0.5), 0 6px 12px rgba(0, 0, 0, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)";
              e.target.style.transform = "scale(1) translateY(0)";
              e.target.style.boxShadow = "0 8px 20px rgba(220, 38, 38, 0.4), 0 4px 8px rgba(0, 0, 0, 0.2)";
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M8 3v5a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-5a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Exit</span>
          </button>
        </div>
      )}

      {/* Floating "Navigating" button - appears only after pressing Navigate */}
      {isNavigating && (
        <div style={{ 
          position: "fixed", 
          right: 16, 
          bottom: 16, 
          zIndex: 10000,
          transform: "none",
          willChange: "auto"
        }}>
          <button
            type="button"
            aria-label="Cancel navigation"
            style={{
              background: "linear-gradient(90deg, #2563eb 0%, #4338CA 100%)",
              color: "#ffffff",
              border: "none",
              borderRadius: 9999,
              padding: "12px 18px",
              fontWeight: 700,
              boxShadow:
                "0 10px 15px -3px rgba(67,56,202,0.25), 0 4px 6px -2px rgba(37,99,235,0.2)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 16
            }}
          >
            <span style={{ opacity: 0.95 }}>Navigating</span>
            <span
              aria-hidden="true"
              onClick={(e) => { e.stopPropagation(); setIsNavigating(false); }}
              style={{
                fontWeight: 800,
                marginLeft: 8,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              ×
            </span>
          </button>
        </div>
      )}

      {isSheetOpen && (
        <div role="dialog" aria-modal="true" aria-label="Building information" className="building-bottom-sheet" style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10000,
          background: "#ffffff",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          boxShadow: "0 -8px 24px rgba(0,0,0,0.12)",
          padding: "16px 16px calc(20px + env(safe-area-inset-bottom, 0px)) 16px",
          maxHeight: "50vh",
          overflow: "hidden",
          transform: isClosing ? "translateY(100%)" : "translateY(0)",
          transition: "transform 300ms ease",
          display: "flex",
          flexDirection: "column"
        }}>
          <style>{`
            .building-bottom-sheet .iem-title { font-weight: 700; font-size: 18px; color: #1f2937; }
            .building-bottom-sheet .iem-actions { display: flex; gap: 8px; margin-top: 8px; }
            .building-bottom-sheet .iem-btn { border-radius: 10px; padding: 10px 14px; font-weight: 600; cursor: pointer; }
            .building-bottom-sheet .iem-btn-gradient {
              background: linear-gradient(90deg, #2563eb 0%, #4338CA 100%);
              color: #fff;
              border: none;
              border-radius: 9999px;
              padding: 12px 18px;
              box-shadow: 0 10px 15px -3px rgba(67,56,202,0.25), 0 4px 6px -2px rgba(37,99,235,0.2);
              transition: transform 300ms ease-in-out, background 300ms ease-in-out, box-shadow 300ms ease-in-out;
            }
            .building-bottom-sheet .iem-btn-gradient:hover {
              transform: scale(1.05);
              background: linear-gradient(90deg, #4338CA 0%, #2563eb 100%);
              box-shadow: 0 12px 20px -3px rgba(67,56,202,0.35), 0 6px 10px -2px rgba(37,99,235,0.25);
            }
            .building-bottom-sheet .iem-meta { 
              color: #374151; 
              font-size: 14px; 
              /* Enhanced scroll behavior */
              scroll-behavior: smooth;
              -webkit-overflow-scrolling: touch;
            }
            /* Custom scrollbar styling */
            .building-bottom-sheet .iem-meta::-webkit-scrollbar {
              width: 6px;
            }
            .building-bottom-sheet .iem-meta::-webkit-scrollbar-track {
              background: #f1f5f9;
              border-radius: 3px;
            }
            .building-bottom-sheet .iem-meta::-webkit-scrollbar-thumb {
              background: #cbd5e1;
              border-radius: 3px;
              transition: background 0.2s ease;
            }
            .building-bottom-sheet .iem-meta::-webkit-scrollbar-thumb:hover {
              background: #94a3b8;
            }
            /* Scroll fade indicators */
            .building-bottom-sheet .iem-meta::before {
              content: '';
              position: sticky;
              top: 0;
              left: 0;
              right: 0;
              height: 8px;
              background: linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%);
              pointer-events: none;
              z-index: 1;
            }
            .building-bottom-sheet .iem-meta::after {
              content: '';
              position: sticky;
              bottom: 0;
              left: 0;
              right: 0;
              height: 8px;
              background: linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%);
              pointer-events: none;
              z-index: 1;
            }
            @media (max-width: 640px) {
              .building-bottom-sheet { max-height: 65vh !important; padding: 12px 12px calc(16px + env(safe-area-inset-bottom, 0px)) 12px !important; }
              .building-bottom-sheet .iem-title { font-size: 16px; }
              .building-bottom-sheet .iem-actions { flex-direction: row; }
              .building-bottom-sheet .iem-btn { width: 100%; }
              /* Enhanced mobile scroll */
              .building-bottom-sheet .iem-meta {
                -webkit-overflow-scrolling: touch;
                overscroll-behavior: contain;
              }
            }
          `}</style>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 40,
                height: 4,
                background: "#e5e7eb",
                borderRadius: 9999,
                margin: "0 auto 8px auto"
              }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div className="iem-title">{getBuildingInfo(selectedBuilding)?.building_name || "Selected Building"}</div>
            <button
              onClick={() => setIsSheetOpen(false)}
              aria-label="Close"
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                fontSize: 22,
                lineHeight: 1,
                cursor: "pointer",
                color: "#6b7280"
              }}
            >
              ×
            </button>
          </div>

          <div style={{ marginTop: 10 }} className="iem-meta">
            
            <div style={{ marginBottom: 8 }}>
              <div style={{ color: "#111827", fontWeight: 600, marginBottom: 6 }}>Description</div>
              <div style={{ color: "#374151" }}>{getBuildingInfo(selectedBuilding)?.description}</div>
            </div>

            {getBuildingInfo(selectedBuilding)?.exhibits && getBuildingInfo(selectedBuilding).exhibits.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ color: "#111827", fontWeight: 600, marginBottom: 6 }}>Exhibits</div>
              <div style={{ color: "#374151" }}>
                      {getBuildingInfo(selectedBuilding).exhibits.map((exhibit, index) => (
                        <span key={index} style={{
                          display: "inline-block",
                          background: "#f3f4f6",
                          color: "#374151",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          margin: "2px 4px 2px 0",
                          fontSize: "14px"
                        }}>
                          {exhibit}
                        </span>
                      ))}
              </div>
            </div>
                )}
            
            {navStatus && (
              <div style={{ marginTop: 6, color: "#059669", fontSize: 13 }}>{navStatus}</div>
            )}
            {/* Bookmark status message removed per request */}
          </div>

          {/* Actions - Fixed at bottom */}
          <div style={{ flexShrink: 0, marginTop: 16 }}>
            <div className="iem-actions">
              {/* {selectedBuilding && isBookmarked(selectedBuilding.id) ? (
                <button
                  type="button"
                  className="iem-btn iem-btn-gradient"
                  onClick={() => {
                    if (!selectedBuilding) return;
                    const id = selectedBuilding.id;
                    // Remove from cookie
                    removeBookmarkLocal(id);
                    // Notify dashboard if available
                    if (typeof window !== "undefined" && typeof window.removeBookmark === "function") {
                      try { window.removeBookmark(id); } catch {}
                    }
                    setBookmarkStatus("Removed from bookmarks");
                    setTimeout(() => setBookmarkStatus(""), 2000);
                    setIsClosing(true);
                    setTimeout(() => {
                      setIsSheetOpen(false);
                      setIsClosing(false);
                    }, 300);
                  }}
                  aria-label="Unbookmark"
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M6 3.5A2.5 2.5 0 0 1 8.5 1h7A2.5 2.5 0 0 1 18 3.5V21l-6-3.5L6 21V3.5Z" stroke="#ffffff" strokeWidth="2" fill="none"/>
                      <path d="M6 6 L18 18" stroke="#ffffff" strokeWidth="2"/>
                    </svg>
                    <span>Unbookmark</span>
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  className="iem-btn iem-btn-gradient"
                  onClick={() => {
                    if (!selectedBuilding) return;
                    const payload = { id: selectedBuilding.id, name: selectedBuilding.name };
                    const current = readBookmarks();
                    const exists = current.some((b) => String(b.id) === String(payload.id));
                    if (!exists) {
                      current.push(payload);
                      writeBookmarks(current);
                    }
                    if (typeof window !== "undefined" && typeof window.addBookmark === "function") {
                      try { window.addBookmark(payload); } catch {}
                    }
                    // no status message
                    setIsClosing(true);
                    setTimeout(() => {
                      setIsSheetOpen(false);
                      setIsClosing(false);
                    }, 300);
                  }}
                  aria-label="Bookmark"
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M6 3.5A2.5 2.5 0 0 1 8.5 1h7A2.5 2.5 0 0 1 18 3.5V21l-6-3.5L6 21V3.5Z" stroke="#ffffff" strokeWidth="2" fill="none"/>
                    </svg>
                    <span>Bookmark</span>
                  </span>
                </button>
              )} */}
              {!kiosk_mode && (
                <button
                type="button"
                className="iem-btn iem-btn-gradient"
                onClick={() => {
                  if(isNavigating){
                    setIsNavigating(false);
                    setTimeout(() => {
                      setIsNavigating(true);
                    }, 50);
                    return;
                  }
                  setNavStatus("Starting navigation...");
                  setTimeout(() => setNavStatus(""), 2000);
                  //setIsNavigating(false);
                  setIsNavigating(true);
                  setIsClosing(true);
                  setTimeout(() => {
                    setIsSheetOpen(false);
                    setIsClosing(false);
                  }, 300);
                  console.log("Navigate to", selectedBuilding);
                }}
                aria-label="Navigate"
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z" stroke="#ffffff" strokeWidth="2"/>
                    <path d="M9 15l6-3-3-6-3 9Z" fill="#ffffff"/>
                  </svg>
                  <span>Navigate</span>
                </span>
              </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
