/**
 * Hisaab — Spending Reflection Nudges
 * ---------------------------------------------------
 * Drop into src/utils/spendingNudges.js
 * Generates guilt-free, factual awareness messages — NOT shaming.
 * Tone rule: state the fact, never judge it. User decides what it means.
 *
 * Usage:
 *   import { getWeeklyNudge } from "../utils/spendingNudges";
 *   const nudge = getWeeklyNudge(thisWeekTransactions, lastWeekTransactions);
 *   // Show nudge.text in a small card/toast on Home screen
 */

// Same flexible field lookup used in exportCSV.js — keeps this working
// even if the actual column names differ slightly (e.g. "category_name").
function getField(t, keys) {
  for (const k of keys) {
    if (t[k] !== undefined && t[k] !== null) return t[k];
  }
  return undefined;
}

function sumByCategory(transactions) {
  const totals = {};
  for (const t of transactions) {
    const type = getField(t, ["type", "transaction_type"]);
    if (type !== "expense") continue;
    const category = getField(t, ["category", "category_name"]) || "Other";
    const amount = Number(getField(t, ["amount"]) || 0);
    totals[category] = (totals[category] || 0) + amount;
  }
  return totals;
}

function topCategory(totals) {
  const entries = Object.entries(totals);
  if (!entries.length) return null;
  return entries.reduce((max, curr) => (curr[1] > max[1] ? curr : max));
}

/**
 * Returns a single factual, non-judgemental nudge for the week.
 * Returns null if there isn't enough data to say anything meaningful.
 */
export function getWeeklyNudge(thisWeekTransactions = [], lastWeekTransactions = []) {
  if (!thisWeekTransactions.length) return null;

  const thisWeekTotals = sumByCategory(thisWeekTransactions);
  const lastWeekTotals = sumByCategory(lastWeekTransactions);
  const top = topCategory(thisWeekTotals);

  if (!top) return null;

  const [category, amount] = top;
  const lastAmount = lastWeekTotals[category] || 0;

  // Case 1: category increased vs last week — factual comparison, no judgement
  if (lastAmount > 0) {
    const diffPct = Math.round(((amount - lastAmount) / lastAmount) * 100);
    if (Math.abs(diffPct) >= 15) {
      const direction = diffPct > 0 ? "zyada" : "kam";
      return {
        type: "comparison",
        text: `Is hafte ${category} pe ₹${amount} gaya — pichle hafte se ${Math.abs(diffPct)}% ${direction}.`,
      };
    }
  }

  // Case 2: no meaningful comparison available — simple awareness statement
  return {
    type: "awareness",
    text: `Is hafte sabse zyada kharch ${category} pe hua — ₹${amount}.`,
  };
}

/**
 * Rules this module always follows (do not break these when editing):
 * 1. Never say "bahut zyada", "fizool", "bachao" or any judging word.
 * 2. Never compare the user to other users or an "ideal" number.
 * 3. Always state a fact (amount, %, category) — let the user draw their own conclusion.
 */
