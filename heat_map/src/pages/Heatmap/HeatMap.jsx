import React, { useMemo } from 'react';

// A data-driven HeatMap component that renders building tiles from backend data
// Props:
// - data: Array<{ buildingId, buildingName?, color?, count, capacity? }>
// - onSelectBuilding?: (id) => void
// - selectedBuilding?: string | number
const HeatMap = ({ data = [], onSelectBuilding, selectedBuilding } = {}) => {
  // Compute intensity per building (0..1). Prefer capacity if available, else normalize by max count
  const { items, maxCount } = useMemo(() => {
    const max = data.reduce((m, d) => Math.max(m, Number(d.count) || 0), 0) || 1;
    const items = data.map(d => {
      const count = Number(d.count) || 0;
      const cap = Number(d.capacity) || 0;
      const intensity = cap > 0 ? Math.min(1, count / cap) : (count / max);
      return { ...d, count, capacity: cap || undefined, intensity };
    });
    return { items, maxCount: max };
  }, [data]);

  const getColor = (intensity) => {
    if (intensity < 0.25) return 'rgba(30, 175, 47, 0.85)'; // Blue
    if (intensity < 0.5) return 'rgba(246, 250, 7, 0.85)'; // Green
    if (intensity < 0.75) return 'rgba(217, 119, 6, 0.8)'; // Orange
    return 'rgba(220, 38, 38, 0.9)'; // Red
  };

  if (!items.length) {
    return (
      <div className="p-4 bg-white rounded-xl border border-gray-200 text-center text-gray-500">
        No crowd data available.
      </div>
    );
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 className="text-2xl">Real-Time Crowd Heat Map</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: 'rgba(30, 64, 175, 0.6)', border: '1px solid #1e40af' }}></div>
            <span>Low</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: 'rgba(5, 150, 105, 0.7)', border: '1px solid #059669' }}></div>
            <span>Medium</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: 'rgba(217, 119, 6, 0.8)', border: '1px solid #d97706' }}></div>
            <span>High</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: 'rgba(220, 38, 38, 0.9)', border: '1px solid #dc2626' }}></div>
            <span>Critical</span>
          </div>
        </div>
      </div>

      {/* Simple responsive grid of building tiles */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '12px'
      }}>
        {items.map((b) => (
          <button
            key={b.buildingId}
            onClick={() => onSelectBuilding && onSelectBuilding(String(b.buildingId))}
            style={{
              padding: '12px',
              borderRadius: '10px',
              border: String(selectedBuilding) === String(b.buildingId) ? '2px solid #2563eb' : '1px solid #e5e7eb',
              background: 'white',
              textAlign: 'left',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              cursor: 'pointer'
            }}
            title={`${b.buildingName || 'Building ' + b.buildingId} - ${b.count}${b.capacity ? ' / ' + b.capacity : ''}`}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{b.buildingName || `Building ${b.buildingId}`}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>ID: {b.buildingId}</div>
              </div>
              <div style={{ fontWeight: 700 }}>{b.count}</div>
            </div>
            <div style={{ marginTop: 10, width: '100%', height: 10, background: '#e5e7eb', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, Math.round(b.intensity * 100))}%`, height: '100%', background: b.color || getColor(b.intensity), transition: 'width 0.3s ease' }} />
            </div>
            {b.capacity ? (
              <div style={{ marginTop: 6, fontSize: 12, color: '#6b7280' }}>
                {Math.round(b.intensity * 100)}% of capacity ({b.count} / {b.capacity})
              </div>
            ) : (
              <div style={{ marginTop: 6, fontSize: 12, color: '#6b7280' }}>
                Relative intensity based on max count ({maxCount})
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HeatMap;
