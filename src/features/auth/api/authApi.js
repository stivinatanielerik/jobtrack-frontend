import { setToken, clearToken } from "../token";

async function parseJsonOrText(response) {
  const ct = response.headers.get("content-type") || "";
  const isJson = ct.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();
  return { isJson, payload };
}

export async function login(email, password) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const { payload } = await parseJsonOrText(response);

  if (!response.ok) throw new Error(payload?.message || `HTTP ${response.status}`);

  setToken(payload.token);
  return payload.user;
}

export async function logout() {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    headers: { Accept: "application/json" },
  });

  clearToken();

  return response.ok;
}
