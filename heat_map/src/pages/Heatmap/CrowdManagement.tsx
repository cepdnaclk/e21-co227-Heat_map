import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { RefreshCw, AlertTriangle, Bell, BellOff } from "lucide-react";
import SvgHeatmap from "./SvgHeatmap.jsx";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import GaugeChart from './HeatMapAnalysis/GaugeChart';
import EnhancedSearchBar from "./HeatMapAnalysis/EnhancedSearchBar";
import { LoadingView, ErrorView } from "./utils/uiHelpers";
import { fetchBuildingHistoryByName, getIntervalOptions, getPollOptions } from "./utils/api";

interface CrowdData {
  buildingId: string;  // Changed from number to string to match database
  buildingName: string;
  currentCount: number;
  predictedCount: number;
  timestamp: string;
  color: string;
  capacity: number;  // Made required since we have it in database
}

interface BuildingHistoryData {
  timestamp: string;
  current_count: number;
}

interface CapacityAlert {
  id: string;
  buildingId: string;  // Changed from number to string
  buildingName: string;
  currentCount: number;
  capacity: number;
  alertLevel: 'warning' | 'critical' | 'full';
  percentage: number;
  timestamp: string;
}

interface AlertSettings {
  enabled: boolean;
  warningThreshold: number; // 80%
  criticalThreshold: number; // 90%
  fullThreshold: number; // 100%
  showNotifications: boolean;
}

