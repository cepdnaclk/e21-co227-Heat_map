import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    // Footer container: light blue background, dark gray text, top padding, and sticks to the bottom
    <footer className="bg-[#EAF7FC] text-gray-800 pt-12 mt-auto">
      
      {/* Max-width container to center content with horizontal padding */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Responsive Grid Layout:
            - Stacks to 1 column on mobile (default)
            - Becomes 2 columns on medium screens (md)
            - Expands to 4 columns on large screens (lg)
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 text-center md:text-left">
          
          {/* Column 1: About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">
              Event Management System
            </h3>
            <p className="leading-relaxed">
              Advanced crowd management and event scheduling platform for efficient 
              event organization and real-time monitoring.
            </p>
          </div>
          
          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/" className="hover:text-[#1E56A0] transition-colors">Dashboard</a></li>
              <li><a href="/crowd-management" className="hover:text-[#1E56A0] transition-colors">Crowd Management</a></li>
              <li><a href="/events" className="hover:text-[#1E56A0] transition-colors">Event Schedule</a></li>
              <li><a href="/information" className="hover:text-[#1E56A0] transition-colors">Information</a></li>
            </ul>
          </div>
          
          {/* Column 3: Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-4">Contact Info</h4>
            {/* Flex container for contact items: centered on mobile, left-aligned on larger screens */}
            <div className="flex flex-col items-center md:items-start gap-3">
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>Faculty of Engineering-University of Peradeniya</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} />
                <span>  AR Office: +94 81 239 3305</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <span>deanoffice@eng.pdn.ac.lk</span>
              </div>
            </div>
          </div>
          
          {/* Column 4: Emergency Contacts */}
          <div>
            <h4 className="text-lg font-bold mb-4">Emergency Contacts</h4>
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="text-red-500">
                <strong>Health Center: 0812388152</strong>
              </div>
              <div className="text-amber-500">
                <strong>Fire Brigade:  0812224444</strong>
              </div>
              <div className="text-emerald-500">
                <strong>Police Station, Peradeniya: 0812388222</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Copyright Bar */}
      <div className="bg-[#1E56A0] text-white py-4 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Crowd Management System. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;