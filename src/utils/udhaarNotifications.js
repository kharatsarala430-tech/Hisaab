import { LocalNotifications } from '@capacitor/local-notifications'

/**
 * Hisaab — Udhaar Reminder Notifications
 * ---------------------------------------------------
 * Save as: src/utils/udhaarNotifications.js
 *
 * Schedules two local notifications for an udhaar entry that has an
 * expected_return_date: one the day before, one on the day itself.
 * Both are cancelled automatically if the entry is deleted or settled.
 */

// Turns a uuid into a stable numeric ID, since Capacitor notification
// IDs must be numbers. Same entry always produces the same ID, so we
// can cancel its notifications later just by knowing the entry's id.
function idFromUuid(uuid) {
  let hash = 0
  for (let i = 0; i < uuid.length; i++) {
    hash = (hash << 5) - hash + uuid.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % 1000000
}

export async function scheduleUdhaarReminders(entry) {
  if (!entry.expected_return_date) return

  const REMINDER_HOUR = 9 // 9 AM local time
  const expectedAt = new Date(`${entry.expected_return_date}T${REMINDER_HOUR}:00:00`)
  const dayBeforeAt = new Date(expectedAt)
  dayBeforeAt.setDate(dayBeforeAt.getDate() - 1)

  const baseId = idFromUuid(entry.id)
  const direction = entry.type === 'lent'
    ? `${entry.person_name} se lena hai`
    : `${entry.person_name} ko dena hai`

  const notifications = []
  const now = new Date()

  if (dayBeforeAt > now) {
    notifications.push({
      id: baseId,
      title: 'Udhaar Reminder',
      body: `Kal ${direction} — ₹${entry.amount}`,
      schedule: { at: dayBeforeAt },
    })
  }
  if (expectedAt > now) {
    notifications.push({
      id: baseId + 1,
      title: 'Udhaar Reminder',
      body: `Aaj ${direction} — ₹${entry.amount}`,
      schedule: { at: expectedAt },
    })
  }

  if (notifications.length === 0) return

  try {
    await LocalNotifications.schedule({ notifications })
  } catch (err) {
    console.error('Failed to schedule udhaar reminder:', err)
  }
}

export async function cancelUdhaarReminders(entryId) {
  const baseId = idFromUuid(entryId)
  try {
    await LocalNotifications.cancel({
      notifications: [{ id: baseId }, { id: baseId + 1 }],
    })
  } catch (err) {
    console.error('Failed to cancel udhaar reminder:', err)
  }
}
