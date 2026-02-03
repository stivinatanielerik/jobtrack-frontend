import { useEffect, useState } from "react";
import Modal from "./components/Modal";
import ApplicationForm from "./components/ApplicationForm";
import ApplicationList from "./components/ApplicationList";
import { STATUS_LABELS } from "./constants/applicationStatus";

const INITIAL_FORM = {
  company: "",
  position: "",
  status: "applied",
  description: "",
};

function App() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingApplication, setEditingApplication] = useState(null); // null = create, object = edit

  const [listError, setListError] = useState("");
  const [modalError, setModalError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({}); 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");

  const resetForm = () => setForm(INITIAL_FORM);

  const closeModal = () => {
    setIsModalOpen(false);
    setModalError("");
    setFieldErrors({});
    resetForm();
  };

  const openEdit = (app) => {
    setEditingApplication(app);
    setForm({
      company: app.company ?? "",
      position: app.position ?? "",
      status: app.status ?? "applied",
      description: app.description ?? "",
    });
    setModalError("");
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleDelete = async (id) => {
    const ok = confirm("Biztosan törlöd ezt a jelentkezést?");
    if (!ok) return;

    const response = await fetch(`/api/applications/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "X-CSRF-TOKEN": csrfToken,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      alert(`Törlés sikertelen (HTTP ${response.status}).`);
      return;
    }

    await fetchApplications();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError("");
    setFieldErrors({});

    const company = form.company.trim();
    const position = form.position.trim();

    if (!company || !position) {
      setModalError("Kérlek add meg a cég nevét és a pozíciót.");
      return;
    }

    const isEdit = Boolean(editingApplication?.id);
    const url = isEdit
    ? `/api/applications/${editingApplication.id}`
    : "/api/applications";
    const method = isEdit ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": csrfToken,
        "Accept": "application/json",
      },
      body: JSON.stringify(form),
    });

    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const payload = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      console.log("HTTP", response.status, "payload:", payload);
      if (response.status === 422 && isJson) {
        setFieldErrors(payload.errors ?? {});
        setModalError("Kérlek töltsd ki a kötelező mezőket.");
        return;
      }
      if (response.status === 419) {
        setModalError("A munkamenet/CSRF token érvénytelen. Frissítsd az oldalt és próbáld újra.");
        return;
      }
      setModalError(`Mentés sikertelen (HTTP ${response.status}).`);
      return;
    }
    
    closeModal();
    await fetchApplications();
  };

  const fetchApplications = async () => {
    setLoading(true);
    setListError("");

    try {
      const response = await fetch("/api/applications");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch (e) {
      setListError("Nem sikerült betölteni a jelentkezéseket. Ellenőrizd, hogy fut-e a backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("/csrf-token", { credentials: "include" });
        const data = await response.json();
        setCsrfToken(data.token);
      } catch {
        setListError("Nem sikerült CSRF tokent kérni.");
      }
    })();
    fetchApplications();
  }, []);

  return (
    <div className="min-h-screen items-center justify-center m-4">
      <div>
        <h1 className="text-2xl font-bold">JobTrack</h1>
        <p>Állásjelentkezések nyomon követése</p>
      </div>
      <button
        onClick={() => {
          setEditingApplication(null);
          setForm(INITIAL_FORM);
          setIsModalOpen(true);
        }}
        className="rounded-xl bg-blue-600 px-4 py-2 text-white mb-3 mt-3"
      >
        + Új állásjelentkezés
      </button>

      <ApplicationList
          applications={applications}
          loading={loading}
          error={listError}
          statusLabels={STATUS_LABELS}
          onEdit={openEdit}
          onDelete={handleDelete}
      />

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
    </div>
  );
}

export default App;