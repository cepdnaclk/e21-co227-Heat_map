/**
 * Shared UI utility functions and components
 */
import React from 'react';
import { AlertTriangle, Info, Calendar } from 'lucide-react';

/**
 * Common loading component
 */
export const LoadingView = ({ message = 'Loading...' }) => (
  <div className="container" style={{ paddingTop: '2rem', textAlign: 'center' }}>
    <div>{message}</div>
  </div>
);

/**
 * Common error component with retry functionality
 */
export const ErrorView = ({ error, onRetry, icon: IconComponent = AlertTriangle }) => (
  <div className="container" style={{ paddingTop: '2rem' }}>
    <div style={{ color: '#ef4444', textAlign: 'center' }}>
      <IconComponent size={48} style={{ margin: '0 auto 1rem' }} />
      <h2>Error Loading Data</h2>
      <p>{error}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      )}
    </div>
  </div>
);

/**
 * Common data loading hook
 */
export const useDataLoader = (loadFunction, dependencies = []) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await loadFunction();
    } catch (err) {
      setError(err.message || 'An error occurred while loading data');
    } finally {
      setLoading(false);
    }
  }, [loadFunction]);

  React.useEffect(() => {
    loadData();
  }, dependencies);

  return { loading, error, retry: loadData };
};

/**
 * Common percentage calculation
 */
export const getPercentage = (current, total) => {
  return Math.round((current / total) * 100);
};

/**
 * Generate calendar days for month view
 */
export const generateCalendarDays = (selectedDate) => {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const days = [];
  const current = new Date(startDate);
  
  for (let i = 0; i < 42; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return days;
};

/**
 * Common button styles
 */
export const buttonStyles = {
  primary: {
    padding: '0.5rem 1rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem'
  },
  secondary: {
    padding: '0.5rem 1rem',
    backgroundColor: 'white',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem'
  },
  danger: {
    padding: '0.5rem 1rem',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem'
  }
};

/**
 * Common card styles
 */
export const cardStyles = {
  base: {
    padding: '1.5rem',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  hover: {
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }
  }
};

export default {
  LoadingView,
  ErrorView,
  useDataLoader,
  getPercentage,
  generateCalendarDays,
  buttonStyles,
  cardStyles
};
