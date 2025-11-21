import { useParams, Link } from "react-router-dom";
import FeedbackCard from "../components/feedbackcard.jsx";

export default function FeedbackPage() {
    const { eventId } = useParams();

    if (!eventId) {
        return <div className="p-6">Missing event id</div>;
    }

    return (
        <div className="max-w-xl mx-auto p-6">
            {/* Back button to go back to event details */}
            <Link to={`/events/${eventId}`} className="text-blue-600 underline mb-4 block">
                ← Back to Event
            </Link>

            <h1 className="text-2xl font-bold mb-4">Event Feedback</h1>
            <FeedbackCard eventId={eventId} />
        </div>
    );
}
