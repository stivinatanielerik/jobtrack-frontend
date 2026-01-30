import { useEffect, useState } from "react";
import Modal from "./components/Modal";
import ApplicationForm from "./components/ApplicationForm";

function App() {
  const INITIAL_FORM = {
    company: "",
    position: "",
    status: "applied",
    description: "",
  };
  const [form, setForm] = useState(INITIAL_FORM);
  const resetForm = () => setForm(INITIAL_FORM);

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setError] = useState("");
  const [modalError, setModalError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({}); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => {
    setIsModalOpen(false);
    setModalError("");
    setFieldErrors({});
    resetForm();
  };
  const [csrfToken, setCsrfToken] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const company = form.company.trim();
    const position = form.position.trim();

    if (!company || !position) {
      setModalError("Kérlek add meg a cég nevét és a pozíciót.");
      return;
    }

    const res = await fetch("/api/applications", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": csrfToken,
        "Accept": "application/json",
      },
      body: JSON.stringify(form),
    });

    console.log(res);
    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const payload = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      console.log("HTTP", res.status, "payload:", payload);
      if (res.status === 422 && isJson) {
        setFieldErrors(payload.errors ?? {});
        setModalError("Kérlek töltsd ki a kötelező mezőket.");
        return;
      }
      if (res.status === 419) {
        setModalError("A munkamenet/CSRF token érvénytelen. Frissítsd az oldalt és próbáld újra.");
        return;
      }
      setModalError(`Mentés sikertelen (HTTP ${res.status}).`);
      return;
    }
    // lista frissítés
    await fetchApplications();
    closeModal();
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

  const fetchApplications = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/applications");
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
    (async () => {
      const res = await fetch("/csrf-token", { credentials: "include" });
      const data = await res.json();
      setCsrfToken(data.token);
    })();
    fetchApplications();
  }, []);

  return (
    <div className="min-h-screen items-center justify-center m-4">
      <h2 className="text-xl font-semibold mb-3">Jelentkezések</h2>
      <button
        onClick={() => setIsModalOpen(true)}
        className="rounded-xl bg-blue-600 px-4 py-2 text-white mb-3"
      >
        + Új állásjelentkezés
      </button>

      <Modal open={isModalOpen} onClose={closeModal} title="Új jelentkezés">
        <ApplicationForm
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={closeModal}
        generalError={modalError}
        errors={fieldErrors}
        />
      </Modal>


      {loading && <p className="text-sm opacity-70">Betöltés…</p>}
      {listError && <p className="text-sm text-red-600">{listError}</p>}

      {!loading && !listError && applications.length === 0 && (
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
  );
}

export default App;