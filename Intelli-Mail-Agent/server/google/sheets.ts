import { google } from "googleapis";
import { getAuthenticatedClient } from "./oauth";

export interface SpreadsheetRef {
    id: string;
    name: string;
    url: string;
}

export interface SheetRow {
    [key: string]: string;
}

/**
 * List all Google Sheets files the user has access to (via Drive)
 */
export async function listSpreadsheets(): Promise<SpreadsheetRef[]> {
    const auth = getAuthenticatedClient();
    if (!auth) throw new Error("Not authenticated with Google");

    const drive = google.drive({ version: "v3", auth });
    const res = await drive.files.list({
        q: "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
        fields: "files(id,name,webViewLink)",
        pageSize: 50,
        orderBy: "modifiedTime desc",
    });

    return (res.data.files || []).map((f) => ({
        id: f.id!,
        name: f.name!,
        url: f.webViewLink!,
    }));
}

/**
 * Read rows from a given spreadsheet and range (e.g. "Sheet1!A1:Z100")
 * Returns array of objects with first row as headers
 */
export async function readSheet(
    spreadsheetId: string,
    range = "Sheet1"
): Promise<SheetRow[]> {
    const auth = getAuthenticatedClient();
    if (!auth) throw new Error("Not authenticated with Google");

    const sheets = google.sheets({ version: "v4", auth });
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
    });

    const rows = res.data.values || [];
    if (rows.length < 2) return []; // No data rows

    const headers = rows[0].map((h: string) => h.trim());
    return rows.slice(1).map((row: string[]) => {
        const obj: SheetRow = {};
        headers.forEach((h: string, i: number) => {
            obj[h] = row[i] ?? "";
        });
        return obj;
    });
}

/**
 * Append rows to a spreadsheet
 */
export async function appendToSheet(
    spreadsheetId: string,
    range: string,
    values: string[][]
): Promise<void> {
    const auth = getAuthenticatedClient();
    if (!auth) throw new Error("Not authenticated with Google");

    const sheets = google.sheets({ version: "v4", auth });
    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: "USER_ENTERED",
        requestBody: { values },
    });
}

/**
 * Get the sheet names inside a spreadsheet
 */
export async function getSheetNames(spreadsheetId: string): Promise<string[]> {
    const auth = getAuthenticatedClient();
    if (!auth) throw new Error("Not authenticated with Google");

    const sheets = google.sheets({ version: "v4", auth });
    const res = await sheets.spreadsheets.get({
        spreadsheetId,
        fields: "sheets(properties(title))",
    });

    return (res.data.sheets || []).map(
        (s) => s.properties?.title || "Sheet1"
    );
}
