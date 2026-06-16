import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
const envPath = path.resolve(__dirname, "../.env");
let supabaseUrl = "";
let supabaseKey = "";

try {
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const parts = line.split("=");
      if (parts[0] === "VITE_SUPABASE_URL") {
        supabaseUrl = parts[1].trim();
      }
      // Prefer service role key if available, otherwise fallback to anon key for authenticated local testing
      if (parts[0] === "SUPABASE_SERVICE_ROLE_KEY") {
        supabaseKey = parts[1].trim();
      }
      if (!supabaseKey && parts[0] === "VITE_SUPABASE_ANON_KEY") {
        supabaseKey = parts[1].trim();
      }
    }
  }
} catch (e) {
  console.warn("Could not read .env file:", e.message);
}

// Fallback or override from process.env
supabaseUrl = process.env.SUPABASE_URL || supabaseUrl;
supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || supabaseKey;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Error: Supabase URL and Key are required. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment or .env file.",
  );
  process.exit(1);
}

console.log(`Using Supabase URL: ${supabaseUrl}`);
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
});

// Helper: Simple CSV parser that handles quotes and escape characters
function parseCSV(content) {
  const lines = content.split(/\r?\n/);
  const result = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    const row = [];
    let insideQuote = false;
    let entries = [];
    let currentEntry = "";

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === "," && !insideQuote) {
        entries.push(currentEntry.trim());
        currentEntry = "";
      } else {
        currentEntry += char;
      }
    }
    entries.push(currentEntry.trim());

    // Clean quotes from entries
    row.push(
      ...entries.map((val) => {
        if (val.startsWith('"') && val.endsWith('"')) {
          return val.slice(1, -1).replace(/""/g, '"');
        }
        return val;
      }),
    );

    result.push(row);
  }

  if (result.length === 0) return { headers: [], rows: [] };
  const headers = result[0];
  const rows = result.slice(1).map((row) => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || "";
    });
    return obj;
  });

  return { headers, rows };
}

async function importHospitals() {
  const filePath = path.resolve(__dirname, "../public/templates/hospitals.csv");
  if (!fs.existsSync(filePath)) {
    console.log("No hospitals.csv found in public/templates/ skipping...");
    return;
  }

  console.log("\n--- Importing Hospitals ---");
  const content = fs.readFileSync(filePath, "utf-8");
  const { rows } = parseCSV(content);

  // Fetch existing hospitals to check for duplicates
  const { data: existingHospitals, error } = await supabase.from("hospitals").select("id, name");

  if (error) {
    console.error("Failed to query existing hospitals:", error.message);
    return;
  }

  const existingNames = new Set(existingHospitals.map((h) => h.name.toLowerCase()));
  const existingIds = new Set(existingHospitals.map((h) => h.id));

  const toInsert = [];
  for (const row of rows) {
    if (!row.name) continue;

    const id = row.id || undefined;
    const name = row.name;

    if ((id && existingIds.has(id)) || existingNames.has(name.toLowerCase())) {
      console.log(`Skipping hospital "${name}" (already exists)`);
      continue;
    }

    toInsert.push({
      id: id || undefined,
      name,
      city: row.city || "Unknown",
      state: row.state || "",
      address: row.address || "",
      hospital_type: row.hospital_type || "General Hospital",
      description: row.description || "",
      rating: row.rating ? parseFloat(row.rating) : 4.5,
      total_reviews: row.total_reviews ? parseInt(row.total_reviews, 10) : 0,
      image_url: row.image_url || "",
      website: row.website || "",
      phone: row.phone || "",
    });
  }

  if (toInsert.length > 0) {
    console.log(`Inserting ${toInsert.length} new hospitals...`);
    const { error: insertError } = await supabase.from("hospitals").insert(toInsert);
    if (insertError) {
      console.error("Error inserting hospitals:", insertError.message);
    } else {
      console.log("Successfully imported hospitals!");
    }
  } else {
    console.log("No new hospitals to import.");
  }
}

