import { google } from "googleapis";
import type { Credentials } from "google-auth-library";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const REDIRECT_URI =
    process.env.GOOGLE_REDIRECT_URI ||
    "http://localhost:5000/api/google/callback";

// In-memory token store (sufficient for local single-user dev)
let storedTokens: Credentials | null = null;

export function createOAuth2Client() {
    return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
}

export function getAuthUrl(): string {
    const client = createOAuth2Client();
    return client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: [
            "https://www.googleapis.com/auth/drive",
            "https://www.googleapis.com/auth/spreadsheets",
        ],
    });
}

export async function handleCallback(code: string): Promise<void> {
    const client = createOAuth2Client();
    const { tokens } = await client.getToken(code);
    storedTokens = tokens;
}

export function getAuthenticatedClient() {
    if (!storedTokens) return null;
    const client = createOAuth2Client();
    client.setCredentials(storedTokens);
    return client;
}

export function isConnected(): boolean {
    return storedTokens !== null;
}

export function revokeTokens(): void {
    storedTokens = null;
}
