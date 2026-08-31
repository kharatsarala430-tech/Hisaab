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
  alert('DEBUG: drainQueue() called. navigator.onLine = ' + navigator.onLine) // TEMP DEBUG

  if (syncing) {
    alert('DEBUG: already syncing, exiting early') // TEMP DEBUG
    return
  }
  if (!navigator.onLine) {
    alert('DEBUG: navigator.onLine is false, exiting early') // TEMP DEBUG
    return
  }

  const queue = await getQueue()
  alert('DEBUG: queue length = ' + queue.length) // TEMP DEBUG

  if (queue.length === 0) {
    notify(await currentStatus())
    return
  }

  syncing = true
  notify(await currentStatus({ syncing: true }))

  for (const item of queue) {
    try {
      alert('DEBUG: trying item ' + item.queueId + ' action=' + item.action) // TEMP DEBUG
      if (item.action === 'add') {
        const { error } = await supabase.from('transactions').insert(item.payload)
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
      alert('DEBUG: item ' + item.queueId + ' synced OK') // TEMP DEBUG
    } catch (err) {
      // Network or server error — stop here, leave remaining items queued,
      // and try again on the next connectivity event.
      alert('DEBUG: SYNC FAILED for item ' + item.queueId + ' — ' + err.message) // TEMP DEBUG
      console.error('Sync failed for item', item.queueId, err.message)
      break
    }
  }

  syncing = false
  notify(await currentStatus({ syncing: false }))
}

export function initSyncManager() {
  if (initialized) {
    alert('DEBUG: initSyncManager already initialized, skipping') // TEMP DEBUG
    return
  }
  initialized = true

  window.addEventListener('online', () => {
    alert('DEBUG: "online" event fired!') // TEMP DEBUG
    notify({ online: true, pendingCount: 0, syncing: false })
    drainQueue()
  })
  window.addEventListener('offline', async () => {
    notify(await currentStatus({ online: false }))
  })

  alert('DEBUG: initSyncManager running, navigator.onLine = ' + navigator.onLine) // TEMP DEBUG

  // Attempt a drain immediately in case items were queued in a previous
  // session and connectivity is already back.
  if (navigator.onLine) {
    drainQueue()
  }
}
