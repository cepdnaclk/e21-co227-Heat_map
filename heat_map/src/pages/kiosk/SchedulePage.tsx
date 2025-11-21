import { useState, useEffect } from 'react'
// @ts-ignore - JavaScript module without TypeScript declarations
import { getAllEvents } from './utils/eventService'

interface Event {
  event_id: string;
  event_title: string;
  location: string;
  start_time: string;
  end_time: string;
  event_categories?: string[];
  categories?: string[];
}

interface SchedulePageTailwindProps {}

const SchedulePageTailwind: React.FC<SchedulePageTailwindProps> = () => {
  // State management
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [allEvents, setAllEvents] = useState<Event[]>([]) // All events
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<number>(0)
  
  // Fetch events from database
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        console.log('🔄 Fetching events...')
        setLoading(true)
        setError(null)
        
        // Fetch all events
        const data = await getAllEvents()
        console.log('📋 Events data received:', data)
        
        if (data && data.length > 0) {
          // Events are already in the correct format from the service
          console.log('✅ Setting events:', data.length, 'events')
          setAllEvents(data)
        } else {
          console.log('⚠️ No events found or empty array')
          setError('No events found')
        }
      } catch (err) {
        console.error('❌ Error fetching events:', err)
        setError('Failed to fetch events: ' + (err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
    
    // Set up interval to refresh events every minute
    const interval = setInterval(fetchEvents, 60000) // Refresh every minute
    
    return () => clearInterval(interval)
  }, [])

    // Helper function to compute event status from raw fields
  const getEventStatus = (event: Event): string => {
    const now = new Date()
    const eventStartDateTime = new Date(event.start_time)
    const eventEndDateTime = new Date(event.end_time)
    
    if (now >= eventEndDateTime) {
      return 'completed'
    } else if (now >= eventStartDateTime && now < eventEndDateTime) {
      return 'ongoing'
    } else {
      return 'upcoming'
    }
  }

  // Enhanced filter function - searches in all events when there's a query
  const getDisplayEvents = (): Event[] => {
    // Helper to get status order
    const getStatusOrder = (event: Event): number => {
      const status = getEventStatus(event)
      if (status === 'ongoing') return 0
      if (status === 'upcoming') return 1
      if (status === 'completed') return 2
      return 3 // unknown
    }

    let filteredEvents: Event[]
    if (searchQuery.trim()) {
      // Search query exists - search through all events
      const query = searchQuery.toLowerCase().trim()
      filteredEvents = allEvents.filter(event => {
        // Check if query is in title
        const titleMatch = event.event_title.toLowerCase().includes(query)
        // Check if query is in venue/location
        const locationMatch = event.location.toLowerCase().includes(query)
        // Check if query is in start_time or end_time (secondary matches)
        const startTimeMatch = event.start_time.toLowerCase().includes(query)
        const endTimeMatch = event.end_time.toLowerCase().includes(query)
        // Return true if any of the fields match
        return titleMatch || locationMatch || startTimeMatch || endTimeMatch
      })
    } else {
      // No search query - show all events
      filteredEvents = allEvents
    }
    // Sort by status: ongoing, upcoming, completed
    return filteredEvents.slice().sort((a, b) => getStatusOrder(a) - getStatusOrder(b))
  }

  const displayEvents = getDisplayEvents()
  
  // Update search results count after filtering (outside of render function)
  useEffect(() => {
    if (searchQuery.trim()) {
      setSearchResults(displayEvents.length)
    }
  }, [searchQuery, displayEvents.length])

  // Function to get status color
  const getStatusColor = (status: string): string => {
    switch(status) {
      case 'ongoing': return "#10b981" // Green
      case 'upcoming': return "#3b82f6" // Blue
      case 'completed': return "#6b7280" // Gray
      default: return "#6b7280" // Default Gray
    }
  }

  // Function to get status text
  const getStatusText = (status: string): string => {
    switch(status) {
      case 'ongoing': return "ONGOING"
      case 'upcoming': return "UPCOMING"
      case 'completed': return "COMPLETED"
      default: return "UNKNOWN"
    }
  }

  // Function to highlight search terms in text
  const highlightSearchTerm = (text: string, searchTerm: string): React.ReactNode => {
    if (!searchTerm.trim()) return text
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <span key={index} className="bg-yellow-300 text-black px-1 rounded font-semibold">{part}</span> : 
        part
    )
  }

  // Clear search function
  const clearSearch = () => {
    setSearchQuery('')
  }



  // Helper function to format time display
  const formatTimeForDisplay = (dateTimeString: string): string => {
    const date = new Date(dateTimeString)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    })
  }

  // Helper function to format duration display
  const formatDurationDisplay = (startTime: string, endTime: string): string => {
    return `${formatTimeForDisplay(startTime)} - ${formatTimeForDisplay(endTime)}`
  }

  return (
    <div className="w-full h-full p-0 box-border overflow-visible animate-fadeIn">
      <div className="max-w-7xl mx-auto p-8 h-auto w-full">
        
        {/* Page Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl text-white mb-8 font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
            {searchQuery ? 'Event Search Results' : 'Events Schedule'}
          </h1>
          
          {/* Description */}
          <p className="text-white/80 text-lg mb-6">
            Complete schedule of all events
          </p>
          
          {/* Enhanced Search Input */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by title, location, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-4 text-lg bg-white/90 border-none rounded-3xl text-gray-700 shadow-[0_4px_15px_rgba(0,0,0,0.1)] transition-all duration-300 focus:outline-none focus:shadow-[0_4px_20px_rgba(59,130,246,0.3)] focus:bg-white placeholder:text-gray-600 placeholder:opacity-80"
              />
              {searchQuery && (
                <button 
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gray-400/20 hover:bg-gray-400/40 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all duration-200"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            
            {/* Search Results Info */}
            {searchQuery && (
              <div className="mt-3 text-center">
                {searchResults > 0 ? (
                  <span className="text-green-400 font-medium">
                    Found {searchResults} event{searchResults !== 1 ? 's' : ''} matching "{searchQuery}"
                  </span>
                ) : (
                  <span className="text-red-400 font-medium">
                    No events found matching "{searchQuery}"
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Events Display Section */}
        <div className="flex flex-col gap-4 mt-8">
          {loading ? (
            <div className="text-center p-12">
              <p className="text-white text-xl">Loading events...</p>
            </div>
          ) : error ? (
            <div className="text-center p-12">
              <p className="text-red-400 text-xl mb-4">Error: {error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-6 py-3 bg-blue-500/30 text-white rounded-xl border border-blue-400/60 hover:bg-blue-500/50 transition-all duration-300"
              >
                Retry
              </button>
            </div>
          ) : displayEvents.length > 0 ? (
            // Map through display events and show each one
            displayEvents.map((event, index) => {
              const status = getEventStatus(event)
              return (
              <div 
                key={event.event_id || index} 
                className="bg-transparent  backdrop-blur-xl rounded-2xl border-2 border-[rgba(59,130,246,0.6)] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] animate-slideIn"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                {/* Status Badge */}
                <div 
                  className="absolute top-4 right-4 px-3 py-1 rounded-full text-white text-sm font-bold shadow-lg"
                  style={{ backgroundColor: getStatusColor(status) }}
                >
                  <span>
                    {getStatusText(status)}
                  </span>
                </div>
                
                {/* Event Information */}
                <div className="mt-8 flex justify-between items-start flex-wrap gap-4">
                  <div className="mb-2 flex-1">
                    <h3 className="text-3xl font-bold text-white mb-2">
                      {highlightSearchTerm(event.event_title, searchQuery)}
                    </h3>
                    <p className="text-blue-300 text-lg mb-2">
                      Duration: {highlightSearchTerm(formatDurationDisplay(event.start_time, event.end_time), searchQuery)}
                    </p>
                  </div>
                  
                  {/* Location and Time Container */}
                  <div className="flex gap-8 items-start"> 
                    <div className="flex flex-col gap-2 text-right min-w-[200px] items-end"> 
                      <span className="text-white/100 text-2xl font-medium block mb-1">Location</span>
                      <span className="text-[#FDE103] text-xl">
                        {highlightSearchTerm(event.location, searchQuery)}
                      </span>
                    </div>
                    
                    <div className="flex flex-col gap-2 text-right min-w-[200px] items-end">
                      <span className="text-white/100 text-2xl font-medium block mb-1">Start Time</span>
                      <span className="text-[#FDE103] text-xl">
                        {highlightSearchTerm(formatTimeForDisplay(event.start_time), searchQuery)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )})
          ) : (
            // Show appropriate message based on search state
            <div className="text-center p-12">
              {searchQuery ? (
                <div className="space-y-4">
                  <p className="text-white/70 text-xl">No events found matching "{searchQuery}"</p>
                  <button 
                    onClick={clearSearch} 
                    className="px-6 py-3 bg-blue-500/30 text-white rounded-xl border border-blue-400/60 hover:bg-blue-500/50 transition-all duration-300"
                  >
                    Show All Events
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-white/70 text-xl">No events are currently scheduled.</p>
                  <p className="text-white/50">Check back later for updates!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Custom animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
          .animate-slideIn { animation: slideIn 0.5s ease-out forwards; }
        `
      }} />
      
      {/* Add custom styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .tab-btn { 
            display: flex; 
            align-items: center; 
            justify-content: center; /* Center content */ 
            gap: 0.5rem; 
            padding: 0.75rem 0; /* Adjust vertical padding */ 
            background: rgba(255, 255, 255, 0.1); /* Lighter background */ 
            color: #e2e8f0; 
            border: none; /* Remove border */ 
            border-radius: 0; /* Remove border radius */ 
            font-size: 0.9rem; 
            font-weight: 600; 
            cursor: pointer; 
            transition: all 0.3s ease; 
            backdrop-filter: blur(10px); 
            flex: 1; /* Make tabs equal width */ 
          }
          .tab-btn.active { 
            background: rgba(59, 130, 246, 0.3); 
            border-color: rgba(59, 130, 246, 0.6); /* Lighter active background */ 
            color: white; 
            border: none; 
            box-shadow: none; /* Remove box shadow */ 
          }
        `
      }} />
    </div>
  )
}

export default SchedulePageTailwind
