import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Table2, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SpreadsheetRef {
    id: string;
    name: string;
    url: string;
}

interface SheetRow {
    [key: string]: string;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SheetsImportDialog({ open, onOpenChange }: Props) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [selectedSheet, setSelectedSheet] = useState<string>("");
    const [selectedTab, setSelectedTab] = useState<string>("Sheet1");
    const [importedRows, setImportedRows] = useState<SheetRow[]>([]);
    const [importing, setImporting] = useState(false);
    const [imported, setImported] = useState(false);

    // Fetch list of spreadsheets
    const { data: spreadsheets = [], isLoading: loadingSheets } = useQuery<SpreadsheetRef[]>({
        queryKey: ["/api/google/sheets"],
        queryFn: async () => {
            const res = await fetch("/api/google/sheets", { credentials: "include" });
            if (!res.ok) throw new Error("Failed to load sheets");
            return res.json();
        },
        enabled: open,
    });

    // Fetch tabs for selected spreadsheet
    const { data: tabs = [], isLoading: loadingTabs } = useQuery<string[]>({
        queryKey: ["/api/google/sheets", selectedSheet, "tabs"],
        queryFn: async () => {
            const res = await fetch(`/api/google/sheets/${selectedSheet}/tabs`, {
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to load sheet tabs");
            return res.json();
        },
        enabled: !!selectedSheet,
    });

    // Preview rows from the selected tab
    const { data: rows = [], isLoading: loadingRows } = useQuery<SheetRow[]>({
        queryKey: ["/api/google/sheets", selectedSheet, "rows", selectedTab],
        queryFn: async () => {
            const res = await fetch(
                `/api/google/sheets/${selectedSheet}/rows?range=${encodeURIComponent(selectedTab)}`,
                { credentials: "include" }
            );
            if (!res.ok) throw new Error("Failed to load rows");
            return res.json();
        },
        enabled: !!selectedSheet && !!selectedTab,
    });

    const handleImport = async () => {
        if (!rows.length) return;
        setImporting(true);
        try {
            // Map sheet rows to campaigns — expects columns: name, targetCompany, companyDescription
            const campaigns = rows.map((row) => ({
                name: row["name"] || row["Name"] || row["Campaign Name"] || "Imported Campaign",
                targetCompany:
                    row["targetCompany"] ||
                    row["Target Company"] ||
                    row["company"] ||
                    row["Company"] ||
                    "Unknown",
                companyDescription:
                    row["companyDescription"] ||
                    row["Company Description"] ||
                    row["description"] ||
                    row["Description"] ||
                    "",
            }));

            // Create campaigns via API
            await Promise.all(
                campaigns.map((c) =>
                    fetch("/api/campaigns", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify(c),
                    })
                )
            );

            queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
            setImported(true);
            toast({
                title: "Import successful",
                description: `Imported ${campaigns.length} campaign(s) from Google Sheets.`,
            });
        } catch (err: any) {
            toast({
                title: "Import failed",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setImporting(false);
        }
    };

    const headers = rows.length > 0 ? Object.keys(rows[0]) : [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-white">
                        <Table2 className="h-5 w-5 text-emerald-400" />
                        Import from Google Sheets
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Select a spreadsheet and sheet tab to import campaign targets. Expects columns:
                        <span className="text-zinc-300 font-mono"> name, targetCompany, companyDescription</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-2">
                    {/* Spreadsheet picker */}
                    {loadingSheets ? (
                        <div className="flex items-center gap-2 text-zinc-400 text-sm">
                            <Loader2 className="h-4 w-4 animate-spin" /> Loading spreadsheets…
                        </div>
                    ) : (
                        <div>
                            <label className="text-xs font-medium text-zinc-400 block mb-1.5">
                                Spreadsheet
                            </label>
                            <Select
                                value={selectedSheet}
                                onValueChange={(v) => {
                                    setSelectedSheet(v);
                                    setSelectedTab("Sheet1");
                                    setImported(false);
                                }}
                            >
                                <SelectTrigger className="bg-zinc-800 border-white/10 text-white">
                                    <SelectValue placeholder="Select a spreadsheet…" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-800 border-white/10 text-white">
                                    {spreadsheets.map((s) => (
                                        <SelectItem key={s.id} value={s.id}>
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Tab picker */}
                    {selectedSheet && !loadingTabs && tabs.length > 0 && (
                        <div>
                            <label className="text-xs font-medium text-zinc-400 block mb-1.5">
                                Sheet Tab
                            </label>
                            <Select value={selectedTab} onValueChange={setSelectedTab}>
                                <SelectTrigger className="bg-zinc-800 border-white/10 text-white">
                                    <SelectValue placeholder="Select a tab…" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-800 border-white/10 text-white">
                                    {tabs.map((t) => (
                                        <SelectItem key={t} value={t}>
                                            {t}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Row preview */}
                    {loadingRows && (
                        <div className="flex items-center gap-2 text-zinc-400 text-sm">
                            <Loader2 className="h-4 w-4 animate-spin" /> Loading rows…
                        </div>
                    )}

                    {rows.length > 0 && !loadingRows && (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-zinc-400">
                                    Preview — {rows.length} row{rows.length !== 1 ? "s" : ""} found
                                </span>
                                {headers.includes("targetCompany") || headers.includes("Target Company") ? (
                                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" /> Column mapping looks good
                                    </span>
                                ) : (
                                    <span className="text-xs text-amber-400 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" /> Verify column names match
                                    </span>
                                )}
                            </div>
                            <div className="overflow-auto max-h-52 rounded-lg border border-white/5">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="bg-zinc-800">
                                            {headers.slice(0, 5).map((h) => (
                                                <th
                                                    key={h}
                                                    className="px-3 py-2 text-left font-medium text-zinc-400 whitespace-nowrap"
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.slice(0, 6).map((row, i) => (
                                            <tr
                                                key={i}
                                                className="border-t border-white/5 hover:bg-zinc-800/50 transition-colors"
                                            >
                                                {headers.slice(0, 5).map((h) => (
                                                    <td
                                                        key={h}
                                                        className="px-3 py-2 text-zinc-300 max-w-[180px] truncate"
                                                    >
                                                        {row[h]}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border-white/10 text-zinc-300 hover:bg-zinc-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleImport}
                            disabled={!rows.length || importing || imported}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                            {importing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {imported ? (
                                <>
                                    <CheckCircle2 className="h-4 w-4 mr-2" /> Imported!
                                </>
                            ) : (
                                `Import ${rows.length || ""} Campaign${rows.length !== 1 ? "s" : ""}`
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