async function importProcedures() {
  const filePath = path.resolve(__dirname, "../public/templates/procedures.csv");
  if (!fs.existsSync(filePath)) {
    console.log("No procedures.csv found in public/templates/ skipping...");
    return;
  }

  console.log("\n--- Importing Procedures ---");
  const content = fs.readFileSync(filePath, "utf-8");
  const { rows } = parseCSV(content);

  const { data: existingProcedures, error } = await supabase.from("procedures").select("id, name");

  if (error) {
    console.error("Failed to query existing procedures:", error.message);
    return;
  }

  const existingNames = new Set(existingProcedures.map((p) => p.name.toLowerCase()));
  const existingIds = new Set(existingProcedures.map((p) => p.id));

  const toInsert = [];
  for (const row of rows) {
    if (!row.name) continue;

    const id = row.id || undefined;
    const name = row.name;

    if ((id && existingIds.has(id)) || existingNames.has(name.toLowerCase())) {
      console.log(`Skipping procedure "${name}" (already exists)`);
      continue;
    }

    toInsert.push({
      id: id || undefined,
      name,
      category: row.category || "General",
      description: row.description || "",
    });
  }

  if (toInsert.length > 0) {
    console.log(`Inserting ${toInsert.length} new procedures...`);
    const { error: insertError } = await supabase.from("procedures").insert(toInsert);
    if (insertError) {
      console.error("Error inserting procedures:", insertError.message);
    } else {
      console.log("Successfully imported procedures!");
    }
  } else {
    console.log("No new procedures to import.");
  }
}

async function importHospitalProcedures() {
  const filePath = path.resolve(__dirname, "../public/templates/hospital_procedures.csv");
  if (!fs.existsSync(filePath)) {
    console.log("No hospital_procedures.csv found in public/templates/ skipping...");
    return;
  }

  console.log("\n--- Importing Hospital Procedures & Pricing ---");
  const content = fs.readFileSync(filePath, "utf-8");
  const { rows } = parseCSV(content);

  // Fetch existing associations
  const { data: existingRelations, error } = await supabase
    .from("hospital_procedures")
    .select("hospital_id, procedure_id");

  if (error) {
    console.error("Failed to query existing relations:", error.message);
    return;
  }

  const relationKeys = new Set(existingRelations.map((r) => `${r.hospital_id}_${r.procedure_id}`));

  // Fetch hospitals and procedures mapping to resolve human-readable names if IDs are missing or are names
  const { data: dbHospitals } = await supabase.from("hospitals").select("id, name");
  const { data: dbProcedures } = await supabase.from("procedures").select("id, name");

  const hospitalMap = {};
  dbHospitals?.forEach((h) => {
    hospitalMap[h.id] = h.id;
    hospitalMap[h.name.toLowerCase()] = h.id;
  });

  const procedureMap = {};
  dbProcedures?.forEach((p) => {
    procedureMap[p.id] = p.id;
    procedureMap[p.name.toLowerCase()] = p.id;
  });

  const toInsert = [];
  for (const row of rows) {
    const rawHospital = row.hospital_id || row.hospital_name || "";
    const rawProcedure = row.procedure_id || row.procedure_name || "";
    const priceStr = row.price || "";

    if (!rawHospital || !rawProcedure || !priceStr) {
      console.warn("Skipping invalid row:", row);
      continue;
    }

    const hospitalId = hospitalMap[rawHospital.toLowerCase()] || rawHospital;
    const procedureId = procedureMap[rawProcedure.toLowerCase()] || rawProcedure;
    const price = parseFloat(priceStr);

    if (isNaN(price)) {
      console.warn(`Skipping row with invalid price "${priceStr}":`, row);
      continue;
    }

    // Check UUID format before attempting insert
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(hospitalId) || !uuidRegex.test(procedureId)) {
      console.warn(
        `Skipping row due to unresolved UUID for hospital (${rawHospital} -> ${hospitalId}) or procedure (${rawProcedure} -> ${procedureId})`,
      );
      continue;
    }

    const relKey = `${hospitalId}_${procedureId}`;
    if (relationKeys.has(relKey)) {
      console.log(
        `Skipping pricing record for hospital_id: ${hospitalId}, procedure_id: ${procedureId} (already exists)`,
      );
      continue;
    }

    toInsert.push({
      hospital_id: hospitalId,
      procedure_id: procedureId,
      price,
      currency: row.currency || "INR",
    });
  }

  if (toInsert.length > 0) {
    console.log(`Inserting ${toInsert.length} pricing records...`);
    const { error: insertError } = await supabase.from("hospital_procedures").insert(toInsert);
    if (insertError) {
      console.error("Error inserting hospital procedures:", insertError.message);
    } else {
      console.log("Successfully imported pricing records!");
    }
  } else {
    console.log("No new pricing records to import.");
  }
}

async function main() {
  await importHospitals();
  await importProcedures();
  await importHospitalProcedures();
  console.log("\nImport process completed!");
}

main().catch((err) => {
  console.error("Import failed with exception:", err);
});
