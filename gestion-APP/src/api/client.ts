import { API_BASE_URL } from './config';

export const apiFetch = async (
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<Response> => {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers as Record<string, string>),
    },
  });

  if (res.status === 401) {
    window.dispatchEvent(new Event('auth:expired'));
  }

  return res;
};
