import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-full flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="text-center max-w-md mx-auto">
        {/* Error Icon */}
        <div className="mb-8">
          <AlertTriangle className="mx-auto text-red-500 mb-4" size={80} />
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-500 leading-relaxed mb-8">
            The page you are looking for might have been moved, deleted, or doesn't exist.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            <Home size={20} />
            Go Back Home
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
          >
            Go Back
          </button>
        </div>

        {/* Additional Help */}
        <div className="mt-12 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Need Help?
          </h3>
          <p className="text-gray-600 mb-4">
            If you think this is a mistake, please contact our support team.
          </p>
          <div className="flex flex-col gap-2 text-sm text-gray-500">
            <p>
              <span className="font-medium">Email:</span> support@venue.com
            </p>
            <p>
              <span className="font-medium">Phone:</span> (555) 123-4567
            </p>
          </div>
        </div>

        {/* Suggested Pages */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Popular Pages
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link 
              to="/" 
              className="p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left"
            >
              <div className="font-medium text-gray-900">Home</div>
              <div className="text-sm text-gray-500">Return to homepage</div>
            </Link>
            
            <Link 
              to="/information" 
              className="p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left"
            >
              <div className="font-medium text-gray-900">Information</div>
              <div className="text-sm text-gray-500">Venue details & contact</div>
            </Link>
            
            <Link 
              to="/dashboard" 
              className="p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left"
            >
              <div className="font-medium text-gray-900">Dashboard</div>
              <div className="text-sm text-gray-500">Event dashboard</div>
            </Link>
            
            <Link 
              to="/events" 
              className="p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left"
            >
              <div className="font-medium text-gray-900">Events</div>
              <div className="text-sm text-gray-500">Browse events</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
