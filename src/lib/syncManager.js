import { supabase } from './supabase'
import { getQueue, removeFromQueue, getQueueLength } from './offlineStore'

/**
 * Hisaab — Sync Manager
 * ---------------------------------------------------
 * Save as: src/lib/syncManager.js
 *
 * Owns exactly one job: when the device is online, drain the pending
 * sync queue against Supabase, one item at a time, oldest first.
 *
 * Usage (typically from Dashboard.jsx):
 *   import { initSyncManager, onSyncStatusChange } from '../lib/syncManager'
 *   useEffect(() => {
 *     const unsubscribe = onSyncStatusChange((status) => setSyncStatus(status))
 *     initSyncManager()
 *     return unsubscribe
 *   }, [])
 *
 * `status` shape: { online: boolean, pendingCount: number, syncing: boolean }
 */

let listeners = []
let syncing = false
let initialized = false

function notify(status) {
  listeners.forEach((fn) => fn(status))
}

async function currentStatus(extra = {}) {
  const pendingCount = await getQueueLength()
  return { online: navigator.onLine, pendingCount, syncing, ...extra }
}

export function onSyncStatusChange(fn) {
  listeners.push(fn)
  return () => {
    listeners = listeners.filter((l) => l !== fn)
  }
}

// Processes every queued action in order. Stops and keeps the remaining
// queue intact if a network error interrupts it partway through — those
// items get retried on the next online event or manual sync call.
export async function drainQueue() {
  if (syncing) return // already draining — avoid overlapping runs
  if (!navigator.onLine) return

  const queue = await getQueue()
  if (queue.length === 0) {
    notify(await currentStatus())
    return
  }

  syncing = true
  notify(await currentStatus({ syncing: true }))

  for (const item of queue) {
    try {
      if (item.action === 'add') {
        // Strip _localId before sending to Supabase — it's a UI-only
        // marker used to find-and-replace the temporary row once synced,
        // not a real column in the transactions table.
        const { _localId, ...cleanPayload } = item.payload
        const { error } = await supabase.from('transactions').insert(cleanPayload)
        if (error) throw error
      } else if (item.action === 'delete') {
        // If the transaction being deleted was itself never synced (its id
        // was only ever local), there's nothing to delete on the server —
        // just drop this queue item.
        if (!item.payload.wasSynced) {
          await removeFromQueue(item.queueId)
          continue
        }
        const { error } = await supabase.from('transactions').delete().eq('id', item.payload.id)
        if (error) throw error
      }
      await removeFromQueue(item.queueId)
    } catch (err) {
      // Network or server error — stop here, leave remaining items queued,
      // and try again on the next connectivity event.
      console.error('Sync failed for item', item.queueId, err.message)
      break
    }
  }

  syncing = false
  notify(await currentStatus({ syncing: false }))
}

export function initSyncManager() {
  if (initialized) return // avoid attaching duplicate listeners across re-renders
  initialized = true

  window.addEventListener('online', () => {
    notify({ online: true, pendingCount: 0, syncing: false })
    drainQueue()
  })
  window.addEventListener('offline', async () => {
    notify(await currentStatus({ online: false }))
  })

  // Attempt a drain immediately in case items were queued in a previous
  // session and connectivity is already back.
  if (navigator.onLine) {
    drainQueue()
  }
}