const CrowdManagement: React.FC = () => {
  const [crowdData, setCrowdData] = useState<CrowdData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"current" | "predicted">("current");
  const [selectedBuilding, setSelectedBuilding] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [buildingHistory, setBuildingHistory] = useState<BuildingHistoryData[]>([]);
  
  // Capacity Alert States
  const [alerts, setAlerts] = useState<CapacityAlert[]>([]);
  const [alertSettings, setAlertSettings] = useState<AlertSettings>({
    enabled: true,
    warningThreshold: 80,
    criticalThreshold: 90,
    fullThreshold: 100,
    showNotifications: true
  });
  
  const intervalOptions = getIntervalOptions();
  const [intervalMinutes, setIntervalMinutes] = useState<number>(() => 
    intervalOptions.includes(30) ? 30 : intervalOptions[0]
  );
  
  const pollOptions = getPollOptions();
  const [pollSeconds, setPollSeconds] = useState<number>(() => 
    pollOptions.includes(10) ? 10 : pollOptions[0]
  );

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const historyIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Request notification permission on component mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Get building capacity from the building data
  const getBuildingCapacity = useCallback((buildingId: string): number => {
    const building = crowdData.find(d => d.buildingId === buildingId);
    return building?.capacity || 100; // Default fallback
  }, [crowdData]);

  // Check for capacity alerts
  const checkCapacityAlerts = useCallback((data: CrowdData[]): CapacityAlert[] => {
    if (!alertSettings.enabled) return [];
    
    const newAlerts: CapacityAlert[] = [];
    
    data.forEach(building => {
      const capacity = building.capacity; // Use capacity directly from building data
      const percentage = Math.round((building.currentCount / capacity) * 100);
      
      let alertLevel: 'warning' | 'critical' | 'full' | null = null;
      
      if (percentage >= alertSettings.fullThreshold) {
        alertLevel = 'full';
      } else if (percentage >= alertSettings.criticalThreshold) {
        alertLevel = 'critical';
      } else if (percentage >= alertSettings.warningThreshold) {
        alertLevel = 'warning';
      }
      
      if (alertLevel) {
        newAlerts.push({
          id: `${building.buildingId}-${Date.now()}`,
          buildingId: building.buildingId,
          buildingName: building.buildingName,
          currentCount: building.currentCount,
          capacity,
          alertLevel,
          percentage,
          timestamp: new Date().toLocaleTimeString()
        });
      }
    });
    
    return newAlerts;
  }, [alertSettings]);

  // Fetch building history data when a building is selected, and refresh every 5 seconds
  useEffect(() => {
    if (selectedBuilding !== "all") {
      fetchBuildingHistory();
      historyIntervalRef.current = setInterval(fetchBuildingHistory, 5000);
    } else {
      setBuildingHistory([]);
      if (historyIntervalRef.current) {
        clearInterval(historyIntervalRef.current);
      }
    }

    return () => {
      if (historyIntervalRef.current) {
        clearInterval(historyIntervalRef.current);
      }
    };
  }, [selectedBuilding]);

  const fetchData = useCallback(async (): Promise<void> => {
    setError(null);
    
    // For now, always use the real building data since we're integrating with the database
    // Later, this can be updated to fetch from the actual database API
    setError("Using real building data from database.");
    
    // Real buildings data from database
    const realBuildings = [
      { id: 'B1', name: 'Engineering Carpentry Shop', capacity: 25 },
      { id: 'B2', name: 'Engineering Workshop', capacity: 60 },
      { id: 'B3', name: 'Building B3', capacity: 100 },
      { id: 'B4', name: 'Generator Room', capacity: 10 },
      { id: 'B5', name: 'Building B5', capacity: 100 },
      { id: 'B6', name: 'Structure Lab', capacity: 50 },
      { id: 'B7', name: 'Administrative Building', capacity: 100 },
      { id: 'B8', name: 'Canteen', capacity: 30 },
      { id: 'B9', name: 'Lecture Room 10/11', capacity: 80 },
      { id: 'B10', name: 'Engineering Library', capacity: 120 },
      { id: 'B11', name: 'Department of Chemical and Process Engineering', capacity: 80 },
      { id: 'B12', name: 'Security Unit', capacity: 20 },
      { id: 'B13', name: 'Drawing Office 2', capacity: 60 },
      { id: 'B14', name: 'Faculty Canteen', capacity: 30 },
      { id: 'B15', name: 'Department of Manufacturing and Industrial Engineering', capacity: 30 },
      { id: 'B16', name: 'Professor E.O.E. Perera Theater', capacity: 200 },
      { id: 'B17', name: 'Electronic Lab', capacity: 35 },
      { id: 'B18', name: 'Washrooms', capacity: 100 },
      { id: 'B19', name: 'Electrical and Electronic Workshop', capacity: 45 },
      { id: 'B20', name: 'Department of Computer Engineering', capacity: 30 },
      { id: 'B21', name: 'Building B21', capacity: 50 },
      { id: 'B22', name: 'Environmental Lab', capacity: 30 },
      { id: 'B23', name: 'Applied Mechanics Lab', capacity: 30 },
      { id: 'B24', name: 'New Mechanics Lab', capacity: 35 },
      { id: 'B25', name: 'Building B25', capacity: 50 },
      { id: 'B26', name: 'Building B26', capacity: 50 },
      { id: 'B27', name: 'Building B27', capacity: 50 },
      { id: 'B28', name: 'Materials Lab', capacity: 40 },
      { id: 'B29', name: 'Thermodynamics Lab', capacity: 40 },
      { id: 'B30', name: 'Fluids Lab', capacity: 50 },
      { id: 'B31', name: 'Surveying and Soil Lab', capacity: 70 },
      { id: 'B32', name: 'Department of Engineering Mathematics', capacity: 120 },
      { id: 'B33', name: 'Drawing Office 1', capacity: 50 },
      { id: 'B34', name: 'Department of Electrical and Electronic Engineering', capacity: 150 }
    ];

    const colors = ['#ff6b6b', '#4ecdc4', '#ff9f43', '#6c5ce7', '#a29bfe', '#74b9ff', '#fd79a8', '#fdcb6e', '#6c5ce7', '#55a3ff'];
    
    // Generate realistic crowd data based on building types and capacity
    const mockData: CrowdData[] = realBuildings.map((building, index) => {
      // Generate realistic occupancy based on building type and time
      let occupancyRate = 0.3; // Default 30%
      
      // Adjust occupancy based on building type
      if (building.name.toLowerCase().includes('canteen') || building.name.toLowerCase().includes('library')) {
        occupancyRate = 0.6 + Math.random() * 0.3; // 60-90% for popular areas
      } else if (building.name.toLowerCase().includes('lab') || building.name.toLowerCase().includes('workshop')) {
        occupancyRate = 0.4 + Math.random() * 0.4; // 40-80% for labs
      } else if (building.name.toLowerCase().includes('theater') || building.name.toLowerCase().includes('lecture')) {
        occupancyRate = 0.2 + Math.random() * 0.6; // 20-80% for lecture spaces
      } else if (building.name.toLowerCase().includes('washroom') || building.name.toLowerCase().includes('generator')) {
        occupancyRate = 0.1 + Math.random() * 0.2; // 10-30% for utility spaces
      }
      
      const currentCount = Math.floor(building.capacity * occupancyRate);
      const predictedCount = Math.max(0, Math.min(building.capacity, 
        currentCount + Math.floor((Math.random() - 0.5) * 20))); // ±10 people prediction
      
      return {
        buildingId: building.id,
        buildingName: building.name,
        currentCount,
        predictedCount,
        timestamp: new Date().toLocaleTimeString(),
        color: colors[index % colors.length],
        capacity: building.capacity
      };
    });
    
    setCrowdData(mockData);
    
    // Check for capacity alerts
    const newAlerts = checkCapacityAlerts(mockData);
    setAlerts(newAlerts);
    
    // Show notifications for new alerts
    newAlerts.forEach(alert => {
      if (alertSettings.showNotifications && "Notification" in window && Notification.permission === "granted") {
        const alertMessages = {
          warning: `⚠️ ${alert.buildingName} is at ${alert.percentage}% capacity`,
          critical: `🚨 ${alert.buildingName} is at ${alert.percentage}% capacity - Near Full!`,
          full: `🔴 ${alert.buildingName} is at FULL capacity (${alert.percentage}%)`
        };
        
        new Notification("Capacity Alert", {
          body: alertMessages[alert.alertLevel],
          icon: "/logo.png"
        });
      }
    });
    
    setLoading(false);
  }, [intervalMinutes, alertSettings, checkCapacityAlerts]);

  // Fetch crowd data initially and then on a user-defined cadence (seconds). 0 means paused.
  useEffect(() => {
    fetchData();
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (pollSeconds > 0) {
      intervalRef.current = setInterval(fetchData, pollSeconds * 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData, pollSeconds]);

  // Filter data by building or search term
  const filteredData: CrowdData[] = useMemo(() => {
    if (selectedBuilding !== "all") {
      // If a specific building is selected, show only that building
      return crowdData.filter((d) => d.buildingId === selectedBuilding);
    } else if (searchTerm.trim()) {
      // If searching, filter by building name
      return crowdData.filter((d) =>
        d.buildingName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      // Show all buildings
      return crowdData;
    }
  }, [crowdData, selectedBuilding, searchTerm]);

  const fetchBuildingHistory = useCallback(async (): Promise<void> => {
    if (selectedBuilding === "all") return;
    try {
      const selectedBuildingData = crowdData.find(
        (d) => d.buildingId === selectedBuilding
      );
      if (selectedBuildingData) {
        const buildingName = selectedBuildingData.buildingName;
        const data = await fetchBuildingHistoryByName(buildingName);
        setBuildingHistory(data);
      }
    } catch (err) {
      console.error("Error fetching building history:", err);
      // Use mock history data for development
      const mockHistory: BuildingHistoryData[] = Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - (23 - i) * 5000).toLocaleTimeString(),
        current_count: Math.floor(Math.random() * 100) + 20
      }));
      setBuildingHistory(mockHistory);
    }
  }, [crowdData, selectedBuilding]);

  // Fetch building history when a building is selected, with periodic refresh (same cadence)
  useEffect(() => {
    if (selectedBuilding !== "all") {
      fetchBuildingHistory();
      if (historyIntervalRef.current) clearInterval(historyIntervalRef.current);
      if (pollSeconds > 0) {
        historyIntervalRef.current = setInterval(fetchBuildingHistory, pollSeconds * 1000);
      }
    } else {
      setBuildingHistory([]);
      if (historyIntervalRef.current) clearInterval(historyIntervalRef.current);
    }
    return () => {
      if (historyIntervalRef.current) clearInterval(historyIntervalRef.current);
    };
  }, [selectedBuilding, fetchBuildingHistory, pollSeconds]);

  const handleSearch = (query: string): void => {
    setSearchTerm(query);
    // If search is cleared, reset to show all buildings
    if (!query.trim()) {
      setSelectedBuilding("all");
    }
  };

  const handleBuildingSelect = (id: string): void => {
    setSelectedBuilding(id);
    // Clear search when building is selected from dropdown or search suggestions
    if (id !== "all") {
      setSearchTerm("");
    }
  };

  if (loading) {
    return (
      <div className="pt-24 pb-8 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <LoadingView message="Loading crowd data..." />
        </div>
      </div>
    );
  }

  if (error && crowdData.length === 0) {
    return (
      <div className="pt-24 pb-8 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <ErrorView error={error} onRetry={fetchData} />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-8 min-h-screen bg-gray-50">
      <style>{`
        .chart-scroll-container::-webkit-scrollbar {
          height: 14px;
        }
        .chart-scroll-container::-webkit-scrollbar-track {
          background: linear-gradient(90deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        .chart-scroll-container::-webkit-scrollbar-thumb {
          background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
          border-radius: 8px;
          border: 2px solid #f8fafc;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .chart-scroll-container::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(90deg, #2563eb 0%, #1e40af 100%);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        .chart-scroll-container::-webkit-scrollbar-corner {
          background: #f8fafc;
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-xl shadow-sm">
          <h1 className="text-3xl font-bold text-gray-800 m-0">Crowd Management</h1>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white border-0 rounded-lg font-medium cursor-pointer transition-all duration-200 shadow-md hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-lg"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Live Timestamp */}
        <div className="text-sm text-gray-500 mb-6 bg-white px-4 py-3 rounded-lg border-l-4 border-emerald-500">
          <strong>Live Data Time:</strong> {crowdData[0]?.timestamp || "--:--"}
        </div>

        {/* Controls Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8 relative z-20">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex flex-col gap-2 flex-shrink-0">
              <label className="text-sm font-medium text-gray-700">View Mode:</label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as "current" | "predicted")}
                className="px-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm transition-all duration-150 min-w-[150px] focus:outline-none focus:border-blue-500 focus:shadow-sm focus:shadow-blue-100"
              >
                <option value="current">Current</option>
                <option value="predicted">Predicted</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 flex-shrink-0">
              <label className="text-sm font-medium text-gray-700">Building:</label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedBuilding("all");
                    setSearchTerm("");
                  }}
                  className={`px-4 py-3 border rounded-lg font-medium text-sm transition-all duration-150 focus:outline-none ${
                    selectedBuilding === "all"
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  All
                </button>
                <select
                  value={selectedBuilding}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedBuilding(value);
                    // Clear search when building is selected from dropdown
                    if (value !== "all") {
                      setSearchTerm("");
                    }
                  }}
                  className="px-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm transition-all duration-150 min-w-[150px] focus:outline-none focus:border-blue-500 focus:shadow-sm focus:shadow-blue-100"
                >
                  <option value="all">All Buildings</option>
                  {crowdData.map((d) => (
                    <option key={d.buildingId} value={d.buildingId}>
                      {d.buildingName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2 flex-shrink-0">
              <label className="text-sm font-medium text-gray-700">Horizon (mins):</label>
              <select
                value={intervalMinutes}
                onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                className="px-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm transition-all duration-150 min-w-[150px] focus:outline-none focus:border-blue-500 focus:shadow-sm focus:shadow-blue-100"
              >
                {intervalOptions.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2 flex-shrink-0">
              <label className="text-sm font-medium text-gray-700">Auto-refresh (sec):</label>
              <select
                value={pollSeconds}
                onChange={(e) => setPollSeconds(Number(e.target.value))}
                className="px-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm transition-all duration-150 min-w-[150px] focus:outline-none focus:border-blue-500 focus:shadow-sm focus:shadow-blue-100"
              >
                {pollOptions.map(s => (
                  <option key={s} value={s}>{s === 0 ? "Paused" : s}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2 flex-shrink-0">
              <label className="text-sm font-medium text-gray-700">Search Buildings:</label>
              <EnhancedSearchBar 
                onSearch={handleSearch}
                onBuildingSelect={handleBuildingSelect}
                buildings={crowdData.map(d => ({
                  buildingId: d.buildingId,
                  buildingName: d.buildingName
                }))}
                placeholder="Search buildings..."
              />
            </div>

            <div className="flex flex-col gap-2 flex-shrink-0">
              <label className="text-sm font-medium text-gray-700">Alerts:</label>
              <button
                onClick={() => setAlertSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                className={`flex items-center gap-2 px-3 py-3 border rounded-lg font-medium text-sm transition-all duration-150 min-w-[120px] focus:outline-none ${
                  alertSettings.enabled 
                    ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                }`}
              >
                {alertSettings.enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                {alertSettings.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        </div>

        {/* Capacity Alerts Display */}
        {alerts.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border-l-4 border-orange-500">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-800">Capacity Alerts</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.alertLevel === 'full' 
                      ? 'bg-red-50 border-red-500' 
                      : alert.alertLevel === 'critical'
                      ? 'bg-orange-50 border-orange-500'
                      : 'bg-yellow-50 border-yellow-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">{alert.buildingName}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      alert.alertLevel === 'full' 
                        ? 'bg-red-100 text-red-800' 
                        : alert.alertLevel === 'critical'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {alert.percentage}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {alert.currentCount} / {alert.capacity} capacity
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {alert.timestamp}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Heat Map Section */}
        <div className="mb-8">
          {/* <HeatMap /> */}
          <SvgHeatmap />
        </div>

        {/* Main Content Layout */}
        <div className="flex gap-8">
          {/* Main Content */}
          <div className={`flex-1 transition-all duration-300 ${selectedBuilding !== "all" ? 'mr-96' : ''}`}>
            <div className="flex flex-col gap-8">
              {/* Overall Crowd Trend */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Chart Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-1">Overall Crowd Trend</h2>
                      <p className="text-sm text-gray-600">Real-time occupancy data across all buildings</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      Live Data
                    </div>
                  </div>
                </div>
                
                {/* Chart Container */}
                <div className="p-8">
                  <div className="flex justify-center">
                    <div 
                      className="border-2 border-gray-200 rounded-xl bg-gradient-to-br from-gray-50 to-white chart-scroll-container shadow-inner"
                      style={{ 
                        maxWidth: 'calc(100vw - 200px)', // Account for page margins and padding
                        width: '100%',
                        overflowX: 'auto',
                        overflowY: 'hidden',
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#CBD5E0 #F7FAFC'
                      }}
                    >
                      <div 
                        style={{ 
                          width: Math.max(1200, filteredData.length * 140), // Increased spacing for better readability
                          height: 400, // Increased height
                          padding: '20px'
                        }}
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={filteredData} margin={{ top: 30, right: 40, left: 30, bottom: 100 }}>
                            <defs>
                              <linearGradient id="currentGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                              </linearGradient>
                              <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" opacity={0.7} />
                            <XAxis 
                              dataKey="buildingName"
                              tick={{ fontSize: 10, fill: '#374151' }}
                              angle={-45}
                              textAnchor="end"
                              height={90}
                              interval={0}
                              stroke="#6b7280"
                            />
                            <YAxis 
                              tick={{ fontSize: 11, fill: '#374151' }}
                              stroke="#6b7280"
                              label={{ value: 'Occupancy Count', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#374151' } }}
                            />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid #e5e7eb',
                                borderRadius: '12px',
                                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                                fontSize: '13px'
                              }}
                            />
                            <Legend 
                              wrapperStyle={{
                                paddingTop: '20px',
                                fontSize: '13px',
                                fontWeight: '500'
                              }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="currentCount" 
                              name="Current Count" 
                              stroke="#8884d8" 
                              strokeWidth={3}
                              dot={{ r: 6, fill: '#8884d8', strokeWidth: 2, stroke: '#ffffff' }}
                              activeDot={{ r: 8, fill: '#8884d8', strokeWidth: 3, stroke: '#ffffff' }} 
                            />
                            <Line 
                              type="monotone" 
                              dataKey="predictedCount" 
                              name="Predicted Count" 
                              stroke="#82ca9d" 
                              strokeWidth={3}
                              strokeDasharray="5 5"
                              dot={{ r: 6, fill: '#82ca9d', strokeWidth: 2, stroke: '#ffffff' }}
                              activeDot={{ r: 8, fill: '#82ca9d', strokeWidth: 3, stroke: '#ffffff' }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chart Info */}
                  <div className="mt-6 flex items-center justify-center">
                    <div className="bg-blue-50 px-6 py-3 rounded-full border border-blue-200">
                      <p className="text-sm text-blue-700 font-medium flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Scroll horizontally to view all {filteredData.length} buildings
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar for Selected Building */}
          {selectedBuilding !== "all" && (
            <div className="fixed right-8 top-32 bottom-8 w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-y-auto z-30">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-40">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {crowdData.find(d => d.buildingId === selectedBuilding)?.buildingName}
                  </h3>
                  <button
                    onClick={() => setSelectedBuilding("all")}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-4 space-y-6">
                {/* Gauge Chart for Selected Building */}
                <div className="bg-gray-50 rounded-lg p-4">
                  {crowdData
                    .filter(d => d.buildingId === selectedBuilding)
                    .map(building => (
                      <GaugeChart
                        key={building.buildingId}
                        value={building.currentCount}
                        max={getBuildingCapacity(building.buildingId)}
                        title={`Occupancy`}
                      />
                    ))}
                </div>
                
                {/* Bar Chart */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Current vs Predicted</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={filteredData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" hide />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="currentCount" fill="#8884d8" />
                      <Bar dataKey="predictedCount" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Building History Chart */}
                {buildingHistory.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">
                      Past 2 Minutes Variation
                    </h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={buildingHistory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" hide />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="current_count" 
                          name="Current Count"
                          stroke="#8884d8" 
                          activeDot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
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

export default CrowdManagement;