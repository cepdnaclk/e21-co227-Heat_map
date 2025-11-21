import React, { useState, useEffect } from "react";
import axios from "axios";
import { Star, MessageSquare, Loader } from "lucide-react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Register chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Feedback {
  feedback_id: string;
  rating: number;
  comment: string;
  visitor: string;
  created_at: string;
}

interface Event {
  event_id: number;
  event_name: string;
}

const FeedbackWidget: React.FC = () => {
  const [eventId, setEventId] = useState<number>(0); // Default event ID
  const [events, setEvents] = useState<Event[]>([]); // Event data
  const [feedback, setFeedback] = useState<Feedback[]>([]); // Feedback data
  const [loading, setLoading] = useState<boolean>(false); // Loading state

  // Additional state for event summary (rating, total reviews, and histogram)
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [histogram, setHistogram] = useState<{ [key: number]: number }>({});

  // Fetch events from the backend
  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await axios.get("http://localhost:5000/events");
        setEvents(response.data); // Assuming the response contains an array of events
        if (response.data.length > 0) {
          setEventId(response.data[0].event_id); // Set default event ID to the first event
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    }

    fetchEvents();
  }, []); // Empty dependency array ensures this effect runs only once when the component mounts

  // Fetch feedback for the selected event
  const fetchFeedback = async () => {
    if (eventId === 0) return; // Prevent fetch if eventId is not selected
    setLoading(true); // Start loading
    try {
      const response = await axios.get(`http://localhost:3000/api/events/${eventId}/ratings/all`);
      setFeedback(response.data.items); // Assuming 'items' is the array of feedback data
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setLoading(false); // Stop loading once the data is fetched
    }
  };

  // Fetch event summary for overall rating, total reviews, and histogram
  const fetchEventSummary = async () => {
    if (eventId === 0) return; // Prevent fetch if eventId is not selected
    try {
      const response = await axios.get(`http://localhost:3000/api/events/${eventId}/ratings/summary`);
      setAverageRating(response.data.average); // Set the average rating
      setTotalReviews(response.data.count); // Set the total reviews count
      setHistogram(response.data.histogram); // Set the histogram data
    } catch (error) {
      console.error("Error fetching event summary:", error);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchFeedback(); // Fetch feedback whenever eventId changes
      fetchEventSummary(); // Fetch event summary whenever eventId changes
    }
  }, [eventId]);

  // Helper function for sentiment color classes
  const getSentimentColor = (rating: number) => {
    const colors = {
      1: "border-l-red-500 bg-red-50",
      2: "border-l-orange-500 bg-orange-50",
      3: "border-l-yellow-500 bg-yellow-50",
      4: "border-l-green-500 bg-green-50",
      5: "border-l-blue-500 bg-blue-50",
    };
    return colors[rating] || "border-l-gray-500 bg-gray-50"; // Default to gray if no sentiment
  };

  // Bar chart data for the histogram
  const barChartData = {
    labels: ["1", "2", "3", "4", "5"], // Ratings from 1 to 5
    datasets: [
      {
        label: "Number of Ratings",
        data: [histogram[1] || 0, histogram[2] || 0, histogram[3] || 0, histogram[4] || 0, histogram[5] || 0],
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Event Selection Dropdown */}
      <div className="flex items-center space-x-4">
        <select
          value={eventId}
          onChange={(e) => setEventId(Number(e.target.value))} // Update eventId when selected
          className="border rounded-lg px-3 py-2"
        >
          {events.map((event) => (
            <option key={event.event_id} value={event.event_id}>
              {event.event_name}
            </option>
          ))}
        </select>

        {/* Load Data Button */}
        <button
          onClick={fetchFeedback}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {loading ? <Loader size={16} className="animate-spin" /> : "Load Data"}
        </button>
      </div>

      {/* Feedback Stats and Histogram (Bar chart) */}
      <div className="flex items-start justify-between gap-8">
        {/* Bar Chart for Rating Distribution */}
        <div className="w-3/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Rating Distribution</h3>
          </div>
          <div className="h-64">
            <Bar data={barChartData} options={{ responsive: true }} />
          </div>
        </div>

        {/* Stats for Overall Rating and Total Reviews */}
        <div className="w-2/5 space-y-6">
          {/* Display Overall Rating */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <Star size={24} className="text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}/5</p>
                <p className="text-sm text-gray-600">Overall Rating</p>
              </div>
            </div>
          </div>

          {/* Display Total Reviews */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <MessageSquare size={24} className="text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalReviews}</p>
                <p className="text-sm text-gray-600">Total Reviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Feedback */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Feedback</h3>
        </div>

        <div className="space-y-4">
          {feedback.length === 0 ? (
            <p className="text-gray-500 text-sm">No feedback available for this event.</p>
          ) : (
            feedback.map((fb, i) => (
              <div key={fb.feedback_id} className={`border-l-4 p-4 rounded-lg ${getSentimentColor(fb.rating)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, idx) => (
                          <Star
                            key={idx}
                            size={16}
                            className={idx < fb.rating ? "text-yellow-400 fill-current" : "text-gray-300"}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">{new Date(fb.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-700">{fb.comment}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Event: {fb.eventName}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackWidget;
