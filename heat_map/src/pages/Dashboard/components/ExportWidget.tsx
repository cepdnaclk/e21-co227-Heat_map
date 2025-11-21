import React, { useState } from "react";
import axios from "axios";
import { Download, FileText, Image, FileSpreadsheet, Calendar, CheckCircle } from "lucide-react";

interface ExportItem {
  name: string;
  type: string;
  date: string;
  status: "processing" | "completed" | "failed";
}

const ExportWidget: React.FC = () => {
  // Automatically calculate current exhibition day
  const startDate = new Date("2025-09-23"); // set your exhibition start date here
  const today = new Date();
  const diffInTime = today.getTime() - startDate.getTime();
  const diffInDays = Math.floor(diffInTime / (1000 * 60 * 60 * 24));
  const currentDay = diffInDays + 1; // Day 1 = start date

  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [exportHistory, setExportHistory] = useState<ExportItem[]>([
    { name: "Attendance & Usage Report.pdf", type: "PDF", date: "2025-09-23", status: "completed" },
    { name: "Movement & Flow Report.csv", type: "CSV", date: "2025-09-23", status: "completed" },
    { name: "Security & Exception Report.pdf", type: "PDF", date: "2025-09-23", status: "processing" },
  ]);

  const exportOptions = [
    { title: "Attendance & Usage Report", description: "Who came, where, and when", formats: ["PDF", "CSV"], icon: FileText, color: "blue", apiPath: "attendance" },
    { title: "Movement & Flow Report", description: "How people moved across buildings/zones and at what times", formats: ["PDF", "CSV"], icon: FileSpreadsheet, color: "green", apiPath: "movement" },
    { title: "Security & Exception Report", description: "Unusual behaviors and anomalies", formats: ["PDF"], icon: Image, color: "purple", apiPath: "security" },
    { title: "Event Analytics", description: "Event-level insights", formats: ["PDF"], icon: Calendar, color: "orange", apiPath: "event" },
  ];

  const handleExport = async (title: string, format: string, day: number, apiPath: string) => {
    const newExport: ExportItem = {
      name: `${title} - Day ${day}.${format.toLowerCase()}`,
      type: format,
      date: new Date().toISOString().split("T")[0],
      status: "processing",
    };

    setExportHistory((prev) => [newExport, ...prev]);

    try {
      // Determine correct API path for backend routes
      const pathSegment = format.toLowerCase(); // "pdf" or "csv"
      const url = `http://localhost:5005/api/export/${apiPath}/${pathSegment}/${day}`;

      const response = await axios.get(url, { responseType: "blob" });

      const blob = new Blob([response.data], { type: format === "PDF" ? "application/pdf" : "text/csv" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${title} - Day ${day}.${format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setExportHistory((prev) =>
        prev.map((item) =>
          item.name === newExport.name ? { ...item, status: "completed" } : item
        )
      );
    } catch (error) {
      console.error("Export error:", error);
      setExportHistory((prev) =>
        prev.map((item) =>
          item.name === newExport.name ? { ...item, status: "failed" } : item
        )
      );
    }
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "border-blue-200 hover:border-blue-300 hover:bg-blue-50",
      green: "border-green-200 hover:border-green-300 hover:bg-green-50",
      purple: "border-purple-200 hover:border-purple-300 hover:bg-purple-50",
      orange: "border-orange-200 hover:border-orange-300 hover:bg-orange-50",
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="space-y-6">
      {/* Day Filters */}
      <div className="flex space-x-2 mb-4">
        {[1, 2, 3, 4, 5].map((day) => {
          const disabled = day > currentDay;
          return (
            <button
              key={day}
              onClick={() => !disabled && setSelectedDay(day)}
              disabled={disabled}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                disabled
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : selectedDay === day
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Day {day}
            </button>
          );
        })}
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exportOptions.map((opt, i) => {
          const Icon = opt.icon;
          return (
            <div key={i} className={`bg-white rounded-lg border-2 p-6 transition-all ${getColorClasses(opt.color)}`}>
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg bg-${opt.color}-100`}>
                  <Icon size={24} className={`text-${opt.color}-600`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{opt.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{opt.description}</p>

                  {/* Day-wise Export Buttons */}
                  <div className="flex flex-col gap-2">
                    {Array.from({ length: selectedDay }, (_, idx) => idx + 1).map((day) => (
                      <div key={`day-${day}`} className="flex flex-wrap gap-2">
                        {opt.formats.map((f) => (
                          <button
                            key={`${f}-day${day}`}
                            onClick={() => handleExport(opt.title, f, day, opt.apiPath)}
                            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors flex items-center space-x-1"
                          >
                            <Download size={14} />
                            <span>Day {day} ({f})</span>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Export History */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Exports</h3>
        <div className="space-y-3">
          {exportHistory.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded ${item.status === "completed" ? "bg-green-100" : item.status === "processing" ? "bg-yellow-100" : "bg-red-100"}`}>
                  {item.status === "completed" ? (
                    <CheckCircle size={16} className="text-green-600" />
                  ) : item.status === "processing" ? (
                    <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <div className="text-red-600 font-semibold">Failed</div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.type} • {item.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExportWidget;
