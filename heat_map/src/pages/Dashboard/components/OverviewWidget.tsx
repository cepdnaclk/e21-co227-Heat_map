import React, { useState, useEffect } from "react";
import axios from "axios";
import { TrendingUp, Users, MapPin, Clock, BarChart3, Loader } from "lucide-react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Register chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Session {
  name: string;
  visitors: number;
  color: string;
}

const OverviewWidget: React.FC = () => {
  const [zone, setZone] = useState("1");
  const [building, setBuilding] = useState<string>("B13"); // Default: Drawing Office 2

  const [stats, setStats] = useState({
    totalVisitors: 0,
    totalCheckIns: 0,
    avgDuration: "0m",
    repeatVisitors: 0,
  });

  const [topSessions, setTopSessions] = useState<Session[]>([]);
  const [buildingData, setBuildingData] = useState<{ [key: string]: number }>({});
  const [fetchData, setFetchData] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Updated building IDs mapping
  const zoneBuildings: Record<string, { name: string; id: string }[]> = {
    "1": [
      { name: "Drawing Office 2", id: "B13" },
      { name: "Department of Manufacturing and Industrial Engineering", id: "B15" },
      { name: "Structures Laboratory", id: "B6" },
      { name: "Engineering Library", id: "B10" },
    ],
    "2": [
      { name: "Drawing Office 1", id: "B33" },
      { name: "Professor E.O.E. Pereira Theatre", id: "B16" },
      { name: "Administrative Building", id: "B7" },
      { name: "Security Unit", id: "B12" },
      { name: "Department of Chemical and Process Engineering", id: "B11" },
    ],
    "3": [
      { name: "Department of Electrical and Electronic Engineering", id: "B34" },
      { name: "Department of Computer Engineering", id: "B20" },
      { name: "Electrical and Electronic Workshop", id: "B19" },
      { name: "Surveying and Soil Lab", id: "B31" },
      { name: "Materials Lab", id: "B28" },
    ],
    "4": [
      { name: "Fluids Lab", id: "B30" },
      { name: "New Mechanics Lab", id: "B24" },
      { name: "Applied Mechanics Lab", id: "B23" },
      { name: "Thermodynamics Lab", id: "B29" },
      { name: "Generator Room", id: "B4" },
      { name: "Engineering Workshop", id: "B2" },
      { name: "Engineering Carpentry Shop", id: "B1" },
    ],
    "5": [
      { name: "Environmental Lab", id: "B22" },
    ],
  };

  useEffect(() => {
    if (!fetchData) return;

    async function fetchStats() {
      setLoading(true);

      try {
        const baseURL = "http://localhost:5006/analytics";
        console.log(`Fetching data for building: ${building}`);

        const [
          totalVisitorsRes,
          totalCheckInsRes,
          avgDurationRes,
          repeatVisitorsRes,
          topSessionsRes,
          buildingDataRes,
        ] = await Promise.all([
          axios.get(`${baseURL}/total-visitors`, { params: { buildingId: building } }),
          axios.get(`${baseURL}/total-checkins`, { params: { buildingId: building } }),
          axios.get(`${baseURL}/avg-duration`, { params: { buildingId: building } }),
          axios.get(`${baseURL}/repeat-visitors`, { params: { buildingId: building } }),
          axios.get(`${baseURL}/top3-buildings`),
          axios.get(`${baseURL}/visitors-per-building`),
        ]);

        setStats({
          totalVisitors: totalVisitorsRes.data.total_visitors || 0,
          totalCheckIns: totalCheckInsRes.data.total_checkins || 0,
          avgDuration: avgDurationRes.data.averageDuration || "0m",
          repeatVisitors: repeatVisitorsRes.data.repeatVisitors || 0,
        });

        const buildingStats: { [key: string]: number } = {};
        buildingDataRes.data.forEach((item: any) => {
          buildingStats[item.building] = parseInt(item.total_visitors);
        });
        setBuildingData(buildingStats);

        const sessions: Session[] = topSessionsRes.data
          ? topSessionsRes.data.map((s: any) => ({
              name: s.building,
              visitors: parseInt(s.visitors),
              color: "blue",
            }))
          : [];
        setTopSessions(sessions);

        setFetchData(false);
      } catch (err) {
        console.error("Failed to fetch stats", err);
        setTopSessions([]);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [fetchData, building]);

  const barChartData = {
    labels: Object.keys(buildingData),
    datasets: [
      {
        label: "Total Visitors",
        data: Object.values(buildingData),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-green-600",
      purple: "from-purple-500 to-purple-600",
      yellow: "from-yellow-400 to-yellow-500",
    };
    return colors[color as keyof typeof colors];
  };

  const getBgColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-50/80",
      green: "bg-green-50/80",
      purple: "bg-purple-50/80",
      yellow: "bg-yellow-50/80",
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="space-y-8">
      {/* 🔽 Filters Row */}
      <div className="flex flex-wrap justify-end gap-3">
        {/* Zone Dropdown */}
        <select
          value={zone}
          onChange={(e) => {
            const selectedZone = e.target.value;
            setZone(selectedZone);
            setBuilding(zoneBuildings[selectedZone][0].id);
          }}
          className="border rounded-lg px-3 py-2"
        >
          <option value="1">Zone A</option>
          <option value="2">Zone B</option>
          <option value="3">Zone C</option>
          <option value="4">Zone D</option>
          <option value="5">Other</option>
        </select>

        {/* Building Dropdown */}
        <select value={building} onChange={(e) => setBuilding(e.target.value)} className="border rounded-lg px-3 py-2">
          {zoneBuildings[zone].map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <button
          onClick={() => setFetchData(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Get Data
        </button>

        {loading && (
          <div className="flex items-center text-sm text-gray-500">
            <Loader size={16} className="animate-spin mr-2" />
            <span>Loading...</span>
          </div>
        )}
      </div>

      {/* 📊 Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[{ label: "Total Attendees", value: stats.totalVisitors, change: "+12%", icon: Users, color: "blue" },
        { label: "Check-ins", value: stats.totalCheckIns, change: "+8%", icon: MapPin, color: "green" },
        { label: "Avg. Session Time", value: stats.avgDuration, change: "+15%", icon: Clock, color: "purple" },
        { label: "Repeat Visitors", value: stats.repeatVisitors, change: "+10%", icon: BarChart3, color: "yellow" }].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className={`absolute inset-0 ${getBgColorClasses(stat.color)} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              ></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${getColorClasses(stat.color)} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon size={24} />
                  </div>
                  <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 rounded-full">
                    <TrendingUp size={14} className="text-green-600" />
                    <span className="text-sm font-semibold text-green-700">{stat.change}</span>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 📈 Bar Chart and Top Sessions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 📈 Bar Chart */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Visitors per Building</h3>
          </div>
          <div className="h-64">
            <Bar 
              data={barChartData} 
              options={{
                responsive: true,
                scales: {
                  x: { display: false },
                },
                plugins: {
                  tooltip: {
                    callbacks: {
                      title: (tooltipItem) => tooltipItem[0].label,
                      label: (tooltipItem) => `Visitors: ${tooltipItem.raw}`,
                    },
                  },
                },
              }} 
            />
          </div>
        </div>

        {/* 📈 Top Sessions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Top Sessions</h3>
            <div className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">Top 3</div>
          </div>
          <div className="space-y-4">
            {topSessions.length === 0 ? (
              <p className="text-gray-400 text-sm text-center">No sessions available</p>
            ) : (
              topSessions.map((session, i) => (
                <div
                  key={i}
                  className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50/50 to-white/50 rounded-xl border border-white/50 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 bg-${session.color}-500 rounded-full`}></div>
                    <span className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors duration-200">
                      {session.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-700">{session.visitors}</span>
                    <span className="text-xs text-gray-500">attendees</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewWidget;
