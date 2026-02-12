import { getToken } from "../../auth/token";

async function parseJsonOrText(response) {
  const ct = response.headers.get("content-type") || "";
  const isJson = ct.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();
  return { isJson, payload };
}

export async function listApplications() {
  const token = getToken();

  const response = await fetch("/api/applications", {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const { payload } = await parseJsonOrText(response);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return Array.isArray(payload) ? payload : [];
}

export async function createApplication(data) {
  const token = getToken();

  const response = await fetch("/api/applications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  const { isJson, payload } = await parseJsonOrText(response);
  return { response, isJson, payload };
}

export async function updateApplication(id, data) {
  const token = getToken();

  const response = await fetch(`/api/applications/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  const { isJson, payload } = await parseJsonOrText(response);
  return { response, isJson, payload };
}

export async function deleteApplication(id) {
  const token = getToken();

  const response = await fetch(`/api/applications/${id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
}

export async function deleteAllApplications() {
  const token = getToken();

  const response = await fetch(`/api/applications`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
}