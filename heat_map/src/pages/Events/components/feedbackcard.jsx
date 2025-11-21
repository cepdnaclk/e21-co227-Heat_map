import { useEffect, useMemo, useState } from "react";
import { Star, Send, Trash2 } from "lucide-react";

export default function FeedbackCard({ eventId }) {
  const API = useMemo(() => import.meta.env.VITE_API_URL || "", []);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [mine, setMine] = useState(null);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  const fetchSummary = async () => {
    if (!eventId) return;
    try {
      const sumRes = await fetch(`${API}/api/events/${eventId}/ratings/summary`, {
        credentials: "include",
      });
      if (sumRes.ok) {
        const data = await sumRes.json();
        setSummary(data);
      }
    } catch (e) {
      console.error("Failed to fetch summary:", e);
    }
  };

  const fetchMine = async () => {
    if (!eventId) return;
    try {
      const meRes = await fetch(`${API}/api/events/${eventId}/ratings/me`, {
        credentials: "include",
      });
      if (meRes.status === 200) {
        const me = await meRes.json();
        setMine(me);
        setRating(me.rating ?? 0);
        setFeedback(me.comment ?? "");
      }
    } catch (e) {
      console.error("Failed to fetch my rating:", e);
    }
  };

  useEffect(() => {
    fetchMine();
    fetchSummary();
  }, [API, eventId]);

  const handleSubmit = async () => {
    if (!eventId) return setError("Missing event id");
    if (!feedback.trim() && rating === 0) return;

    setIsSubmitting(true);
    setError("");

    try {
      console.log("Submitting feedback:", {
        url: `${API}/api/events/${eventId}/ratings`,
        rating,
        feedback,
      });

      const res = await fetch(`${API}/api/events/${eventId}/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rating, comment: feedback }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Failed to submit");
      }

      setIsSubmitted(true);
      setMine({ rating, comment: feedback });
      await fetchSummary();
    } catch (e) {
      setError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!eventId) return;
    try {
      const res = await fetch(`${API}/api/events/${eventId}/ratings/me`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete rating");

      setMine(null);
      setRating(0);
      setFeedback("");
      setIsSubmitted(false);

      await fetchSummary();
    } catch (e) {
      setError(e.message);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setError("");
  };

  return (
      <div className="max-w-md mx-auto bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <h2 className="text-2xl font-bold tracking-tight">Your Feedback</h2>
          <p className="text-blue-100 text-sm mt-1">
            Help us improve your experience
          </p>
        </div>

        <div className="p-6 space-y-6">
          {summary && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold text-gray-800">
                    {summary.average ?? "—"}
                  </span>
                    </div>
                    <div className="text-gray-500">•</div>
                    <span className="text-gray-600">{summary.count} ratings</span>
                  </div>
                </div>
              </div>
          )}

          {isSubmitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg transform transition-all duration-500 scale-110">
                    <span className="text-white text-2xl font-bold">✓</span>
                  </div>
                  <div className="absolute -inset-4 bg-green-100 rounded-full opacity-20 animate-ping"></div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-800">Thank you!</h3>
                  <p className="text-gray-600">Your feedback has been submitted</p>
                </div>
                <div className="flex justify-center gap-3">
                  <button
                      onClick={resetForm}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Edit Feedback
                  </button>
                  <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 bg-red-500 text-white px-4 py-3 rounded-xl font-medium hover:bg-red-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
          ) : (
              <>
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Rate your experience
                  </label>
                  <div className="flex justify-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => setRating(star)}
                            className="focus:outline-none transform hover:scale-110 transition-all duration-200"
                        >
                          <Star
                              className={`w-8 h-8 ${
                                  star <= rating
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-300 hover:text-yellow-300"
                              } transition-colors duration-200`}
                          />
                        </button>
                    ))}
                  </div>
                  {mine && (
                      <p className="text-xs text-gray-500 text-center bg-blue-50 rounded-lg py-2 px-3">
                        Previous rating: {mine.rating} ⭐
                      </p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Share your thoughts
                  </label>
                  <div className="relative">
                <textarea
                    value={feedback}
                    onChange={(e) => {
                      if (e.target.value.length <= 500) setFeedback(e.target.value);
                    }}
                    placeholder="Tell us what you think... Every detail helps us improve!"
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all duration-200 resize-none bg-gray-50 focus:bg-white"
                />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                      {feedback.length}/500
                    </div>
                  </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="text-red-600 text-sm font-medium">{error}</p>
                    </div>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || (!feedback.trim() && rating === 0)}
                    className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold
                         hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed
                         transform hover:scale-[1.02] disabled:hover:scale-100 transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-md"
                >
                  <div className="flex items-center justify-center space-x-3">
                    <Send
                        className={`w-5 h-5 ${
                            isSubmitting ? "animate-pulse" : "group-hover:translate-x-1"
                        } transition-transform duration-200`}
                    />
                    <span className="text-lg">
                  {isSubmitting ? "Sending..." : "Submit Feedback"}
                </span>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 group-hover:translate-x-full transition-all duration-700"></div>
                </button>

                <p className="text-xs text-gray-500 text-center italic">
                  Your feedback makes our events better ✨
                </p>
              </>
          )}
        </div>
      </div>
  );
}
