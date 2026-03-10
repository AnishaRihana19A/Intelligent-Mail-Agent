import type { Express, Request, Response } from "express";
import { getAuthUrl, handleCallback, isConnected, revokeTokens } from "./oauth";
import { listSpreadsheets, readSheet, getSheetNames, appendToSheet } from "./sheets";
import { listFiles, uploadTextFile } from "./drive";

export function registerGoogleRoutes(app: Express) {
    // ─── OAuth ────────────────────────────────────────────────────────────────

    /** Kick off OAuth consent flow */
    app.get("/api/google/auth", (_req: Request, res: Response) => {
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
            return res.status(400).json({
                message:
                    "Google credentials not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env",
            });
        }
        const url = getAuthUrl();
        res.redirect(url);
    });

    /** OAuth callback — Google redirects here with code */
    app.get("/api/google/callback", async (req: Request, res: Response) => {
        const code = req.query.code as string;
        if (!code) {
            return res.status(400).json({ message: "Missing code parameter" });
        }
        try {
            await handleCallback(code);
            res.redirect("/integrations?google=connected");
        } catch (err: any) {
            console.error("Google OAuth callback error:", err);
            res.redirect("/integrations?google=error");
        }
    });

    /** Return current connection status */
    app.get("/api/google/status", (_req: Request, res: Response) => {
        const configured = !!(
            process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        );
        res.json({
            configured,
            connected: isConnected(),
            drive: isConnected(),
            sheets: isConnected(),
        });
    });

    /** Disconnect / revoke stored tokens */
    app.post("/api/google/disconnect", (_req: Request, res: Response) => {
        revokeTokens();
        res.json({ success: true });
    });

    // ─── Sheets ────────────────────────────────────────────────────────────────

    /** List all spreadsheets accessible to the user */
    app.get("/api/google/sheets", async (_req: Request, res: Response) => {
        if (!isConnected()) {
            return res.status(401).json({ message: "Not connected to Google" });
        }
        try {
            const sheets = await listSpreadsheets();
            res.json(sheets);
        } catch (err: any) {
            console.error(err);
            res.status(500).json({ message: err.message || "Failed to list sheets" });
        }
    });

    /** Get the sheet tab names inside a spreadsheet */
    app.get(
        "/api/google/sheets/:spreadsheetId/tabs",
        async (req: Request, res: Response) => {
            if (!isConnected()) {
                return res.status(401).json({ message: "Not connected to Google" });
            }
            try {
                const names = await getSheetNames(req.params.spreadsheetId as string);
                res.json(names);
            } catch (err: any) {
                res.status(500).json({ message: err.message || "Failed to get sheet tabs" });
            }
        }
    );

    /** Read rows from a specific sheet (range is optional, defaults to full sheet) */
    app.get(
        "/api/google/sheets/:spreadsheetId/rows",
        async (req: Request, res: Response) => {
            if (!isConnected()) {
                return res.status(401).json({ message: "Not connected to Google" });
            }
            const { spreadsheetId } = req.params as Record<string, string>;
            const range = (req.query.range as string) || "Sheet1";
            try {
                const rows = await readSheet(spreadsheetId, range);
                res.json(rows);
            } catch (err: any) {
                console.error(err);
                res.status(500).json({ message: err.message || "Failed to read sheet" });
            }
        }
    );

    /** Append rows to a sheet */
    app.post(
        "/api/google/sheets/:spreadsheetId/append",
        async (req: Request, res: Response) => {
            if (!isConnected()) {
                return res.status(401).json({ message: "Not connected to Google" });
            }
            const { spreadsheetId } = req.params as Record<string, string>;
            const { range = "Sheet1", values } = req.body;
            if (!Array.isArray(values)) {
                return res.status(400).json({ message: "values must be an array of arrays" });
            }
            try {
                await appendToSheet(spreadsheetId, range, values);
                res.json({ success: true });
            } catch (err: any) {
                res.status(500).json({ message: err.message || "Failed to append to sheet" });
            }
        }
    );

    // ─── Drive ────────────────────────────────────────────────────────────────

    /** List recent Drive files */
    app.get("/api/google/drive/files", async (req: Request, res: Response) => {
        if (!isConnected()) {
            return res.status(401).json({ message: "Not connected to Google" });
        }
        try {
            const files = await listFiles(30, req.query.mimeType as string | undefined);
            res.json(files);
        } catch (err: any) {
            res.status(500).json({ message: err.message || "Failed to list drive files" });
        }
    });

    /** Upload a text file to Drive */
    app.post("/api/google/drive/upload", async (req: Request, res: Response) => {
        if (!isConnected()) {
            return res.status(401).json({ message: "Not connected to Google" });
        }
        const { name, content, folderId } = req.body;
        if (!name || !content) {
            return res.status(400).json({ message: "name and content are required" });
        }
        try {
            const file = await uploadTextFile(name, content, folderId);
            res.json(file);
        } catch (err: any) {
            res.status(500).json({ message: err.message || "Failed to upload to drive" });
        }
    });
}
