import { LocalNotifications } from '@capacitor/local-notifications'

/**
 * Hisaab — EMI Reminder Notifications
 * ---------------------------------------------------
 * Save as: src/utils/emiNotifications.js
 *
 * Unlike Udhaar reminders (one-time), EMIs repeat every month — so this
 * uses Capacitor's built-in monthly-repeat schedule (`on: { day }`)
 * instead of scheduling a single date. Set once, fires every month
 * automatically, no need to reschedule after each payment.
 */

function idFromUuid(uuid) {
  let hash = 0
  for (let i = 0; i < uuid.length; i++) {
    hash = (hash << 5) - hash + uuid.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % 1000000
}

const REMINDER_HOUR = 9 // 9 AM local time

export async function scheduleEmiReminders(emi) {
  const dueDay = Number(emi.due_day)
  if (!dueDay || dueDay < 1 || dueDay > 31) return

  // Edge case: if EMI is due on the 1st, "day before" would be the last day
  // of the previous month — which varies (28/29/30/31). Using day 28 keeps
  // it simple and guarantees the reminder fires in every month.
  const dayBefore = dueDay === 1 ? 28 : dueDay - 1

  const baseId = idFromUuid(emi.id)

  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: baseId,
          title: 'EMI Reminder',
          body: `Kal "${emi.loan_name}" ki EMI due hai — ₹${emi.monthly_installment}`,
          schedule: {
            on: { day: dayBefore, hour: REMINDER_HOUR, minute: 0 },
            allowWhileIdle: true,
          },
        },
        {
          id: baseId + 1,
          title: 'EMI Reminder',
          body: `Aaj "${emi.loan_name}" ki EMI due hai — ₹${emi.monthly_installment}`,
          schedule: {
            on: { day: dueDay, hour: REMINDER_HOUR, minute: 0 },
            allowWhileIdle: true,
          },
        },
      ],
    })
  } catch (err) {
    console.error('Failed to schedule EMI reminder:', err)
  }
}

export async function cancelEmiReminders(emiId) {
  const baseId = idFromUuid(emiId)
  try {
    await LocalNotifications.cancel({
      notifications: [{ id: baseId }, { id: baseId + 1 }],
    })
  } catch (err) {
    console.error('Failed to cancel EMI reminder:', err)
  }
}
