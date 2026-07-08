import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { DashboardLayoutSkeleton } from "@/components/site/SkeletonLoader";
import { supabase } from "@/lib/supabase";
import { useHospitals } from "@/hooks/use-hospitals";
import {
  SlidersHorizontal,
  BadgeDollarSign,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Download,
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet,
  ArrowLeft,
  X,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const Route = createFileRoute("/dashboard/admin/pricing")({
  head: () => ({ meta: [{ title: "Manage Hospital Pricing — MediCompare" }] }),
  component: AdminPricingPage,
});

const navItems = [
  { title: "Dashboard", url: "/admin", icon: SlidersHorizontal },
  { title: "Pricing", url: "/dashboard/admin/pricing", icon: BadgeDollarSign },
];

function AdminPricingPage() {
  const { user: authUser, isLoggedIn, loading } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pricesList, setPricesList] = useState<any[]>([]);
  const [dbProcedures, setDbProcedures] = useState<any[]>([]);
  const [dbHospitals, setDbHospitals] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Form states
  const [targetPriceId, setTargetPriceId] = useState<string | null>(null);
  const [selectedHospitalId, setSelectedHospitalId] = useState("");
  const [selectedProcedureId, setSelectedProcedureId] = useState("");
  const [priceInput, setPriceInput] = useState("");

  // CSV parse state
  const [csvFileContent, setCsvFileContent] = useState<string>("");
  const [csvFileName, setCsvFileName] = useState("");
  const [importSummary, setImportSummary] = useState<{
    total: number;
    inserted: number;
    skipped: number;
    errors: string[];
  } | null>(null);

  // Check auth and fetch profile
  useEffect(() => {
    if (loading) return;
    if (!isLoggedIn) {
      navigate({ to: "/login", search: { redirect: "/dashboard/admin/pricing" } });
      return;
    }

    async function verifyRoleAndLoadData() {
      try {
        const {
          data: { user: sbUser },
        } = await supabase.auth.getUser();
        if (!sbUser) return;

        const { data: profData, error } = await supabase
          .from("profiles")
          .select("*, hospitals(*)")
          .eq("id", sbUser.id)
          .single();

        if (error || !profData) {
          toast.error("Error loading user profile permissions.");
          navigate({ to: "/dashboard" });
          return;
        }

        const role = profData.role;
        if (role !== "super_admin" && role !== "hospital_admin") {
          toast.error("Unauthorized. Only hospital admins or super admins can access this page.");
          navigate({ to: "/dashboard" });
          return;
        }

        setProfile(profData);
        setIsAdmin(true);

        // Fetch hospitals, procedures and current prices list
        await loadDatabaseData(profData);
      } catch (err) {
        console.error(err);
        toast.error("Failed to authenticate session.");
      }
    }

    verifyRoleAndLoadData();
  }, [isLoggedIn, authUser, loading, navigate]);

  const loadDatabaseData = async (userProfile: any) => {
    setLoadingData(true);
    try {
      // 1. Fetch hospitals (if super admin, all; if hospital admin, only theirs)
      let hospQuery = supabase.from("hospitals").select("*").order("name", { ascending: true });
      if (userProfile.role === "hospital_admin" && userProfile.hospital_id) {
        hospQuery = hospQuery.eq("id", userProfile.hospital_id);
      }
      const { data: hosps } = await hospQuery;
      setDbHospitals(hosps || []);

      // 2. Fetch all procedures
      const { data: procs } = await supabase
        .from("procedures")
        .select("*")
        .order("name", { ascending: true });
      setDbProcedures(procs || []);

      // 3. Fetch pricing mappings
      let pricingQuery = supabase
        .from("hospital_procedures")
        .select(
          `
          id,
          price,
          currency,
          hospital_id,
          procedure_id,
          hospitals (id, name, city),
          procedures (id, name, category)
        `,
        )
        .order("last_updated", { ascending: false });

      if (userProfile.role === "hospital_admin" && userProfile.hospital_id) {
        pricingQuery = pricingQuery.eq("hospital_id", userProfile.hospital_id);
      }

      const { data: pricingData, error } = await pricingQuery;
      if (error) throw error;
      setPricesList(pricingData || []);
    } catch (err: any) {
      console.error("Error loading database tables:", err.message);
      toast.error("Failed to load live database pricing. Please apply DDL migrations first.");
    } finally {
      setLoadingData(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHospitalId || !selectedProcedureId || !priceInput) {
      toast.error("Please fill in all fields.");
      return;
    }
    const price = parseFloat(priceInput);
    if (isNaN(price) || price < 0) {
      toast.error("Please enter a valid price.");
      return;
    }

    try {
      const { error } = await supabase.from("hospital_procedures").insert([
        {
          hospital_id: selectedHospitalId,
          procedure_id: selectedProcedureId,
          price,
          currency: "INR",
        },
      ]);

      if (error) {
        if (error.code === "23505") {
          toast.error("This procedure pricing is already mapped for this hospital.");
        } else {
          throw error;
        }
        return;
      }

      toast.success("Pricing added successfully!");
      setIsAddOpen(false);
      setSelectedProcedureId("");
      setPriceInput("");
      await loadDatabaseData(profile);
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const handleEditOpen = (priceRecord: any) => {
    setTargetPriceId(priceRecord.id);
    setSelectedHospitalId(priceRecord.hospital_id);
    setSelectedProcedureId(priceRecord.procedure_id);
    setPriceInput(priceRecord.price.toString());
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPriceId || !priceInput) return;
    const price = parseFloat(priceInput);
    if (isNaN(price) || price < 0) {
      toast.error("Please enter a valid price.");
      return;
    }

    try {
      const { error } = await supabase
        .from("hospital_procedures")
        .update({ price, last_updated: new Date().toISOString() })
        .eq("id", targetPriceId);

      if (error) throw error;

      toast.success("Pricing updated successfully!");
      setIsEditOpen(false);
      setTargetPriceId(null);
      setPriceInput("");
      await loadDatabaseData(profile);
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this pricing record?")) return;
    try {
      const { error } = await supabase.from("hospital_procedures").delete().eq("id", id);
      if (error) throw error;
      toast.success("Pricing record deleted.");
      await loadDatabaseData(profile);
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  // Client-side CSV Parser
  const parseCSVRows = (content: string) => {
    const lines = content.split(/\r?\n/);
    const result: any[] = [];
    if (lines.length === 0) return result;

    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values: string[] = [];
      let currentVal = "";
      let inQuotes = false;
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(currentVal.trim());
          currentVal = "";
        } else {
          currentVal += char;
        }
      }
      values.push(currentVal.trim());

      const obj: any = {};
      headers.forEach((header, idx) => {
        let val = values[idx] || "";
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.slice(1, -1);
        }
        obj[header] = val;
      });
      result.push(obj);
    }
    return result;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvFileContent(text);
    };
    reader.readAsText(file);
  };

  const handleCsvImportSubmit = async () => {
    if (!csvFileContent) {
      toast.error("Please select or drop a valid CSV file first.");
      return;
    }

    try {
      const rows = parseCSVRows(csvFileContent);
      if (rows.length === 0) {
        toast.error("CSV file is empty or headers are missing.");
        return;
      }

      let insertedCount = 0;
      let skippedCount = 0;
      const errorMsgs: string[] = [];

      // Maps names to IDs for fast resolving
      const hospitalMap: Record<string, string> = {};
      dbHospitals.forEach((h) => {
        hospitalMap[h.id] = h.id;
        hospitalMap[h.name.toLowerCase()] = h.id;
      });

      const procedureMap: Record<string, string> = {};
      dbProcedures.forEach((p) => {
        procedureMap[p.id] = p.id;
        procedureMap[p.name.toLowerCase()] = p.id;
      });

      // Query existing mappings
      const { data: existingRelations } = await supabase
        .from("hospital_procedures")
        .select("hospital_id, procedure_id");

      const relationKeys = new Set(
        (existingRelations || []).map((r) => `${r.hospital_id}_${r.procedure_id}`),
      );

      const toInsert: any[] = [];

      for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        const rawHosp = row.hospital_id || row.hospital_name || "";
        const rawProc = row.procedure_id || row.procedure_name || "";
        const priceStr = row.price || "";

        if (!rawHosp || !rawProc || !priceStr) {
          skippedCount++;
          errorMsgs.push(`Row ${index + 2}: Missing hospital, procedure or price columns.`);
          continue;
        }

        const hospitalId = hospitalMap[rawHosp.toString().toLowerCase()] || rawHosp;
        const procedureId = procedureMap[rawProc.toString().toLowerCase()] || rawProc;
        const price = parseFloat(priceStr);

        if (isNaN(price) || price < 0) {
          skippedCount++;
          errorMsgs.push(`Row ${index + 2}: Invalid price value "${priceStr}".`);
          continue;
        }

        // Validate UUIDs
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(hospitalId) || !uuidRegex.test(procedureId)) {
          skippedCount++;
          errorMsgs.push(
            `Row ${index + 2}: Could not resolve hospital (${rawHosp}) or procedure (${rawProc}) to valid database IDs.`,
          );
          continue;
        }

        // Check if admin is restricted to their hospital
        if (profile.role === "hospital_admin" && hospitalId !== profile.hospital_id) {
          skippedCount++;
          errorMsgs.push(
            `Row ${index + 2}: Forbidden. You are only authorized to import pricing for your own hospital.`,
          );
          continue;
        }

        const relKey = `${hospitalId}_${procedureId}`;
        if (relationKeys.has(relKey)) {
          skippedCount++;
          continue; // Duplicate record
        }

        toInsert.push({
          hospital_id: hospitalId,
          procedure_id: procedureId,
          price,
          currency: row.currency || "INR",
        });
      }

      if (toInsert.length > 0) {
        const { error } = await supabase.from("hospital_procedures").insert(toInsert);
        if (error) {
          errorMsgs.push(`Database Insertion Error: ${error.message}`);
          skippedCount += toInsert.length;
        } else {
          insertedCount += toInsert.length;
        }
      }

      setImportSummary({
        total: rows.length,
        inserted: insertedCount,
        skipped: skippedCount,
        errors: errorMsgs,
      });

      if (insertedCount > 0) {
        toast.success(`Import completed successfully! Upserted ${insertedCount} pricing records.`);
      } else {
        toast.warning("Import process completed. No new pricing records were added.");
      }

      await loadDatabaseData(profile);
    } catch (err: any) {
      toast.error(`Import execution failed: ${err.message}`);
    }
  };

  const resetImportDialog = () => {
    setCsvFileName("");
    setCsvFileContent("");
    setImportSummary(null);
  };

  if (loading || loadingData) {
    return <DashboardLayoutSkeleton />;
  }

  if (!isLoggedIn || !isAdmin || !profile) {
    return null;
  }

  const user = {
    name: authUser?.name ?? "Hospital Admin",
    role: profile.role === "super_admin" ? "Super Admin" : "Hospital Admin",
    avatar: authUser?.avatar ?? "https://i.pravatar.cc/120?img=64",
  };

  return (
    <DashboardShell items={navItems} label="Hospital Pricing Portal" user={user}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => navigate({ to: "/admin" })}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold md:text-3xl">Pricing Database</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground pl-10">
            {profile.role === "super_admin"
              ? "All pricing associations across procedures."
              : `Managing pricing for ${profile.hospitals?.name || "assigned hospital"}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            className="rounded-full gap-1.5"
            onClick={() => {
              resetImportDialog();
              setIsImportOpen(true);
            }}
          >
            <Upload className="h-4 w-4" /> Import CSV
          </Button>
          <Button
            className="rounded-full gap-1.5 bg-primary-gradient"
            onClick={() => {
              setSelectedHospitalId(dbHospitals[0]?.id || "");
              setSelectedProcedureId(dbProcedures[0]?.id || "");
              setPriceInput("");
              setIsAddOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Add pricing
          </Button>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hospital</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Procedure</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pricesList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No pricing records found. Try adding mappings or importing template CSVs.
                  </TableCell>
                </TableRow>
              ) : (
                pricesList.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-semibold">{record.hospitals?.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {record.hospitals?.city}
                    </TableCell>
                    <TableCell className="font-medium">{record.procedures?.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="rounded-full text-[10px] uppercase font-bold"
                      >
                        {record.procedures?.category || "General"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      ₹{Number(record.price).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleEditOpen(record)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(record.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Dialog: Add Pricing */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Procedure Pricing</DialogTitle>
            <DialogDescription>
              Associate a procedure to a hospital with a specific pricing schema.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4 pt-4">
            <div>
              <Label>Hospital</Label>
              <Select
                value={selectedHospitalId}
                onValueChange={setSelectedHospitalId}
                disabled={profile.role === "hospital_admin"}
              >
                <SelectTrigger className="mt-1.5 rounded-xl">
                  <SelectValue placeholder="Select hospital" />
                </SelectTrigger>
                <SelectContent>
                  {dbHospitals.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name} ({h.city})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Procedure / Service</Label>
              <Select value={selectedProcedureId} onValueChange={setSelectedProcedureId}>
                <SelectTrigger className="mt-1.5 rounded-xl">
                  <SelectValue placeholder="Select procedure" />
                </SelectTrigger>
                <SelectContent>
                  {dbProcedures.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.category || "General"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Price (INR ₹)</Label>
              <Input
                type="number"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                placeholder="e.g. 5400"
                className="mt-1.5 rounded-xl"
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary-gradient">
                Add Record
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Edit Pricing */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Procedure Price</DialogTitle>
            <DialogDescription>
              Modify pricing schemas for dynamic hospital listings.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
            <div>
              <Label>Hospital</Label>
              <Input
                value={dbHospitals.find((h) => h.id === selectedHospitalId)?.name || ""}
                disabled
                className="mt-1.5 rounded-xl bg-secondary"
              />
            </div>
            <div>
              <Label>Procedure</Label>
              <Input
                value={dbProcedures.find((p) => p.id === selectedProcedureId)?.name || ""}
                disabled
                className="mt-1.5 rounded-xl bg-secondary"
              />
            </div>
            <div>
              <Label>Price (INR ₹)</Label>
              <Input
                type="number"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                placeholder="e.g. 6000"
                className="mt-1.5 rounded-xl"
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary-gradient">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: CSV Importer */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>CSV Price Importer</DialogTitle>
            <DialogDescription>
              Upload pricing configurations in bulk using CSV templates.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            <div className="rounded-xl border border-dashed border-border bg-secondary/20 p-6 text-center">
              <FileSpreadsheet className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm font-semibold">Drag and drop hospital_procedures.csv</p>
              <p className="text-xs text-muted-foreground mt-1">
                Or click to select files from your computer
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-file-input"
              />
              <Button
                asChild
                size="sm"
                variant="outline"
                className="mt-4 rounded-full cursor-pointer"
              >
                <label htmlFor="csv-file-input">Select File</label>
              </Button>
              {csvFileName && (
                <div className="mt-3 text-xs font-semibold text-primary flex items-center justify-center gap-1.5">
                  <CheckCircle className="h-4 w-4" /> {csvFileName}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs border border-border rounded-xl p-4 bg-card">
              <div>
                <p className="font-bold">Need templates?</p>
                <p className="text-muted-foreground">
                  Download templates to ensure proper database schema mapping.
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-full text-[11px] h-8"
                >
                  <a href="/templates/hospital_procedures.csv" download>
                    <Download className="h-3 w-3 mr-1" /> Pricing CSV
                  </a>
                </Button>
              </div>
            </div>

            {importSummary && (
              <div className="rounded-xl border border-border p-4 bg-secondary/20 space-y-2 text-xs">
                <p className="font-bold text-sm">Import Results Summary:</p>
                <div className="grid grid-cols-3 gap-2 py-1 text-center font-bold">
                  <div className="bg-card rounded-lg p-2 border border-border">
                    <p className="text-muted-foreground">Total Rows</p>
                    <p className="text-base text-foreground mt-0.5">{importSummary.total}</p>
                  </div>
                  <div className="bg-card rounded-lg p-2 border border-border text-success">
                    <p className="text-muted-foreground">Inserted</p>
                    <p className="text-base mt-0.5">{importSummary.inserted}</p>
                  </div>
                  <div className="bg-card rounded-lg p-2 border border-border text-warning">
                    <p className="text-muted-foreground">Skipped</p>
                    <p className="text-base mt-0.5">{importSummary.skipped}</p>
                  </div>
                </div>

                {importSummary.errors.length > 0 && (
                  <div className="pt-2">
                    <p className="font-bold text-destructive flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" /> Validation Warnings (
                      {importSummary.errors.length}):
                    </p>
                    <div className="max-h-24 overflow-y-auto mt-1 p-2 bg-card rounded border border-border text-destructive font-mono text-[10px] space-y-1">
                      {importSummary.errors.slice(0, 10).map((err, i) => (
                        <div key={i}>• {err}</div>
                      ))}
                      {importSummary.errors.length > 10 && (
                        <div className="text-muted-foreground italic">
                          ...and {importSummary.errors.length - 10} more warnings
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetImportDialog();
                  setIsImportOpen(false);
                }}
              >
                Close
              </Button>
              <Button
                type="button"
                className="bg-primary-gradient"
                disabled={!csvFileContent || !!importSummary}
                onClick={handleCsvImportSubmit}
              >
                Execute Import
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
