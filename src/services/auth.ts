// src/services/auth.ts
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
const REDIRECT_URI = 'https://luyiju-design.github.io/figma-copy-manager/oauth-callback/';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
const TOKEN_STORAGE_KEY = 'google_access_token';
const EXPIRY_STORAGE_KEY = 'google_token_expiry';

export interface AuthToken {
  accessToken: string;
  expiresAt: number;
}

export async function getStoredToken(): Promise<AuthToken | null> {
  const token = await figma.clientStorage.getAsync(TOKEN_STORAGE_KEY);
  const expiry = await figma.clientStorage.getAsync(EXPIRY_STORAGE_KEY);
  if (!token || !expiry) return null;
  if (Date.now() > Number(expiry)) return null;
  return { accessToken: String(token), expiresAt: Number(expiry) };
}

export async function storeToken(token: AuthToken): Promise<void> {
  await figma.clientStorage.setAsync(TOKEN_STORAGE_KEY, token.accessToken);
  await figma.clientStorage.setAsync(EXPIRY_STORAGE_KEY, token.expiresAt);
}

export async function clearToken(): Promise<void> {
  await figma.clientStorage.deleteAsync(TOKEN_STORAGE_KEY);
  await figma.clientStorage.deleteAsync(EXPIRY_STORAGE_KEY);
}

export function buildAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',
    prompt: 'consent',
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeCodeForToken(code: string): Promise<AuthToken> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET as string,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error_description || 'OAuth failed');
  return {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}
