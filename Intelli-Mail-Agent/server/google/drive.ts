import { google } from "googleapis";
import { Readable } from "stream";
import { getAuthenticatedClient } from "./oauth";

export interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    url: string;
    modifiedTime: string;
}

/**
 * List recent files in the user's Google Drive
 */
export async function listFiles(
    pageSize = 20,
    mimeType?: string
): Promise<DriveFile[]> {
    const auth = getAuthenticatedClient();
    if (!auth) throw new Error("Not authenticated with Google");

    const drive = google.drive({ version: "v3", auth });

    const q = [
        "trashed=false",
        mimeType ? `mimeType='${mimeType}'` : "",
    ]
        .filter(Boolean)
        .join(" and ");

    const res = await drive.files.list({
        q: q || undefined,
        fields: "files(id,name,mimeType,webViewLink,modifiedTime)",
        pageSize,
        orderBy: "modifiedTime desc",
    });

    return (res.data.files || []).map((f) => ({
        id: f.id!,
        name: f.name!,
        mimeType: f.mimeType!,
        url: f.webViewLink!,
        modifiedTime: f.modifiedTime!,
    }));
}

/**
 * Upload a plain text file to Google Drive
 * Returns the file ID and webViewLink
 */
export async function uploadTextFile(
    name: string,
    content: string,
    folderId?: string
): Promise<{ id: string; url: string }> {
    const auth = getAuthenticatedClient();
    if (!auth) throw new Error("Not authenticated with Google");

    const drive = google.drive({ version: "v3", auth });

    const media = {
        mimeType: "text/plain",
        body: Readable.from([content]),
    };

    const metadata: Record<string, any> = {
        name,
        mimeType: "text/plain",
    };
    if (folderId) {
        metadata.parents = [folderId];
    }

    const res = await drive.files.create({
        requestBody: metadata,
        media,
        fields: "id,webViewLink",
    });

    return {
        id: res.data.id!,
        url: res.data.webViewLink!,
    };
}

/**
 * Get metadata for a single file
 */
export async function getFile(fileId: string): Promise<DriveFile | null> {
    const auth = getAuthenticatedClient();
    if (!auth) throw new Error("Not authenticated with Google");

    const drive = google.drive({ version: "v3", auth });
    const res = await drive.files.get({
        fileId,
        fields: "id,name,mimeType,webViewLink,modifiedTime",
    });
    const f = res.data;
    if (!f.id) return null;
    return {
        id: f.id,
        name: f.name!,
        mimeType: f.mimeType!,
        url: f.webViewLink!,
        modifiedTime: f.modifiedTime!,
    };
}
