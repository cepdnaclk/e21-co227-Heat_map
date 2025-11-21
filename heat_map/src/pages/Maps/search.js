// Search utility function for the frontend

const API = "http://localhost:3001"
export async function searchDatabase(query, { category, zone, subzone } = {}) {
  if (!query || query.trim() === '') return [];
  
  const params = new URLSearchParams();
  params.append('query', query);
  if (category) params.append('category', category);
  if (zone) params.append('zone', zone);
  if (subzone) params.append('subzone', subzone);
  
  try {
    const response = await fetch(`${API}/api/search?${params.toString()}`);
    if (!response.ok) throw new Error('Search request failed');
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

