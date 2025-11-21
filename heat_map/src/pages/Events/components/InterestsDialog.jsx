import { useEffect, useState } from "react";
import Modal from "./Modal.jsx";
import { apiGet, apiJSON } from "../api.js";

export default function InterestsDialog({ open, onClose, onSaved }) {
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError("");
    (async () => {
      try {
        const [cats, mine] = await Promise.all([
          apiGet("/api/interests/categories"),
          apiGet("/api/interests/me").catch(() => ({ categories: [] }))
        ]);
        setCategories(Array.isArray(cats) ? cats : []);
        setSelected(new Set((mine.categories || []).map(c => c.category_id)));
      } catch (e) {
        console.error(e);
        setError("Couldn’t load categories. Check API URL / CORS / server.");
        setCategories([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  const toggle = id => setSelected(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const submit = async () => {
    const ids = Array.from(selected);
    setSaving(true);
    try {
      await apiJSON("POST", "/api/interests/me", { categories: ids });
      onSaved?.(ids);
      onClose?.();
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-2xl font-bold">Choose your interests</h2>

      {loading ? (
        <div className="text-sm text-gray-500 mt-3">Loading…</div>
      ) : error ? (
        <div className="mt-3 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
      ) : categories.length === 0 ? (
        <div className="mt-3 text-sm text-gray-600">No categories available.</div>
      ) : (
        <div className="flex flex-wrap gap-2 max-h-[50vh] overflow-auto pr-1 my-4">
          {categories.map(c => (
            <button
              key={c.category_id}
              onClick={() => toggle(c.category_id)}
              className={`px-3 py-1.5 rounded-full border text-sm transition-colors
                ${selected.has(c.category_id)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white hover:bg-gray-50 border-gray-300"}`}
            >
              {c.category_name}
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Not now</button>
        <button onClick={submit} disabled={!selected.size || saving}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:bg-gray-400 hover:bg-blue-700 disabled:hover:bg-gray-400">
          {saving ? "Saving…" : "Save interests"}
        </button>
      </div>
    </Modal>
  );
}