import localforage from 'localforage'

/**
 * Hisaab — Offline Store
 * ---------------------------------------------------
 * Save as: src/lib/offlineStore.js
 * Requires: `npm install localforage`
 *
 * Two separate localforage instances:
 *   - txCache  -> the last known full list of transactions, so the app
 *                 has something to show immediately on cold start offline.
 *   - syncQueue -> pending actions (add/delete) that happened while
 *                 offline and still need to reach Supabase.
 *
 * Everything here is plain data in/out — no React, no Supabase calls.
 * syncManager.js is the layer that actually talks to Supabase using
 * this queue.
 */

const txCache = localforage.createInstance({ name: 'hisaab', storeName: 'tx_cache' })
const syncQueue = localforage.createInstance({ name: 'hisaab', storeName: 'sync_queue' })

const CACHE_KEY = 'transactions'

/* ---------- Transaction cache (what the UI reads on load) ---------- */

export async function getCachedTransactions() {
  const data = await txCache.getItem(CACHE_KEY)
  return data || []
}

export async function setCachedTransactions(transactions) {
  await txCache.setItem(CACHE_KEY, transactions)
}

/* ---------- Sync queue (pending add/delete actions) ---------- */

// A queued item looks like:
//   { queueId, action: 'add' | 'delete', localId, payload, createdAt }
// `localId` links a queued 'add' to the temporary transaction shown in the
// UI before it has a real Supabase id — see addTransactionOffline() below.

export async function getQueue() {
  const items = []
  await syncQueue.iterate((value) => {
    items.push(value)
  })
  // Oldest first, so actions replay in the order the user made them.
  return items.sort((a, b) => a.createdAt - b.createdAt)
}

export async function enqueue(item) {
  const queueId = `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const record = { ...item, queueId, createdAt: Date.now() }
  await syncQueue.setItem(queueId, record)
  return record
}

export async function removeFromQueue(queueId) {
  await syncQueue.removeItem(queueId)
}

export async function getQueueLength() {
  return syncQueue.length()
}

/* ---------- Local-id helper ---------- */

// Temporary id for a transaction created while offline. Prefixed so it's
// unmistakably not a real Supabase id — used to find-and-replace the row
// once the real insert succeeds after coming back online.
export function makeLocalId() {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function isLocalId(id) {
  return typeof id === 'string' && id.startsWith('local_')
}
