/**
 * Hisaab — CSV Export Utility
 * ---------------------------------------------------
 * Drop into src/utils/exportCSV.js
 * Works with Capacitor via the Filesystem + Share plugins.
 *
 * Usage:
 *   import { exportTransactionsToCSV } from "../utils/exportCSV";
 *   await exportTransactionsToCSV(transactions);
 *
 * Expects transactions like:
 *   { date: "2026-08-01", category: "Food", type: "expense", amount: 250, note: "Lunch" }
 */

import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

function escapeCSVField(field) {
  const str = String(field ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Tries a few common column-name variants so this keeps working even if
// your Supabase schema uses "description" instead of "note", etc.
function getField(t, keys) {
  for (const k of keys) {
    if (t[k] !== undefined && t[k] !== null) return t[k];
  }
  return "";
}

function transactionsToCSVString(transactions) {
  const headers = ["Date", "Category", "Type", "Amount", "Note"];
  const rows = transactions.map((t) =>
    [
      getField(t, ["date"]),
      getField(t, ["category", "category_name"]),
      getField(t, ["type", "transaction_type"]),
      getField(t, ["amount"]),
      getField(t, ["note", "notes", "description", "memo"]),
    ]
      .map(escapeCSVField)
      .join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

/**
 * Exports transactions as a CSV file and opens the native share sheet
 * so the user can save it to Drive, WhatsApp, email, etc.
 */
export async function exportTransactionsToCSV(transactions, fileName = "hisaab-transactions.csv") {
  if (!transactions?.length) {
    throw new Error("No transactions to export.");
  }

  const csvString = transactionsToCSVString(transactions);

  try {
    // Write to cache directory (temporary, app-accessible)
    const result = await Filesystem.writeFile({
      path: fileName,
      data: csvString,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    });

    // Open native share sheet
    await Share.share({
      title: "Hisaab — Transactions Export",
      text: "Your Hisaab transactions export",
      url: result.uri,
      dialogTitle: "Save or share your CSV",
    });

    return result.uri;
  } catch (err) {
    console.error("CSV export failed:", err);
    throw err;
  }
}
