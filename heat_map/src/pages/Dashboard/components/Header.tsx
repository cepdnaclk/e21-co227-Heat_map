import React, { useState } from 'react';
import { ChevronDown, Calendar, MapPin, Users, LogOut } from 'lucide-react';

interface HeaderProps {
  eventInfo: {
    title: string;
    date: string;
    location: string;
  };
  userInfo: {
    name: string;
    role: string;
    avatar?: string;
  };
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ eventInfo, userInfo, onLogout }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-white/20 shadow sticky top-0 z-50">
      <div className="px-4 py-4 md:px-8 flex items-center justify-between">
        {/* Event Info */}
        <div className="flex items-center space-x-6">
          <div className="hidden md:block">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {eventInfo.title}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
              <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 rounded-full">
                <Calendar size={16} className="text-blue-600" />
                <span className="font-medium">{eventInfo.date}</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1 bg-purple-50 rounded-full">
                <MapPin size={16} className="text-purple-600" />
                <span className="font-medium">{eventInfo.location}</span>
              </div>
            </div>
          </div>
          <div className="md:hidden">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {eventInfo.title}
            </h1>
            <div className="flex items-center space-x-2 text-xs text-gray-600 mt-1">
              <span className="px-2 py-1 bg-blue-50 rounded-full">{eventInfo.date}</span>
              <span className="px-2 py-1 bg-purple-50 rounded-full">{eventInfo.location}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-200">
                <Users size={18} className="text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-900">{userInfo.name}</p>
                <p className="text-xs text-gray-600">{userInfo.role}</p>
              </div>
              <ChevronDown size={16} className="text-gray-500 group-hover:text-gray-700 transition-colors duration-200" />
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 z-50 animate-fadeIn">
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Users size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{userInfo.name}</p>
                      <p className="text-sm text-gray-600">{userInfo.role}</p>
                    </div>
                  </div>
                </div>
                <div className="p-2 space-y-1">
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-xl flex items-center space-x-3 transition-all duration-200 group"
                  >
                    <LogOut size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
