// src/lib/api.ts
const BASE_URL = 'https://aetherdesk.onrender.com'; // adjust if needed

export const registerUser = async (data: any) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const loginUser = async (data: any) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export async function fetchTickets(token: string) {
  const res = await fetch('https://aetherdesk.onrender.com/tickets', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await res.json();
}
