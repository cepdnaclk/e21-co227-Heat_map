import { Routes, Route } from "react-router-dom";
import EventsScreen from "./pages/EventsScreen.jsx";
import SingleEventDetailPage from "./pages/SingleEventDetailPage.jsx";
import FeedbackPage from "./pages/FeedbackPage.jsx";
import RecommendedEvents from "./pages/RecommendedEvents.jsx";

export default function Appevents() {
    return (
        <Routes>
            <Route index element={<EventsScreen />} />
            <Route path=":id" element={<SingleEventDetailPage />} />
            <Route path=":eventId/feedback" element={<FeedbackPage />} />
            <Route path="recommended" element={<RecommendedEvents />} />
        </Routes>
    );
}
