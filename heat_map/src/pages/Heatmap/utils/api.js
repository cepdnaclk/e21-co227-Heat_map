// Simple API client for the frontend to talk to the backend (code 1)
// Uses VITE_API_BASE if provided, else defaults to http://localhost:5000

const API_BASE = import.meta.env.VITE_API_BASE || import.meta.env.VITE_MAIN_API_URL || 'http://localhost:5000';

export async function fetchCrowd(intervalMinutes = 30) {
  const url = `${API_BASE}/api/crowd?interval=${encodeURIComponent(intervalMinutes)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch crowd data (${res.status})`);
  return res.json();
}

export async function fetchBuildingHistoryByName(buildingName) {
  const url = `${API_BASE}/api/building-history/${encodeURIComponent(buildingName)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch history for ${buildingName} (${res.status})`);
  return res.json();
}

// Get interval options from frontend env (comma-separated), else default list
export function getIntervalOptions() {
  const raw = import.meta.env.VITE_INTERVALS;
  if (raw && typeof raw === 'string') {
    const arr = raw
      .split(',')
      .map(s => Number(String(s).trim()))
      .filter(n => Number.isFinite(n) && n > 0);
    if (arr.length) return arr;
  }
  // Default candidates commonly supported by the backend
  return [1, 2, 5, 10, 15, 30, 60, 120];
}

// Polling options (seconds) for auto-refresh. From VITE_POLL_SECONDS (comma-separated), else sensible defaults
export function getPollOptions() {
  const raw = import.meta.env.VITE_POLL_SECONDS;
  if (raw && typeof raw === 'string') {
    const arr = raw
      .split(',')
      .map(s => Number(String(s).trim()))
      .filter(n => Number.isFinite(n) && n >= 0);
    if (arr.length) return arr;
  }
  // Include 0 to allow "Paused"
  return [0, 5, 10, 15, 30, 60, 120];
}

// no default export to keep tree-shaking clean