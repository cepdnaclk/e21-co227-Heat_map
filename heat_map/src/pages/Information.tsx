import React, { useState, useEffect } from 'react';
import { 
  Info, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Users, 
  AlertCircle,
  Star,
  Wifi,
  Car,
  Utensils,
  ShoppingBag,
  Heart,
  Navigation,
  Loader2,
  RefreshCw
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface VenueInfo {
  description?: string;
  totalCapacity?: number;
  address?: string;
  rating?: number;
  phone?: string;
  emergencyPhone?: string;
  email?: string;
  eventsEmail?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

interface Facility {
  name: string;
  description: string;
  type: string;
  hours?: string;
}

interface OperatingHours {
  day: string;
  open: string;
  close: string;
  note?: string;
}

interface Announcement {
  title: string;
  message: string;
  date: Date;
  priority: 'high' | 'normal';
}

interface Category {
  id: string;
  label: string;
  icon: LucideIcon;
}

const Information: React.FC = () => {
  const [venueInfo, setVenueInfo] = useState<VenueInfo | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [operatingHours, setOperatingHours] = useState<OperatingHours[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('general');

  // Mock data for frontend-only version
  const mockVenueInfo: VenueInfo = {
    description: 'Welcome to our state-of-the-art venue facility, designed to host a wide variety of events and provide exceptional experiences for all visitors. Our facility features modern amenities, cutting-edge technology, and flexible spaces to accommodate events of all sizes.',
    totalCapacity: 5000,
    address: '123 Convention Center Blvd',
    rating: 4.8,
    phone: '(555) 123-4567',
    emergencyPhone: '(555) 123-4911',
    email: 'info@venue.com',
    eventsEmail: 'events@venue.com',
    city: 'University City',
    state: 'Academic State',
    zipCode: '12345'
  };

  const mockFacilities: Facility[] = [
    { name: 'Free WiFi', description: 'High-speed internet access throughout the venue', type: 'wifi', hours: '24/7' },
    { name: 'Parking', description: 'Ample parking spaces available for all visitors', type: 'parking', hours: '6:00 AM - 12:00 AM' },
    { name: 'Food Court', description: 'Various dining options and refreshment areas', type: 'restaurant', hours: '9:00 AM - 9:00 PM' },
    { name: 'Gift Shop', description: 'Souvenirs and venue merchandise available', type: 'shop', hours: '10:00 AM - 8:00 PM' },
    { name: 'Medical Center', description: 'First aid and medical assistance on-site', type: 'medical', hours: '8:00 AM - 10:00 PM' },
    { name: 'Information Desk', description: 'Helpful staff to assist with directions and queries', type: 'navigation', hours: '8:00 AM - 10:00 PM' }
  ];

  const mockOperatingHours: OperatingHours[] = [
    { day: 'Monday - Friday', open: '8:00 AM', close: '10:00 PM' },
    { day: 'Saturday', open: '9:00 AM', close: '11:00 PM' },
    { day: 'Sunday', open: '10:00 AM', close: '9:00 PM' },
    { day: 'Special Events', open: 'Variable', close: 'Variable', note: 'Hours may vary during special events and holidays' }
  ];

  const mockAnnouncements: Announcement[] = [
    {
      title: 'New Security Protocols',
      message: 'Enhanced security measures are now in place for all visitors. Please allow extra time for entry procedures and ensure you have valid identification.',
      date: new Date(Date.now() - 86400000), // 1 day ago
      priority: 'high'
    },
    {
      title: 'WiFi Network Upgrade',
      message: 'Our WiFi network has been upgraded for better performance. Connect to "VenueWiFi-2024" for the fastest speeds throughout the facility.',
      date: new Date(Date.now() - 172800000), // 2 days ago
      priority: 'normal'
    },
    {
      title: 'Parking Expansion',
      message: 'Additional parking spaces have been added to the north lot. Follow the new signage for easier navigation to available spots.',
      date: new Date(Date.now() - 259200000), // 3 days ago
      priority: 'normal'
    }
  ];

  useEffect(() => {
    loadInformationData();
  }, []);

  const loadInformationData = (): void => {
    try {
      setLoading(true);
      // Simulate loading delay
      setTimeout(() => {
        setVenueInfo(mockVenueInfo);
        setFacilities(mockFacilities);
        setOperatingHours(mockOperatingHours);
        setAnnouncements(mockAnnouncements);
        setError(null);
        setLoading(false);
      }, 800);
    } catch (err) {
      setError('Error loading venue information');
      console.error('Information loading error:', err);
      setLoading(false);
    }
  };

  const getFacilityIcon = (type: string): LucideIcon => {
    const iconMap: { [key: string]: LucideIcon } = {
      wifi: Wifi,
      parking: Car,
      restaurant: Utensils,
      shop: ShoppingBag,
      medical: Heart,
      navigation: Navigation
    };
    return iconMap[type] || Info;
  };

  const categories: Category[] = [
    { id: 'general', label: 'General Info', icon: Info },
    { id: 'facilities', label: 'Facilities', icon: MapPin },
    { id: 'hours', label: 'Operating Hours', icon: Clock },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'announcements', label: 'Announcements', icon: AlertCircle }
  ];

  // Loading Component
  const LoadingView = () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <Loader2 className="mx-auto mb-4 animate-spin text-blue-500" size={48} />
        <p className="text-gray-600">Loading venue information...</p>
      </div>
    </div>
  );

  // Error Component
  const ErrorView = () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Information</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={loadInformationData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="pt-8 pb-8">
        <LoadingView />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-8 pb-8">
        <ErrorView />
      </div>
    );
  }

  return (
    <div className="pt-8 pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Venue Information</h1>
        <p className="text-gray-500 text-lg">
          Essential information about our venue, facilities, and services
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Navigation */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information Categories</h2>
          <div className="flex flex-col gap-2">
            {categories.map((category) => {
              const IconComponent = category.icon;
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-3 w-full p-4 text-left border rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent 
                    size={20} 
                    color={isActive ? '#ffffff' : '#6b7280'} 
                  />
                  <span className="flex-1">
                    {category.label}
                  </span>
                  {category.id === 'announcements' && announcements.length > 0 && (
                    <span className={`ml-auto px-2 py-1 rounded-full text-xs font-medium ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {announcements.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Information Content */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          {selectedCategory === 'general' && venueInfo && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">General Information</h2>
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">About the Venue</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {venueInfo.description}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">Capacity</h3>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-500" />
                    <span className="text-gray-600">
                      Maximum capacity: {venueInfo.totalCapacity?.toLocaleString()} people
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">Location</h3>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-500" />
                    <span className="text-gray-600">
                      {venueInfo.address}, {venueInfo.city}, {venueInfo.state} {venueInfo.zipCode}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">Rating</h3>
                  <div className="flex items-center gap-2">
                    <Star size={16} className="text-yellow-500 fill-current" />
                    <span className="text-gray-600">
                      {venueInfo.rating}/5.0 (Based on visitor reviews)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedCategory === 'facilities' && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Facilities & Amenities</h2>
              <div className="grid grid-cols-1 gap-4">
                {facilities.map((facility, index) => {
                  const IconComponent = getFacilityIcon(facility.type);
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center gap-3 mb-2">
                        <IconComponent size={20} className="text-blue-500" />
                        <h4 className="font-semibold text-gray-900">{facility.name}</h4>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed mb-2">
                        {facility.description}
                      </p>
                      {facility.hours && (
                        <p className="text-gray-400 text-xs">
                          Hours: {facility.hours}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {selectedCategory === 'hours' && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Operating Hours</h2>
              <div className="flex flex-col gap-4">
                {operatingHours.map((schedule, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">{schedule.day}</span>
                      <span className="text-gray-600">
                        {schedule.open} - {schedule.close}
                      </span>
                    </div>
                    {schedule.note && (
                      <p className="text-gray-500 text-sm mt-1">
                        {schedule.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedCategory === 'contact' && venueInfo && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="flex flex-col gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Phone size={20} className="text-blue-500" />
                    <h3 className="font-semibold text-gray-900">Phone</h3>
                  </div>
                  <p className="text-gray-600">
                    Main: {venueInfo.phone}
                  </p>
                  <p className="text-gray-600">
                    Emergency: {venueInfo.emergencyPhone}
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail size={20} className="text-blue-500" />
                    <h3 className="font-semibold text-gray-900">Email</h3>
                  </div>
                  <p className="text-gray-600">
                    General: {venueInfo.email}
                  </p>
                  <p className="text-gray-600">
                    Events: {venueInfo.eventsEmail}
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin size={20} className="text-blue-500" />
                    <h3 className="font-semibold text-gray-900">Address</h3>
                  </div>
                  <p className="text-gray-600">
                    {venueInfo.address}
                  </p>
                  <p className="text-gray-600">
                    {venueInfo.city}, {venueInfo.state} {venueInfo.zipCode}
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedCategory === 'announcements' && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Important Announcements</h2>
              <div className="flex flex-col gap-4">
                {announcements.length > 0 ? announcements.map((announcement, index) => (
                  <div 
                    key={index} 
                    className={`p-4 border rounded-lg ${
                      announcement.priority === 'high' 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <AlertCircle 
                        size={20} 
                        className={announcement.priority === 'high' ? 'text-red-500' : 'text-blue-500'} 
                      />
                      <h3 className="font-semibold text-gray-900 flex-1">{announcement.title}</h3>
                      <span className="text-xs text-gray-500">
                        {new Date(announcement.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {announcement.message}
                    </p>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">No current announcements</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Information;
