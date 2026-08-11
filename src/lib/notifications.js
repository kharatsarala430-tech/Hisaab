import { LocalNotifications } from '@capacitor/local-notifications'

// Call this once when the app starts (e.g. in App.jsx's useEffect)
export async function requestNotificationPermission() {
  const { display } = await LocalNotifications.checkPermissions()

  if (display === 'granted') return true

  const { display: newStatus } = await LocalNotifications.requestPermissions()
  return newStatus === 'granted'
}

// Schedules a reminder notification for a planned payment / bill.
// billId is used to generate a unique, predictable notification id so we can cancel it later.
export async function scheduleBillReminder(bill) {
  const notificationId = billIdToNotificationId(bill.id)

  const dueDate = new Date(bill.due_date)
  const reminderDate = new Date(dueDate)
  reminderDate.setDate(reminderDate.getDate() - (bill.reminder_days_before || 2))
  reminderDate.setHours(9, 0, 0, 0) // 9 AM reminder

  // Don't schedule reminders in the past
  if (reminderDate.getTime() <= Date.now()) return

  await LocalNotifications.schedule({
    notifications: [
      {
        id: notificationId,
        title: `Upcoming: ${bill.name}`,
        body: bill.amount
          ? `₹${Number(bill.amount).toLocaleString()} due on ${dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
          : `Due on ${dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`,
        schedule: { at: reminderDate },
      },
    ],
  })
}

// Cancels a previously scheduled reminder (call this when a bill is deleted or marked paid)
export async function cancelBillReminder(billId) {
  const notificationId = billIdToNotificationId(billId)
  await LocalNotifications.cancel({ notifications: [{ id: notificationId }] })
}

// Capacitor notification ids must be integers, but our bill ids are uuids (strings).
// This turns any uuid string into a stable positive integer.
function billIdToNotificationId(uuid) {
  let hash = 0
  for (let i = 0; i < uuid.length; i++) {
    hash = (hash << 5) - hash + uuid.charCodeAt(i)
    hash |= 0 // keep it a 32-bit int
  }
  return Math.abs(hash)
}

