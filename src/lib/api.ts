/**
 * Simple API client for DinarFlow
 */

export const getAuthToken = () => localStorage.getItem('df_token');
export const setAuthToken = (token: string) => localStorage.setItem('df_token', token);
export const clearAuthToken = () => localStorage.removeItem('df_token');

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearAuthToken();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'API request failed');
  }

  return response.json();
};
