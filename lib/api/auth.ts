import { api } from "./client";

export type MeResponse = {
  user: { id: string; name: string; email: string; createdAt?: string } | null;
};

export async function login(email: string, password: string) {
  return api<{ user: { id: string; name: string; email: string } }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register(name: string, email: string, password: string) {
  return api<{ user: { id: string; name: string; email: string } }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function logout() {
  return api<{ ok: true }>("/api/auth/logout", { method: "POST" });
}

export async function me() {
  return api<MeResponse>("/api/auth/me");
}
