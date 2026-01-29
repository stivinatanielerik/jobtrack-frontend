import { useEffect, useState } from "react";

function App() {
  const [form, setForm] = useState({
    company: "",
    position: "",
    status: "applied",
    description: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("http://127.0.0.1:8000/api/applications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    console.log(data);
    alert("Elküldve!");
  };

  const STATUS_OPTIONS = {
    applied: "Jelentkezés elküldve",
    invited_to_interview: "Interjúra behívva",
    interview_done: "Interjú lezajlott",
    test_assigned: "Tesztfeladat kiküldve",
    test_submitted: "Tesztfeladat elküldve",
    offer: "Ajánlatot kaptam",
    rejected: "Elutasítva",
  };

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchApplications = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/applications");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch (e) {
      setError("Nem sikerült betölteni a jelentkezéseket. Ellenőrizd, hogy fut-e a backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Jelentkezések</h2>

        {loading && <p className="text-sm opacity-70">Betöltés…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && applications.length === 0 && (
          <p className="text-sm opacity-70">Még nincs felvitt jelentkezés.</p>
        )}

        <div className="space-y-3">
          {applications.map((app) => (
            <div
              key={app.id}
              className="border rounded-xl p-4 bg-white shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{app.company}</p>
                  <p className="text-sm opacity-80">{app.position}</p>
                </div>

                <span className="text-xs px-2 py-1 rounded-full border">
                  {STATUS_OPTIONS[app.status] ?? app.status}
                </span>
              </div>

              {app.description && (
                <p className="mt-3 text-sm whitespace-pre-wrap opacity-80">
                  {app.description}
                </p>
              )}

              <p className="mt-3 text-xs opacity-60">
                Létrehozva: {app.created_at ? new Date(app.created_at).toLocaleString("hu-HU") : "—"}
              </p>
            </div>
          ))}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-96 space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">Új állásjelentkezés</h1>

        <input
          name="company"
          placeholder="Cég neve"
          className="w-full border p-2 rounded"
          onChange={handleChange}
        />

        <input
          name="position"
          placeholder="Pozíció"
          className="w-full border p-2 rounded"
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Megjegyzések (pl. kontakt neve, határidő, benyomások)"
          className="w-full border p-2 rounded"
          rows={4}
          onChange={handleChange}
        />

        <select
          name="status"
          className="w-full border p-2 rounded"
          onChange={handleChange}
        >
          {Object.entries(STATUS_OPTIONS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Mentés
        </button>
      </form>
    </div>
  );
}

export default App;