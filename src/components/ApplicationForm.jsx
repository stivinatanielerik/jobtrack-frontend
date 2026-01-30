const STATUS_LABELS = {
  applied: "Jelentkezés elküldve",
  invited_to_interview: "Interjúra behívva",
  interview_done: "Interjú lezajlott",
  test_assigned: "Tesztfeladat kiküldve",
  test_submitted: "Tesztfeladat elküldve",
  offer: "Ajánlatot kaptam",
  rejected: "Elutasítva",
};

export default function ApplicationForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  generalError = "",
  errors = {},
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {generalError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        {generalError}
        </div>
      )}
      <input
        name="company"
        value={form.company}
        onChange={onChange}
        className="w-full rounded-lg border p-2"
        placeholder="Cég neve"
      />

      <input
        name="position"
        value={form.position}
        onChange={onChange}
        className="w-full rounded-lg border p-2"
        placeholder="Pozíció"
      />

      <select
        name="status"
        value={form.status}
        onChange={onChange}
        className="w-full rounded-lg border p-2"
      >
        {Object.entries(STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <textarea
        name="description"
        value={form.description}
        onChange={onChange}
        className="w-full rounded-lg border p-2"
        rows={4}
        placeholder="Megjegyzések"
      />

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border px-4 py-2 hover:bg-gray-50"
        >
          Mégse
        </button>

        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Mentés
        </button>
      </div>
    </form>
  );
}
