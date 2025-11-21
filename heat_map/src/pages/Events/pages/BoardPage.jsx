import { useEffect, useState } from "react";
import InterestsDialog from "../components/InterestsDialog.jsx";
import { apiGet } from "../src/api.js";

export default function BoardPage() {
  const [open, setOpen] = useState(false);
  const [myCats, setMyCats] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    (async () => {
      const mine = await apiGet("/api/interests/me").catch(() => ({ categories: [] }));
      const ids = (mine.categories || []).map(c => c.category_id);
      setMyCats(ids);
      if (ids.length === 0) setOpen(true);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!myCats.length) { setEvents([]); return; }
      const qs = encodeURIComponent(myCats.join(","));
      const data = await apiGet(`/api/interests/events/discover?categories=${qs}`);
      setEvents(data.items || []);
    })();
  }, [myCats]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Dynamic Schedule Board</h1>
        <button className="text-sm text-blue-600 underline hover:text-blue-800" onClick={() => setOpen(true)}>
          Edit interests
        </button>
      </div>

      {!events.length ? (
        <p className="text-gray-600">No recommendations yet. Pick your interests.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map(ev => (
            <li key={ev.event_id} className="p-4 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="font-semibold text-lg mb-2">{ev.event_title}</div>
              <div className="text-sm text-gray-600 mb-2">
                {new Date(ev.start_time).toLocaleString()} • {ev.location || "TBA"}
              </div>
              {ev.categories?.length ? (
                <div className="flex flex-wrap gap-1 mb-2">
                  {ev.categories.map(c => (
                    <span key={c.category_id} className="px-2 py-0.5 text-xs rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {c.category_name}
                    </span>
                  ))}
                </div>
              ) : null}
              <p className="text-sm line-clamp-3">{ev.description}</p>
            </li>
          ))}
        </ul>
      )}

      <InterestsDialog open={open} onClose={() => setOpen(false)} onSaved={ids => setMyCats(ids)} />
    </div>
  );
}